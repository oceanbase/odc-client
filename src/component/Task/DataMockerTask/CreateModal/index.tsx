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
import { ConnectionMode, TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, message, Modal, Space } from 'antd';
import { DrawerProps } from 'antd/es/drawer';
import { FormInstance } from 'antd/es/form/Form';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useRef, useState } from 'react';
import DataMockerForm, { converFormToServerData } from './form';
import { IMockFormData } from './type';

interface IProps extends Pick<DrawerProps, 'visible'> {
  modalStore?: ModalStore;
  projectId?: number;
}

const CreateModal: React.FC<IProps> = inject('modalStore')(
  observer((props) => {
    const { modalStore, projectId } = props;
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [dbMode, setDbMode] = useState<ConnectionMode>(null);
    const formRef = useRef<FormInstance<IMockFormData>>(null);
    const onClose = useCallback(() => {
      modalStore.changeDataMockerModal(false, null);
    }, [modalStore]);

    const closeWithConfirm = useCallback(() => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.DataMockerDrawer.AreYouSureYouWant',
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

    return (
      <Drawer
        open={modalStore.dataMockerVisible}
        onClose={closeWithConfirm}
        destroyOnClose
        width={960}
        className="o-adaptive-drawer"
        title={formatMessage({
          id: 'odc.component.DataMockerDrawer.CreateSimulationData',
        })} /*新建模拟数据*/
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={closeWithConfirm}>
              {
                formatMessage({
                  id: 'odc.component.DataMockerDrawer.Cancel',
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
                    message.warn(
                      formatMessage(
                        {
                          id: 'odc.component.DataMockerDrawer.TheFieldEditingcolumncolumnnameIsBeing',
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
                        id: 'odc.component.DataMockerDrawer.CreatedSuccessfully',
                      }),
                      // 创建成功！
                    );
                    onClose();
                    openTasksPage(TaskPageType.DATAMOCK, TaskPageScope.CREATED_BY_CURRENT_USER);
                  }
                } catch (e) {
                  console.log(e);
                }
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.DataMockerDrawer.Submitted',
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
        />
      </Drawer>
    );
  }),
);

export default CreateModal;
