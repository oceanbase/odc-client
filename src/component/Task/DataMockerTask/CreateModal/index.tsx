/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createTask } from '@/common/network/task';
import {
  ConnectionMode,
  IServerMockTable,
  TaskExecStrategy,
  TaskPageScope,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, message, Modal, Space } from 'antd';
import { DrawerProps } from 'antd/es/drawer';
import { FormInstance } from 'antd/es/form/Form';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DataMockerForm, { converFormToServerData } from './form';
import { IMockFormData } from './type';
import dayjs from 'dayjs';
import { columnTypeToRuleMap, RuleItem } from './type';
import { getDefaultRuleByGenerator } from './RuleContent';

interface IProps extends Pick<DrawerProps, 'visible'> {
  modalStore?: ModalStore;
  projectId?: number;
}

const CreateModal: React.FC<IProps> = inject('modalStore')(
  observer((props) => {
    const { modalStore, projectId } = props;
    const { dataMockerData } = modalStore;
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [dbMode, setDbMode] = useState<ConnectionMode>(null);
    const formRef = useRef<FormInstance<IMockFormData>>(null);
    const [ruleConfigList, setRuleConfigList] = useState([]);

    const loadEditData = async () => {
      const { task } = dataMockerData;

      const { description, executionStrategy, executionTime } = task;
      const taskDetail = task?.parameters?.taskDetail ?? null;
      const databaseId = task?.database?.id ?? null;
      const taskDetailObj: {
        tables: IServerMockTable;
      } = JSON.parse(taskDetail);
      const { tableName, whetherTruncate, totalCount, strategy, batchSize, columns } =
        taskDetailObj?.tables?.[0] ?? {};
      setRuleConfigList(
        columns?.map((item) => {
          const { typeConfig } = item;
          let range = [typeConfig.lowValue, typeConfig.highValue];
          let rule = getDefaultRuleByGenerator(
            typeConfig?.generator,
            typeConfig?.columnType,
            task.database.dialectType,
          );
          const ruleItem = columnTypeToRuleMap[task.database.dialectType][typeConfig?.columnType];
          switch (ruleItem) {
            case RuleItem.DATE: {
              range = [dayjs(typeConfig.lowValue), dayjs(typeConfig.highValue)];
              break;
            }
          }
          return {
            ...item,
            range,
            rule,
          };
        }) || [],
      );

      const formData = {
        databaseId,
        tableName,
        whetherTruncate,
        totalCount,
        strategy,
        batchSize,
        executionStrategy,
        executionTime:
          executionTime && executionTime > new Date().getTime() ? dayjs(executionTime) : null,
        description,
        columns,
      };
      formRef.current?.setFieldsValue(formData);
    };

    const onClose = useCallback(() => {
      modalStore.changeDataMockerModal(false, null);
    }, [modalStore]);

    const closeWithConfirm = useCallback(() => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.DataMockerDrawer.AreYouSureYouWant',
          defaultMessage: '是否确定取消模拟数据？',
        }),
        // 确认取消模拟数据吗？
        centered: true,
        onOk() {
          onClose();
        },
      });
    }, [onClose]);

    const handleDbModeChange = (mode: ConnectionMode) => {
      setDbMode(mode);
    };

    useEffect(() => {
      if (dataMockerData?.task) {
        loadEditData();
      }
    }, [dataMockerData]);

    return (
      <Drawer
        open={modalStore.dataMockerVisible}
        onClose={closeWithConfirm}
        destroyOnClose
        width={960}
        rootClassName="o-adaptive-drawer"
        title={formatMessage({
          id: 'src.component.Task.DataMockerTask.CreateModal.2C3DF5A5',
          defaultMessage: '新建模拟数据',
        })}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={closeWithConfirm}>
              {
                formatMessage({
                  id: 'odc.component.DataMockerDrawer.Cancel',
                  defaultMessage: '取消',
                })
                /* 取消 */
              }
            </Button>
            <Button
              type="primary"
              loading={confirmLoading}
              onClick={async () => {
                try {
                  const values = await formRef.current.validateFields();

                  const editingColumn = values?.columns?.find((c) => {
                    return c.typeConfig?._isEditing;
                  });
                  if (editingColumn) {
                    message.warning(
                      formatMessage(
                        {
                          id: 'odc.component.DataMockerDrawer.TheFieldEditingcolumncolumnnameIsBeing',
                          defaultMessage: '字段{editingColumnColumnName}正在编辑中',
                        },

                        { editingColumnColumnName: editingColumn.columnName },
                      ),
                      // `字段${editingColumn.columnName}正在编辑中`
                    );
                    return;
                  } else if (!values?.columns?.length) {
                    return;
                  }
                  setConfirmLoading(true);
                  const {
                    databaseName,
                    databaseId,
                    executionStrategy,
                    executionTime,
                    description,
                    ...rest
                  } = values;
                  const serverData = converFormToServerData(rest as any, dbMode, databaseName);

                  const isSuccess = await createTask({
                    projectId,
                    databaseId,
                    executionStrategy,
                    executionTime:
                      executionStrategy === TaskExecStrategy.TIMER ? executionTime : undefined,
                    taskType: TaskType.DATAMOCK,
                    parameters: {
                      taskDetail: JSON.stringify(serverData),
                    },
                    description,
                  });

                  setConfirmLoading(false);
                  if (isSuccess) {
                    message.success(
                      formatMessage({
                        id: 'src.component.Task.DataMockerTask.CreateModal.753EA4C0' /*'工单创建成功'*/,
                        defaultMessage: '工单创建成功',
                      }),
                    );
                    onClose();
                    openTasksPage(TaskPageType.DATAMOCK, TaskPageScope.CREATED_BY_CURRENT_USER);
                  }
                } catch (e) {
                  formRef?.current?.scrollToField(e?.errorFields?.[0]?.name);

                  console.log(e);
                }
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.DataMockerDrawer.Submitted',
                  defaultMessage: '提交',
                })
                /* 提交 */
              }
            </Button>
          </Space>
        }
      >
        <DataMockerForm
          tableName={modalStore.dataMockerData?.tableName}
          dbId={modalStore.dataMockerData?.databaseId}
          projectId={projectId}
          onDbModeChange={handleDbModeChange}
          ref={formRef}
          ruleConfigList={ruleConfigList}
        />
      </Drawer>
    );
  }),
);

export default CreateModal;
