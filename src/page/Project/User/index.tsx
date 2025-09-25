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
import TooltipAction from '@/component/TooltipAction';
import { IProject, ProjectRole } from '@/d.ts/project';
import type { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { Button, Space, Tag } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import ProjectContext from '../ProjectContext';
import AddUserModal from './AddUserModal';
import ManageModal from './ManageModal';
import UpdateUserModal from './UpdateUserModal';
import { isProjectArchived } from '@/page/Project/helper';
import { UserOperationKey, getOperatioFunc } from '@/d.ts/operation';
import { renderTool } from '@/util/renderTool';

export const projectRoleTextMap = {
  [ProjectRole.OWNER]: formatMessage({
    id: 'odc.User.AddUserModal.Administrator',
    defaultMessage: '管理员',
  }),
  [ProjectRole.DEVELOPER]: formatMessage({
    id: 'src.page.Project.User.A0288936',
    defaultMessage: '开发者',
  }), //'开发者'
  [ProjectRole.DBA]: 'DBA',
  [ProjectRole.SECURITY_ADMINISTRATOR]: formatMessage({
    id: 'odc.src.page.Project.User.SecurityAdministrator',
    defaultMessage: '安全管理员',
  }), //'安全管理员'
  [ProjectRole.PARTICIPANT]: formatMessage({
    id: 'odc.src.page.Project.User.Participant',
    defaultMessage: '参与者',
  }), //'参与者'
};

interface IProps {
  id: string;
  userStore?: UserStore;
}
const User: React.FC<IProps> = ({ id, userStore }) => {
  const context = useContext(ProjectContext);
  const { project } = context;
  const projectArchived = isProjectArchived(project);
  const isOwner = project?.currentUserResourceRoles?.some((item) => item === ProjectRole.OWNER);
  const isDBA = project?.currentUserResourceRoles?.some((item) => item === ProjectRole.DBA);
  const [addUserModalVisiable, setAddUserModalVisiable] = useState(false);
  const [manageModalVisiable, setManageModalVisiable] = useState(false);
  const [editUserId, setEditUserId] = useState<number>(null);
  const [detailId, setDetailId] = useState<number>(null);
  const dataSource: (IProject['members'][0] & {
    roles: ProjectRole[];
    globalRoles: ProjectRole[];
  })[] = useMemo(() => {
    const userMap = new Map<
      number,
      IProject['members'][0] & {
        roles: ProjectRole[];
        globalRoles: ProjectRole[];
      }
    >();
    context?.project?.members
      ?.sort((item) => (userStore?.user?.id == item.id ? -1 : 1))
      ?.forEach((mem) => {
        const { id, role, derivedFromGlobalProjectRole } = mem;
        if (userMap.has(id)) {
          userMap.get(id).roles.push(role);
          derivedFromGlobalProjectRole && userMap.get(id).globalRoles.push(role);
        } else {
          const obj = {
            ...mem,
            roles: [role],
            globalRoles: [],
          };
          derivedFromGlobalProjectRole && obj.globalRoles.push(role);
          userMap.set(id, obj);
        }
      });
    return [...userMap.values()];
  }, [context?.project?.members]);
  useEffect(() => {
    tracert.expo('a3112.b64002.c330860');
  }, []);
  async function deleteUser(id: number, name: string) {
    const isSuccess = await deleteProjectMember({
      projectId: context?.project?.id,
      userId: id,
    });
    if (isSuccess) {
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

  const getOperation: getOperatioFunc<
    IProject['members'][0] & {
      roles: ProjectRole[];
      globalRoles: ProjectRole[];
    }
  > = (record) => {
    const isGlobalRolesUser = !!record.globalRoles.length;
    const isMe = userStore?.user?.id === record.id;
    return [
      {
        key: UserOperationKey.MANAGE_PERMISSION,
        disable: !isOwner && !isMe,
        text: formatMessage({
          id: 'src.page.Project.User.3AE67EC2',
          defaultMessage: '管理权限',
        }),
        action: () => showManageModal(record.id),
        disableTooltip: () => {
          if (!isOwner && !isMe) {
            return formatMessage({
              id: 'src.page.Project.User.907FD906',
              defaultMessage: '暂无权限',
            });
          } else {
            return '';
          }
        },
      },
      {
        disable: !isOwner,
        action: () => updateUser(record.id),
        text: formatMessage({
          id: 'src.page.Project.User.D1A92D2A',
          defaultMessage: '编辑角色',
        }),
        key: UserOperationKey.EDIT_ROLES,
        disableTooltip: () => {
          if (!isOwner) {
            return formatMessage({
              id: 'src.page.Project.User.907FD906',
              defaultMessage: '暂无权限',
            });
          } else {
            return '';
          }
        },
      },
      {
        disable: !isOwner || isGlobalRolesUser,
        key: UserOperationKey.REMOVE_ROLES,
        text: formatMessage({
          id: 'odc.Project.User.Remove',
          defaultMessage: '移除',
        }),
        action: () => deleteUser(record.id, record.name),
        confirmText: formatMessage({
          id: 'odc.Project.User.AreYouSureYouWant',
          defaultMessage: '是否确定删除该成员？',
        }),
        disableTooltip: () => {
          if (isGlobalRolesUser) {
            return formatMessage({
              id: 'src.page.Project.User.68557BE1',
              defaultMessage: '全局角色不可移除',
            });
          } else if (!isOwner) {
            return formatMessage({
              id: 'src.page.Project.User.FE2F4924',
              defaultMessage: '暂无权限',
            });
          } else {
            return '';
          }
        },
      },
    ];
  };

  const TableCardTitle = (
    <TooltipAction
      title={
        isOwner
          ? ''
          : formatMessage({
              id: 'src.page.Project.User.0C0586E8',
              defaultMessage: '暂无权限',
            })
      }
    >
      <Button type="primary" onClick={() => setAddUserModalVisiable(true)} disabled={!isOwner}>
        {
          formatMessage({
            id: 'odc.Project.User.AddMembers',
            defaultMessage: '添加成员',
          }) /*添加成员*/
        }
      </Button>
    </TooltipAction>
  );

  return (
    <TableCard
      title={projectArchived ? null : TableCardTitle}
      extra={
        <FilterIcon onClick={context.reloadProject}>
          <Reload />
        </FilterIcon>
      }
    >
      <MiniTable<
        IProject['members'][0] & {
          roles: ProjectRole[];
          globalRoles: ProjectRole[];
        }
      >
        rowKey={'accountName'}
        columns={[
          {
            title: formatMessage({
              id: 'odc.Project.User.UserName',
              defaultMessage: '用户名称',
            }),
            //用户名称
            dataIndex: 'name',
            render(name, _) {
              const isMe = userStore?.user?.id === _.id;
              return isMe ? (
                <Space size={5}>
                  {name}
                  <Tag style={{ border: 'none' }} color="blue">
                    {
                      formatMessage({
                        id: 'src.page.Project.User.15775BB9' /*我*/,
                        defaultMessage: '我',
                      }) /* 我 */
                    }
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
              defaultMessage: '账号',
            }),
            //账号
            dataIndex: 'accountName',
            width: 370,
          },
          {
            title: formatMessage({
              id: 'odc.Project.User.ProjectRole',
              defaultMessage: '项目角色',
            }),
            //项目角色
            dataIndex: 'roles',
            width: 370,
            render(v: ProjectRole[]) {
              return Array.from(new Set(v))
                ?.map((item) => projectRoleTextMap[item] || item)
                ?.join(' | ');
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.User.Operation',
              defaultMessage: '操作',
            }),
            //操作
            dataIndex: 'name',
            width: 135,
            hide: projectArchived,
            render(_, record) {
              const operation = getOperation(record);
              return (
                <Action.Group size={3}>
                  {operation.map((item, index) => {
                    return renderTool(item, index);
                  })}
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
        globalRoles={
          context.project?.members
            ?.filter((m) => m.id === editUserId && m.derivedFromGlobalProjectRole)
            ?.map((m) => m.role) || []
        }
      />

      <ManageModal
        visible={manageModalVisiable}
        projectId={context.project?.id}
        userId={detailId}
        isOwner={isOwner}
        isDBA={isDBA}
        onClose={closeManageModal}
      />
    </TableCard>
  );
};
export default inject('userStore')(observer(User));
