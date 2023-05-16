import { getUserList } from '@/common/network/manager';
import { updateProject } from '@/common/network/project';
import HelpDoc from '@/component/helpDoc';
import { IManagerUser } from '@/d.ts';
import { IProject, ProjectRole } from '@/d.ts/project';
import { useRequest } from 'ahooks';
import { Checkbox, Form, message, Modal, Transfer } from 'antd';
import { useEffect } from 'react';
import styles from './index.less';
interface IProps {
  close: () => void;
  onSuccess: () => void;
  project: IProject;
  visible: boolean;
}

export default function AddUserModal({ close, onSuccess, visible, project }: IProps) {
  const [form] = Form.useForm<{
    roles: ProjectRole[];
    users: number[];
  }>();

  const {
    data: userList,
    run,
    loading,
  } = useRequest(getUserList, {
    manual: true,
  });

  useEffect(() => {
    if (open) {
      run({
        page: 1,
        size: 999999,
      });
      form.resetFields();
    }
  }, [open]);

  const filterOption = (inputValue: string, option: IManagerUser) =>
    option.name.indexOf(inputValue) > -1;

  async function submit() {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const oldUsers = project.members;
    const tmp = new Set();
    oldUsers.forEach((u) => {
      tmp.add(u.id + '@' + u.role);
    });
    const newUsers = [...oldUsers];
    const { roles, users } = formData;
    userList?.contents?.forEach((user) => {
      if (!users.includes(user.id)) {
        return;
      }
      roles.forEach((role) => {
        const key = user.id + '@' + role;
        if (tmp.has(key)) {
          return;
        }
        newUsers.push({
          id: user.id,
          role: role,
          accountName: user.accountName,
          name: user.name,
        });
      });
    });
    const isSuccess = await updateProject(project.id, {
      ...project,
      members: newUsers,
    });
    if (isSuccess) {
      message.success('添加成功');
      close();
      onSuccess();
    }
  }

  return (
    <Modal title="添加成员" onCancel={() => close()} onOk={submit} visible={visible} width={760}>
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
        <Form.Item rules={[{ required: true }]} name={'users'} valuePropName="targetKeys">
          <Transfer
            className={styles.transfer}
            showSearch
            filterOption={filterOption}
            dataSource={userList?.contents?.map((item) => {
              return {
                key: item.id,
                ...item,
              };
            })}
            render={(item) => `${item.name}(${item.accountName})`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
