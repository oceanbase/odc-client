import { updateProjectMember } from '@/common/network/project';
import HelpDoc from '@/component/helpDoc';
import { ProjectRole } from '@/d.ts/project';
import { Checkbox, Form, message, Modal } from 'antd';
import { useEffect } from 'react';
interface IProps {
  close: () => void;
  onSuccess: () => void;
  roles: ProjectRole[];
  projectId: number;
  userId: number;
  visible: boolean;
}

export default function UpdateUserModal({
  close,
  onSuccess,
  visible,
  roles,
  projectId,
  userId,
}: IProps) {
  const [form] = Form.useForm<{
    roles: ProjectRole[];
  }>();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        roles: roles,
      });
    }
  }, [visible]);

  async function submit() {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const roles = formData.roles;
    const isSuccess = await updateProjectMember({
      projectId,
      userId,
      members: roles?.map((role) => ({
        id: userId,
        role: role,
      })),
    });
    if (isSuccess) {
      message.success('操作成功');
      close();
      onSuccess();
    }
  }

  return (
    <Modal title="编辑成员" onCancel={() => close()} onOk={submit} open={visible} width={520}>
      <Form layout="vertical" form={form}>
        <Form.Item rules={[{ required: true }]} name={'roles'} label="项目角色">
          <Checkbox.Group
            options={[
              {
                label: (
                  <HelpDoc leftText doc="projectOwner">
                    管理员
                  </HelpDoc>
                ),
                value: ProjectRole.OWNER,
              },
              {
                label: (
                  <HelpDoc leftText doc="projectDBA">
                    DBA
                  </HelpDoc>
                ),
                value: ProjectRole.DBA,
              },
              {
                label: (
                  <HelpDoc leftText doc="projectDev">
                    普通成员
                  </HelpDoc>
                ),
                value: ProjectRole.DEVELOPER,
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
