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
import RelativeResourceModal from '@/component/RelativeResourceModal';
import type { IManagerRole, IManagerUser } from '@/d.ts';
import { actionTypes, IManagerDetailTabs, IManagerResourceType } from '@/d.ts';
import odc from '@/plugins/odc';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Button, Descriptions, Divider, message, Modal, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { getAuthLabelString, resourceAuthMap, ResourceManagementAction } from '../../../utils';
import { getResourceDependencies } from '@/util/request/relativeResource';
import { ExclamationCircleFilled } from '@ant-design/icons';
import useResourceDepNotification, {
  EResourceType,
  EStatus,
} from '@/util/hooks/useResourceDepNotification';
import { EEntityType } from '@/d.ts/relativeResource';

const authFilters = [
  {
    text: formatMessage({
      id: 'odc.component.DetailContent.CanBeCreated',
      defaultMessage: '可新建',
    }), //可新建
    value: ResourceManagementAction.can_create,
  },
  {
    text: formatMessage({ id: 'odc.component.DetailContent.ViewOnly', defaultMessage: '仅查看' }), //仅查看
    value: ResourceManagementAction.can_read,
  },
  {
    text: formatMessage({ id: 'odc.component.DetailContent.Editable', defaultMessage: '可编辑' }), //可编辑
    value: ResourceManagementAction.can_update,
  },
  {
    text: formatMessage({ id: 'odc.component.DetailContent.Manageable', defaultMessage: '可管理' }), //可管理
    value: ResourceManagementAction.can_manage,
  },
];

const getColumns = () => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.component.DetailContent.DataSource',
        defaultMessage: '数据源',
      }), //数据源
      ellipsis: true,
    },
    {
      dataIndex: 'permittedActions',
      title: formatMessage({
        id: 'odc.components.UserPage.component.Permissions',
        defaultMessage: '权限',
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
  const [openDepResourceModal, setOpenDepResourceModal] = useState(false);
  const relatedRoles = useRoleListByIds(roles, roleIds);
  const { contextHolder, openNotification } = useResourceDepNotification();

  const handleDeleteUser = async () => {
    openNotification({ name, type: EResourceType.USER, status: EStatus.LOADING });
    const res = await deleteUser(id, true);
    if (res) {
      openNotification({ name, type: EResourceType.USER, status: EStatus.SUCCESS });
      handleCloseAndReload();
    } else {
      openNotification({
        name,
        type: EResourceType.USER,
        status: EStatus.FAILED,
      });
    }
  };

  const handleDelete = async () => {
    const res = await getResourceDependencies({ userId: id });
    const total =
      res?.flowDependencies?.length ||
      0 + res?.scheduleDependencies?.length ||
      0 + res?.scheduleTaskDependencies?.length ||
      0;
    if (total > 0) {
      setOpenDepResourceModal(true);
    } else {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.UserPage.component.AreYouSureYouWant',
          defaultMessage: '是否确定删除用户？',
        }),
        // 确定要删除用户吗？
        icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
        content: formatMessage({
          id: 'odc.components.UserPage.component.AfterAUserIsDeleted',
          defaultMessage: '删除用户后，用户将无法登录系统，相关数据也无法恢复',
        }), // 删除用户后，用户将无法登录系统，相关数据也无法恢复
        cancelText: formatMessage({
          id: 'odc.components.UserPage.component.Cancel',
          defaultMessage: '取消',
        }),
        // 取消
        okText: formatMessage({
          id: 'odc.components.UserPage.component.Determine',
          defaultMessage: '确定',
        }),
        // 确定
        centered: true,
        onOk: handleDeleteUser,
      });
    }
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
          defaultMessage: '重置密码成功',
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

  const canDelete = () =>
    canAcess({
      resourceIdentifier: IManagerResourceType.user,
      action: actionTypes.delete,
    }).accessible;

  return (
    <>
      {contextHolder}
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={formatMessage({
            id: 'odc.components.UserPage.component.Account',
            defaultMessage: '账号',
          })}
          /* 账号 */
        >
          {accountName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Name',
            defaultMessage: '姓名',
          })} /* 姓名 */
        >
          {name}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Password',
            defaultMessage: '密码',
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
                    defaultMessage: '重置密码',
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
            defaultMessage: '角色',
          })}
          /* 角色 */
        >
          <RoleList roles={relatedRoles} isWrap />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Note',
            defaultMessage: '备注',
          })}
          /* 备注 */
        >
          {description}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.ExtraProperties',
            defaultMessage: '自定义属性',
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
            defaultMessage: '创建人',
          })}
          /* 创建人 */
        >
          {creatorName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Created',
            defaultMessage: '创建时间',
          })}
          /* 创建时间 */
        >
          {getFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.UpdateTime',
            defaultMessage: '更新时间',
          })}
          /* 更新时间 */
        >
          {getFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      {odc.appConfig.manage.user.delete && canDelete() && (
        <Space size={5}>
          <span>
            {
              formatMessage({
                id: 'odc.components.UserPage.component.AfterAUserIsDeleted',
                defaultMessage: '删除用户后，用户将无法登录系统，相关数据也无法恢复',
              })
              /* 删除用户后，用户将无法登录系统，相关数据也无法恢复 */
            }
          </span>
          <Button type="link" onClick={handleDelete} disabled={builtIn || disabledOp}>
            {
              formatMessage({
                id: 'odc.components.UserPage.component.DeleteAUser',
                defaultMessage: '删除用户',
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
            defaultMessage: '重置密码',
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

      <RelativeResourceModal
        mode={EEntityType.USER}
        open={openDepResourceModal}
        id={id}
        title={formatMessage(
          {
            id: 'src.page.Auth.User.component.DetailContent.C264E6A2',
            defaultMessage: '确定要删除用户 {name} 吗？',
          },
          { name },
        )}
        onCancel={() => setOpenDepResourceModal(false)}
        customSuccessHandler={async () => {
          await handleDeleteUser();
          setOpenDepResourceModal(false);
          handleCloseAndReload();
        }}
      />
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
      roles={data?.roles}
      handleCloseAndReload={handleCloseAndReload}
    />
  );
};

export default UserDetailContent;
