import { Modal, Input, Alert, Form, Descriptions, message } from 'antd';
import { batchDeleteProject } from '@/common/network/project';
import { formatMessage } from '@/util/intl';
import { useEffect, useState } from 'react';

export type SelectProject = {
  id: number;
  name: string;
};

interface DeleteProjectModalIProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectList: SelectProject[];
  verifyValue: string;
  beforeDelete?: () => void;
}
const DeleteProjectModal: React.FC<DeleteProjectModalIProps> = (props) => {
  const { open, setOpen, projectList, verifyValue, beforeDelete } = props;
  const [form] = Form.useForm<{
    verifyFields: string;
  }>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  const handleOK = async () => {
    const value = await form.validateFields();
    const { verifyFields } = value;
    if (verifyFields === verifyValue) {
      const ids = projectList.map((i) => i.id);
      const isSuccess = await batchDeleteProject(ids);
      if (!isSuccess) {
        return;
      }
      message.success(
        formatMessage({
          id: 'odc.Setting.Info.OperationSucceeded',
          defaultMessage: '操作成功',
        }), //操作成功
      );
      beforeDelete?.();
      setOpen(false);
    } else {
      form.setFields([
        {
          name: 'verifyFields',
          value: verifyFields,
          errors: [`请输入 ${verifyValue} `],
        },
      ]);
    }
  };

  return (
    <Modal
      title={`删除${projectList.length}个项目`}
      open={open}
      onCancel={() => {
        setOpen(false);
      }}
      onOk={handleOK}
      okText={'删除'}
      okType={'danger'}
    >
      <Alert
        type="error"
        showIcon
        message="项目删除后所有数据不可恢复，请谨慎操作，输入下面内容再次确认操作。"
        style={{ marginBottom: '12px' }}
      />
      <Descriptions>
        <Descriptions.Item label="删除项目">
          {projectList.map((item) => item.name).join('; ')}
        </Descriptions.Item>
      </Descriptions>
      <Form form={form} layout="vertical">
        <Form.Item
          name="verifyFields"
          label={
            <span>
              请输入 <span style={{ color: 'red' }}>{verifyValue}</span> 以确认操作
            </span>
          }
          style={{ marginBottom: '0px' }}
          rules={[
            {
              required: true,
              message: '请输入',
            },
          ]}
        >
          <Input placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DeleteProjectModal;
