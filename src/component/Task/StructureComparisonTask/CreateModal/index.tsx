import { Button, Drawer, Form, Input, Modal, Radio, Space, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useState } from 'react';
import FormItemPanel from '@/component/FormItemPanel';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import {
  CreateStructureComparisonTaskRecord,
  TaskExecStrategy,
  TaskPageType,
  TaskType,
} from '@/d.ts';
import { comparisonScopeMap } from './interface';
import DatabaseSelect from '../../component/DatabaseSelect';
import { createStructureComparisonTask } from '@/common/network/task';
import TableSelector from './TableSelector';
import { openTasksPage } from '@/store/helper/page/openPage';
import { getDatabase } from '@/common/network/database';
import { useRequest } from 'ahooks';
import { EComparisonScope } from '@/d.ts/task';
import { getTaskExecStrategyMap } from '../..';
interface IProps {
  projectId?: number;
  modalStore?: ModalStore;
}

const StructureComparisonTask: React.FC<IProps> = ({ projectId, modalStore }) => {
  const { structureComparisonVisible } = modalStore;
  const [form] = useForm<CreateStructureComparisonTaskRecord>();
  const taskExecStrategyMap = getTaskExecStrategyMap(TaskType.STRUCTURE_COMPARISON);
  const sourceDatabaseId = Form.useWatch(['parameters', 'sourceDatabaseId'], form);
  const targetDatabaseId = Form.useWatch(['parameters', 'targetDatabaseId'], form);
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  async function handleSubmit() {
    setConfirmLoading(true);
    const rawData = await form.validateFields().catch();
    rawData.taskType = TaskType.STRUCTURE_COMPARISON;
    const result = await createStructureComparisonTask(rawData);
    setConfirmLoading(false);
    if (result) {
      message.success('新建成功');
      modalStore.changeStructureComparisonModal(false);
      openTasksPage(TaskPageType.STRUCTURE_COMPARISON);
      return;
    }
    message.error('新建失败');
  }

  const { data: database, run } = useRequest(getDatabase, {
    manual: true,
  });
  const handleFieldsChange = () => {
    setHasEdit(true);
  };
  const handleReset = () => {
    form?.resetFields();
    // crontabRef.current?.resetFields();
    setHasEdit(false);
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: '确认取消此 结构比对吗？',
        centered: true,
        onOk: () => {
          modalStore.changeStructureComparisonModal(false);
        },
      });
    } else {
      modalStore.changeStructureComparisonModal(false);
    }
  };
  useEffect(() => {
    if (!structureComparisonVisible) {
      handleReset();
    }
  }, [structureComparisonVisible]);
  useEffect(() => {
    if (sourceDatabaseId) {
      run(sourceDatabaseId);
    }
  }, [sourceDatabaseId]);
  return (
    <Drawer
      open={structureComparisonVisible}
      title={'新建结构比对'}
      width={720}
      closable
      onClose={() => handleCancel(hasEdit)}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={() => handleCancel(hasEdit)}>取消</Button>
            <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
              新建
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
            label="源端数据库"
            projectId={projectId}
            placeholder={'请选择'}
          />
          <DatabaseSelect
            name={['parameters', 'targetDatabaseId']}
            width={'336px'}
            type={TaskType.STRUCTURE_COMPARISON}
            label="目标端数据库"
            projectId={projectId}
            filters={{
              dialectTypes: [database?.data?.dataSource?.dialectType],
              projectId: database?.data?.project?.id,
            }}
            placeholder={'仅支持选择同一项目内数据库'}
          />
          <Form.Item label="对比范围" name={['parameters', 'comparisonScope']}>
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
                  label="对比对象"
                  name={['parameters', 'tableNamesToBeCompared']}
                  rules={[
                    {
                      required: true,
                      message: '请选择对比对象',
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
        <FormItemPanel label="任务设置" keepExpand>
          <Form.Item label="执行方式" name="executionStrategy">
            <Radio.Group>
              <Radio value={TaskExecStrategy.AUTO}>
                {taskExecStrategyMap?.[TaskExecStrategy.AUTO]}
              </Radio>
              <Radio value={TaskExecStrategy.MANUAL} disabled>
                {taskExecStrategyMap?.[TaskExecStrategy.MANUAL]}
              </Radio>
            </Radio.Group>
          </Form.Item>
        </FormItemPanel>
        <Form.Item
          label="描述"
          name="description"
          requiredMark="optional"
          rules={[
            {
              max: 200,
              message: '描述不超过 200 个字符',
            },
          ]}
        >
          <Input.TextArea placeholder="请输入描述，200字以内；" maxLength={200} rows={6} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default inject('modalStore')(observer(StructureComparisonTask));
