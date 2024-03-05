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

import { deleteProjectMember } from '@/common/network/project';
import Action from '@/component/Action';
import FilterIcon from '@/component/Button/FIlterIcon';
import Reload from '@/component/Button/Reload';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import type { UserStore } from '@/store/login';
import { IProject, ProjectRole } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import ProjectContext from '../ProjectContext';
import AddUserModal from './AddUserModal';
import UpdateUserModal from './UpdateUserModal';
import ManageModal from './ManageModal';
import tracert from '@/util/tracert';
export const projectRoleTextMap = {
  [ProjectRole.OWNER]: formatMessage({
    id: 'odc.User.AddUserModal.Administrator',
  }),
  [ProjectRole.DEVELOPER]: formatMessage({ id: 'src.page.Project.User.A0288936' }), //'开发者'
  [ProjectRole.DBA]: 'DBA',
  [ProjectRole.SECURITY_ADMINISTRATOR]: formatMessage({
    id: 'odc.src.page.Project.User.SecurityAdministrator',
  }), //'安全管理员'
  [ProjectRole.PARTICIPANT]: formatMessage({
    id: 'odc.src.page.Project.User.Participant',
  }), //'参与者'
};
interface IProps {
  id: string;
  userStore?: UserStore;
}
const User: React.FC<IProps> = ({ id, userStore }) => {
  const context = useContext(ProjectContext);
  const { project } = context;
  const isOwner = project?.currentUserResourceRoles?.some((item) => item === ProjectRole.OWNER);
  const [addUserModalVisiable, setAddUserModalVisiable] = useState(false);
  const [manageModalVisiable, setManageModalVisiable] = useState(false);
  const [editUserId, setEditUserId] = useState<number>(null);
  const [detailId, setDetailId] = useState<number>(null);
  const dataSource: (IProject['members'][0] & {
    roles: ProjectRole[];
  })[] = useMemo(() => {
    const userMap = new Map<
      number,
      IProject['members'][0] & {
        roles: ProjectRole[];
      }
    >();
    context?.project?.members
      ?.sort((item) => (userStore?.user?.id == item.id ? -1 : 1))
      ?.forEach((mem) => {
        const { id, role } = mem;
        if (userMap.has(id)) {
          userMap.get(id).roles.push(role);
        } else {
          userMap.set(id, {
            ...mem,
            roles: [role],
          });
        }
      });
    return [...userMap.values()];
  }, [context?.project?.members]);
  useEffect(() => {
    tracert.expo('a3112.b64002.c330860');
  }, []);
  async function deleteUser(id: number) {
    const isSuccess = await deleteProjectMember({
      projectId: context?.project?.id,
      userId: id,
    });
    if (isSuccess) {
      message.success(
        formatMessage({
          id: 'odc.Project.User.DeletedSuccessfully',
        }), //删除成功
      );

      context.reloadProject();
    }
  }
  async function updateUser(id: number) {
    setEditUserId(id);
  }

  function showManageModal(id: number) {
    setDetailId(id);
    setManageModalVisiable(true);
  }

  function closeManageModal() {
    setDetailId(null);
    setManageModalVisiable(false);
  }

  return (
    <TableCard
      title={
        <Button type="primary" onClick={() => setAddUserModalVisiable(true)} disabled={!isOwner}>
          {
            formatMessage({
              id: 'odc.Project.User.AddMembers',
            }) /*添加成员*/
          }
        </Button>
      }
      extra={
        <FilterIcon onClick={context.reloadProject}>
          <Reload />
        </FilterIcon>
      }
    >
      <MiniTable<IProject['members'][0]>
        rowKey={'accountName'}
        columns={[
          {
            title: formatMessage({
              id: 'odc.Project.User.UserName',
            }),
            //用户名称
            dataIndex: 'name',
            render(name, _) {
              const isMe = userStore?.user?.id === _.id;
              return isMe ? (
                <Space size={5}>
                  {name}
                  <Tag style={{ border: 'none' }} color="blue">
                    {formatMessage({ id: 'src.page.Project.User.15775BB9' /*我*/ }) /* 我 */}
                  </Tag>
                </Space>
              ) : (
                name
              );
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.User.Account',
            }),
            //账号
            dataIndex: 'accountName',
            width: 370,
          },
          {
            title: formatMessage({
              id: 'odc.Project.User.ProjectRole',
            }),
            //项目角色
            dataIndex: 'roles',
            width: 370,
            render(v) {
              return v?.map((item) => projectRoleTextMap[item] || item)?.join(' | ');
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.User.Operation',
            }),
            //操作
            dataIndex: 'name',
            width: 135,
            render(_, record) {
              const disabled = !isOwner;
              const isMe = userStore?.user?.id === record.id;
              return (
                <Action.Group size={3}>
                  <Action.Link
                    onClick={() => updateUser(record.id)}
                    key={'export'}
                    disabled={disabled}
                  >
                    {
                      formatMessage({
                        id: 'odc.Project.User.Edit',
                      }) /*编辑*/
                    }
                  </Action.Link>
                  <Popconfirm
                    key="import"
                    title={formatMessage({
                      id: 'odc.Project.User.AreYouSureYouWant',
                    })}
                    /*确定删除该成员吗？*/ onConfirm={() => deleteUser(record.id)}
                  >
                    <Action.Link key={'import'} disabled={disabled}>
                      {
                        formatMessage({
                          id: 'odc.Project.User.Remove',
                        }) /*移除*/
                      }
                    </Action.Link>
                  </Popconfirm>
                  <Action.Link
                    disabled={disabled && !isMe}
                    onClick={() => {
                      showManageModal(record.id);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'src.page.Project.User.26C36450' /*管理库权限*/,
                      }) /* 管理库权限 */
                    }
                  </Action.Link>
                </Action.Group>
              );
            },
          },
        ]}
        dataSource={dataSource}
        pagination={{
          total: dataSource?.length || 0,
        }}
        loadData={(page) => {}}
      />

      <AddUserModal
        visible={addUserModalVisiable}
        close={() => setAddUserModalVisiable(false)}
        onSuccess={() => {
          context.reloadProject();
        }}
        project={context.project}
      />

      <UpdateUserModal
        visible={!!editUserId}
        userId={editUserId}
        close={() => {
          setEditUserId(null);
        }}
        onSuccess={() => {
          context.reloadProject();
        }}
        projectId={context.project?.id}
        roles={
          context.project?.members?.filter((m) => m.id === editUserId)?.map((m) => m.role) || []
        }
      />

      <ManageModal
        visible={manageModalVisiable}
        projectId={context.project?.id}
        userId={detailId}
        isOwner={isOwner}
        onClose={closeManageModal}
      />
    </TableCard>
  );
};
export default inject('userStore')(observer(User));
