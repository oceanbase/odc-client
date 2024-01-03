/*
 * Copyright 2024 OceanBase
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

import { getConnectionList } from '@/common/network/connection';
import { deleteUser, resetPassword } from '@/common/network/manager';
import { canAcess } from '@/component/Acess';
import ChangePasswordModal from '@/component/ChangePasswordModal';
import DisplayTable from '@/component/DisplayTable';
import RoleList, { useRoleListByIds } from '@/component/Manage/RoleList';
import type { IManagerRole, IManagerUser } from '@/d.ts';
import { actionTypes, IManagerDetailTabs, IManagerResourceType } from '@/d.ts';
import odc from '@/plugins/odc';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Descriptions, Divider, message, Modal, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { getAuthLabelString, resourceAuthMap, ResourceManagementAction } from '../../../utils';

const authFilters = [
  {
    text: formatMessage({ id: 'odc.component.DetailContent.CanBeCreated' }), //可新建
    value: ResourceManagementAction.can_create,
  },
  {
    text: formatMessage({ id: 'odc.component.DetailContent.ViewOnly' }), //仅查看
    value: ResourceManagementAction.can_read,
  },
  {
    text: formatMessage({ id: 'odc.component.DetailContent.Editable' }), //可编辑
    value: ResourceManagementAction.can_update,
  },
  {
    text: formatMessage({ id: 'odc.component.DetailContent.Manageable' }), //可管理
    value: ResourceManagementAction.can_manage,
  },
];

const getColumns = () => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({ id: 'odc.component.DetailContent.DataSource' }), //数据源
      ellipsis: true,
    },
    {
      dataIndex: 'permittedActions',
      title: formatMessage({
        id: 'odc.components.UserPage.component.Permissions',
      }),
      // 权限
      width: 108,
      ellipsis: true,
      filters: authFilters,
      onFilter: (value, record) => {
        return resourceAuthMap[value].hasAuth(record?.permittedActions);
      },
      render: (permittedActions) => getAuthLabelString(permittedActions),
    },
  ];
};

const UserDetail: React.FC<{
  data: IManagerUser;
  disabledOp: boolean;
  roles: IManagerRole[];
  handleCloseAndReload: () => void;
}> = ({ data, disabledOp, roles, handleCloseAndReload }) => {
  const {
    accountName,
    name,
    id,
    roleIds,
    description,
    creatorName,
    createTime,
    updateTime,
    builtIn,
    extraProperties,
  } = data;
  const [visible, setVisible] = useState(false);
  const relatedRoles = useRoleListByIds(roles, roleIds);

  const handleDeleteUser = async () => {
    const res = await deleteUser(id);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.components.UserPage.component.Deleted' }), // 删除成功
      );
      handleCloseAndReload();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.UserPage.component.UnableToDelete',
        }),
        // 删除失败
      );
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.UserPage.component.AreYouSureYouWant',
      }),
      // 确定要删除用户吗？
      icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
      content: formatMessage({
        id: 'odc.components.UserPage.component.AfterAUserIsDeleted',
      }), // 删除用户后，用户将无法登录系统，相关数据也无法恢复
      cancelText: formatMessage({
        id: 'odc.components.UserPage.component.Cancel',
      }),
      // 取消
      okText: formatMessage({
        id: 'odc.components.UserPage.component.Determine',
      }),
      // 确定
      centered: true,
      onOk: handleDeleteUser,
    });
  };

  const handleSubmit = async ({ password }) => {
    const res = await resetPassword({
      newPassword: password,
      id,
    });

    if (res) {
      setVisible(false);
      message.success(
        formatMessage({
          id: 'odc.components.UserPage.component.ThePasswordHasBeenReset',
        }), // 重置密码成功
      );
    }
  };

  const isUserAdmin = () => {
    return [actionTypes.create, actionTypes.update, actionTypes.delete].every(
      (item) =>
        canAcess({
          resourceIdentifier: IManagerResourceType.user,
          action: item,
        }).accessible,
    );
  };

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={formatMessage({
            id: 'odc.components.UserPage.component.Account',
          })}
          /* 账号 */
        >
          {accountName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Name',
          })} /* 姓名 */
        >
          {name}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Password',
          })}
          /* 密码 */
        >
          <Space size={5}>
            <span>******</span>
            {odc.appConfig.manage.user.resetPwd && isUserAdmin() && (
              <Button
                type="link"
                onClick={() => {
                  setVisible(true);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.UserPage.component.ResetPassword',
                  })
                  /* 重置密码 */
                }
              </Button>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Role',
          })}
          /* 角色 */
        >
          <RoleList roles={relatedRoles} isWrap />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Note',
          })}
          /* 备注 */
        >
          {description}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.ExtraProperties',
          })}
          /* 自定义属性 */
        >
          {JSON.stringify(extraProperties || {})}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Founder',
          })}
          /* 创建人 */
        >
          {creatorName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Created',
          })}
          /* 创建时间 */
        >
          {getFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.UpdateTime',
          })}
          /* 更新时间 */
        >
          {getFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      {odc.appConfig.manage.user.delete && (
        <Space size={5}>
          <span>
            {
              formatMessage({
                id: 'odc.components.UserPage.component.AfterAUserIsDeleted',
              })
              /* 删除用户后，用户将无法登录系统，相关数据也无法恢复 */
            }
          </span>
          <Button type="link" onClick={handleDelete} disabled={builtIn || disabledOp}>
            {
              formatMessage({
                id: 'odc.components.UserPage.component.DeleteAUser',
              })
              /* 删除用户 */
            }
          </Button>
        </Space>
      )}

      {odc.appConfig.manage.user.resetPwd && (
        <ChangePasswordModal
          title={formatMessage({
            id: 'odc.components.UserPage.component.ResetPassword',
          })}
          /* 重置密码 */
          visible={visible}
          onCancel={() => {
            setVisible(false);
          }}
          onSave={handleSubmit}
          confirmLoading={false}
          isExternal
        />
      )}
    </>
  );
};

const UserResource: React.FC<{
  data: IManagerUser;
}> = ({ data }) => {
  const { id } = data;
  const [resource, setResource] = useState([]);
  const loadResource = async () => {
    const res = await getConnectionList({
      userId: id,
    });

    setResource(res?.contents);
  };

  useEffect(() => {
    loadResource();
  }, []);

  return (
    <DisplayTable
      rowKey="id"
      columns={getColumns()}
      dataSource={resource}
      disablePagination
      scroll={null}
    />
  );
};

const DetailContents = {
  [IManagerDetailTabs.DETAIL]: UserDetail,
  [IManagerDetailTabs.RESOURCE]: UserResource,
};

const UserDetailContent: React.FC<{
  activeKey: IManagerDetailTabs;
  data: IManagerUser;
  disabledOp: boolean;
  roles: IManagerRole[];
  handleCloseAndReload: () => void;
}> = ({ activeKey, data, disabledOp, roles, handleCloseAndReload }) => {
  const DetailContent = DetailContents[activeKey];
  return (
    <DetailContent
      data={{ ...data }}
      disabledOp={disabledOp}
      roles={roles}
      handleCloseAndReload={handleCloseAndReload}
    />
  );
};

export default UserDetailContent;
