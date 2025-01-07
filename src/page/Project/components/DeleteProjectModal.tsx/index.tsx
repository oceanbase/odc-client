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
  afterDelete?: () => void;
}
const DeleteProjectModal: React.FC<DeleteProjectModalIProps> = (props) => {
  const { open, setOpen, projectList, verifyValue, afterDelete } = props;
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
      afterDelete?.();
      setOpen(false);
    } else {
      form.setFields([
        {
          name: 'verifyFields',
          value: verifyFields,
          errors: [
            formatMessage(
              {
                id: 'src.page.Project.components.DeleteProjectModal.tsx.E30AA7E1',
                defaultMessage: '请输入 {verifyValue} ',
              },
              { verifyValue },
            ),
          ],
        },
      ]);
    }
  };

  return (
    <Modal
      title={formatMessage(
        {
          id: 'src.page.Project.components.DeleteProjectModal.tsx.C103BA30',
          defaultMessage: '删除{projectListLength}个项目',
        },
        { projectListLength: projectList.length },
      )}
      open={open}
      onCancel={() => {
        setOpen(false);
      }}
      onOk={handleOK}
      okText={formatMessage({
        id: 'src.page.Project.components.DeleteProjectModal.tsx.8B88D33D',
        defaultMessage: '删除',
      })}
      okType={'danger'}
    >
      <Alert
        type="error"
        showIcon
        message={formatMessage({
          id: 'src.page.Project.components.DeleteProjectModal.tsx.AFD8430A',
          defaultMessage: '项目删除后所有数据不可恢复，请谨慎操作，输入下面内容再次确认操作。',
        })}
        style={{ marginBottom: '12px' }}
      />

      <Descriptions>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.page.Project.components.DeleteProjectModal.tsx.0D5B4B7B',
            defaultMessage: '删除项目',
          })}
        >
          {projectList.map((item) => item.name).join('; ')}
        </Descriptions.Item>
      </Descriptions>
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="verifyFields"
          label={
            <span>
              {formatMessage({
                id: 'src.page.Project.components.DeleteProjectModal.tsx.DE5B1B2F',
                defaultMessage: '请输入',
              })}
              <span style={{ color: 'red' }}>{verifyValue}</span>
              {formatMessage({
                id: 'src.page.Project.components.DeleteProjectModal.tsx.15CA1805',
                defaultMessage: '以确认操作',
              })}
            </span>
          }
          style={{ marginBottom: '0px' }}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.page.Project.components.DeleteProjectModal.tsx.1A3DA14E',
                defaultMessage: '请输入',
              }),
            },
          ]}
        >
          <Input
            placeholder={formatMessage({
              id: 'src.page.Project.components.DeleteProjectModal.tsx.8C00D75B',
              defaultMessage: '请输入',
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DeleteProjectModal;
