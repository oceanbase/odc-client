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

import { getDatabase } from '@/common/network/database';
import { createStructureComparisonTask, getTaskDetail } from '@/common/network/task';
import FormItemPanel from '@/component/FormItemPanel';
import {
  ConnectionMode,
  CreateStructureComparisonTaskRecord,
  IStructureComparisonTaskParams,
  TaskDetail,
  TaskExecStrategy,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { EComparisonScope } from '@/d.ts/task';
import { openTasksPage } from '@/store/helper/page/openPage';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Button, Drawer, Form, Input, message, Modal, Radio, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { getTaskExecStrategyMap } from '../..';
import DatabaseSelect from '../../component/DatabaseSelect';
import { comparisonScopeMap } from './interface';
import TableSelector from './TableSelector';
interface IProps {
  projectId?: number;
  modalStore?: ModalStore;
}

const StructureComparisonTask: React.FC<IProps> = ({ projectId, modalStore }) => {
  const { structureComparisonVisible, structureComparisonTaskData } = modalStore;

  const [form] = useForm<CreateStructureComparisonTaskRecord>();
  const taskExecStrategyMap = getTaskExecStrategyMap(TaskType.STRUCTURE_COMPARISON);
  const sourceDatabaseId = Form.useWatch(['parameters', 'sourceDatabaseId'], form);
  const targetDatabaseId = Form.useWatch(['parameters', 'targetDatabaseId'], form);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  async function handleSubmit() {
    const rawData = await form.validateFields().catch();
    setConfirmLoading(true);
    rawData.taskType = TaskType.STRUCTURE_COMPARISON;
    const result = await createStructureComparisonTask(rawData);
    setConfirmLoading(false);
    if (result) {
      message.success(
        formatMessage({
          id: 'src.component.Task.StructureComparisonTask.CreateModal.1E436045' /*'工单创建成功'*/,
          defaultMessage: '工单创建成功',
        }),
      );
      modalStore.changeStructureComparisonModal(false);
      openTasksPage(TaskPageType.STRUCTURE_COMPARISON);
      return;
    }
    message.error(
      formatMessage({
        id: 'src.component.Task.StructureComparisonTask.CreateModal.B4FAB9EC' /*'新建失败'*/,
        defaultMessage: '新建失败',
      }),
    );
  }

  const { data: database, run } = useRequest(getDatabase, {
    manual: true,
  });
  const handleFieldsChange = () => {
    setHasEdit(true);
  };
  const handleReset = () => {
    form?.resetFields();
    setHasEdit(false);
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'src.component.Task.StructureComparisonTask.CreateModal.738226AC',
          defaultMessage: '确认取消创建结构比对吗？',
        }), //'确认取消此 结构比对吗？'
        centered: true,
        zIndex: 1002,
        onOk: () => {
          modalStore.changeStructureComparisonModal(false);
        },
      });
    } else {
      modalStore.changeStructureComparisonModal(false);
    }
  };
  const resetTargetDatabase = async () => {
    await form.setFieldValue(['parameters', 'targetDatabaseId'], null);
  };
  useEffect(() => {
    if (!structureComparisonVisible) {
      handleReset();
    }
  }, [structureComparisonVisible]);
  useEffect(() => {
    if (sourceDatabaseId) {
      run(sourceDatabaseId);
      targetDatabaseId && resetTargetDatabase();
    }
  }, [sourceDatabaseId]);

  useEffect(() => {
    const databaseId = structureComparisonTaskData?.databaseId;
    const taskId = structureComparisonTaskData?.taskId;
    if (databaseId) {
      form.setFieldValue(['parameters', 'sourceDatabaseId'], databaseId);
    }
    if (taskId) {
      getTaskDetailValue(taskId);
    }
  }, [structureComparisonTaskData?.databaseId, structureComparisonTaskData?.taskId]);

  const getTaskDetailValue = async (taskId: number) => {
    const detailRes = (await getTaskDetail(taskId)) as TaskDetail<IStructureComparisonTaskParams>;

    form.setFieldValue(['parameters', 'targetDatabaseId'], detailRes?.relatedDatabase?.id);
    form.setFieldValue('description', detailRes?.description);
    form.setFieldValue('executionStrategy', detailRes?.executionStrategy);
    form.setFieldValue(
      ['parameters', 'tableNamesToBeCompared'],
      detailRes?.parameters?.tableNamesToBeCompared,
    );
  };

  return (
    <Drawer
      open={structureComparisonVisible}
      title={formatMessage({
        id: 'src.component.Task.StructureComparisonTask.CreateModal.45DB3909',
        defaultMessage: '新建结构比对',
      })}
      zIndex={1001}
      width={720}
      closable
      onClose={() => handleCancel(hasEdit)}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={() => handleCancel(hasEdit)}>
              {
                formatMessage({
                  id: 'src.component.Task.StructureComparisonTask.CreateModal.A8C717F6' /*取消*/,
                  defaultMessage: '取消',
                }) /* 取消 */
              }
            </Button>
            <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
              {
                formatMessage({
                  id: 'src.component.Task.StructureComparisonTask.CreateModal.F516C53B' /*新建*/,
                  defaultMessage: '新建',
                }) /* 新建 */
              }
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          parameters: {
            comparisonScope: EComparisonScope.PART,
          },
          executionStrategy: TaskExecStrategy.AUTO,
        }}
        onFieldsChange={handleFieldsChange}
      >
        <Form.Item noStyle>
          <DatabaseSelect
            name={['parameters', 'sourceDatabaseId']}
            width={'336px'}
            type={TaskType.STRUCTURE_COMPARISON}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.CreateModal.1D072B46',
                defaultMessage: '源端数据库',
              }) /*"源端数据库"*/
            }
            projectId={projectId}
            filters={{
              dialectTypes: [
                ConnectionMode.MYSQL,
                ConnectionMode.OB_MYSQL,
                ConnectionMode.OB_ORACLE,
              ],
            }}
            placeholder={formatMessage({
              id: 'src.component.Task.StructureComparisonTask.CreateModal.84D445B8',
              defaultMessage: '请选择',
            })}
          />

          <DatabaseSelect
            name={['parameters', 'targetDatabaseId']}
            width={'336px'}
            disabled={!sourceDatabaseId}
            type={TaskType.STRUCTURE_COMPARISON}
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.CreateModal.4A2B46E4',
                defaultMessage: '目标端数据库',
              }) /*"目标端数据库"*/
            }
            projectId={projectId}
            filters={{
              dialectTypes: [database?.data?.dataSource?.dialectType],
              projectId: database?.data?.project?.id,
            }}
            placeholder={formatMessage({
              id: 'src.component.Task.StructureComparisonTask.CreateModal.CBAA34FD',
              defaultMessage: '仅支持选择同一项目内数据库',
            })}
          />

          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.StructureComparisonTask.CreateModal.2ABC81DE',
              defaultMessage: '比对范围',
            })}
            name={['parameters', 'comparisonScope']}
            required
          >
            <Radio.Group>
              <Radio value={EComparisonScope.PART}>
                {comparisonScopeMap[EComparisonScope.PART]}
              </Radio>
              <Radio value={EComparisonScope.ALL}>{comparisonScopeMap[EComparisonScope.ALL]}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const range = getFieldValue(['parameters', 'comparisonScope']);
              if (range === EComparisonScope.ALL) {
                return null;
              }
              return (
                <Form.Item
                  label={
                    formatMessage({
                      id: 'src.component.Task.StructureComparisonTask.CreateModal.8B06E600',
                      defaultMessage: '比对对象',
                    }) /*"比对对象"*/
                  }
                  name={['parameters', 'tableNamesToBeCompared']}
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'src.component.Task.StructureComparisonTask.CreateModal.BCA1854E',
                        defaultMessage: '请选择比对对象',
                      }), //'请选择对比对象'
                    },
                  ]}
                >
                  <TableSelector
                    databaseId={sourceDatabaseId}
                    targetDatabaseId={targetDatabaseId}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Form.Item>
        <FormItemPanel
          label={
            formatMessage({
              id: 'src.component.Task.StructureComparisonTask.CreateModal.DAB1623C',
              defaultMessage: '任务设置',
            }) /*"任务设置"*/
          }
          keepExpand
        >
          <Form.Item
            label={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.CreateModal.EE50E3DC',
                defaultMessage: '执行方式',
              }) /*"执行方式"*/
            }
            required
            name="executionStrategy"
          >
            <Radio.Group>
              <Radio value={TaskExecStrategy.AUTO}>
                {taskExecStrategyMap?.[TaskExecStrategy.AUTO]}
              </Radio>
              <Radio value={TaskExecStrategy.MANUAL}>
                {taskExecStrategyMap?.[TaskExecStrategy.MANUAL]}
              </Radio>
            </Radio.Group>
          </Form.Item>
        </FormItemPanel>
        <Form.Item
          label={
            formatMessage({
              id: 'src.component.Task.StructureComparisonTask.CreateModal.52828286',
              defaultMessage: '描述',
            }) /*"描述"*/
          }
          name="description"
          requiredMark="optional"
          rules={[
            {
              max: 200,
              message: formatMessage({
                id: 'src.component.Task.StructureComparisonTask.CreateModal.FBBFFC4C',
                defaultMessage: '描述不超过 200 个字符',
              }), //'描述不超过 200 个字符'
            },
          ]}
        >
          <Input.TextArea
            placeholder={
              formatMessage({
                id: 'src.component.Task.StructureComparisonTask.CreateModal.67E284BD',
                defaultMessage: '描述不超过 200 个字符',
              }) /*"请输入描述，200字以内；"*/
            }
            maxLength={200}
            rows={6}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default inject('modalStore')(observer(StructureComparisonTask));
