import { deleteUser, getPublicConnectionList, resetPassword } from '@/common/network/manager';
import { canAcess } from '@/component/Acess';
import ChangePasswordModal from '@/component/ChangePasswordModal';
import { EmptyLabel } from '@/component/CommonFilter';
import DisplayTable from '@/component/DisplayTable';
import appConfig from '@/constant/appConfig';
import type { IManagerUser } from '@/d.ts';
import { actionTypes, IManagerDetailTabs, IManagerResourceType } from '@/d.ts';
import { getSourceAuthLabelString, getSourceAuthOptions, sourceAuthMap } from '@/page/Manage';
import { ManageContext } from '@/page/Manage/context';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Descriptions, Divider, message, Modal, Space } from 'antd';
import React, { useContext, useEffect, useState } from 'react';

const getColumns = (
  resourceGroup: {
    text: string;
    value: number;
  }[],
) => {
  const authFilters = getSourceAuthOptions().map(({ title: text, value }) => ({
    text,
    value,
  }));
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.UserPage.component.CommonConnectionName',
      }),
      // 公共连接名称
      ellipsis: true,
    },

    {
      dataIndex: 'resourceGroups',
      title: formatMessage({
        id: 'odc.components.UserPage.component.ResourceGroup',
      }),
      // 资源组
      width: 120,
      ellipsis: true,
      filters: [{ text: <EmptyLabel />, value: 0 } as any].concat(resourceGroup)?.map((item) => {
        return {
          text: item.text,
          value: item.value,
        };
      }),
      onFilter: (value, record) => {
        return (
          record?.resourceGroups?.some((item) => item.id === value) ||
          (!value && !record?.resourceGroups?.length)
        );
      },
      render: (resourceGroups) => resourceGroups?.map((item) => item.name)?.join(' | '),
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
        return sourceAuthMap[value].hasSourceAuth(record?.permittedActions);
      },
      render: (permittedActions) => getSourceAuthLabelString(permittedActions),
    },
  ];
};

export const useRoleListByIds = (roleIds: number[]) => {
  const { roles } = useContext(ManageContext);
  return roles.size && roleIds?.length
    ? roleIds
        ?.map((id) => {
          return roles.get(id);
        })
        .filter((item) => item?.name)
    : [];
};

export const RoleList: React.FC<{
  roleIds: number[];
  isShowIcon?: boolean;
  isWrap?: boolean;
}> = ({ roleIds, isShowIcon = false, isWrap = false }) => {
  const roleInfos = useRoleListByIds(roleIds);
  return (
    <div title={roleInfos?.map((item) => item.name)?.join(' | ')}>
      <Space split="|" size={10} wrap={isWrap}>
        {roleInfos?.length ? (
          roleInfos?.map(({ name, enabled }) => (
            <Space size={5}>
              <span title={name}>{name}</span>
              {!enabled && isShowIcon && (
                <span
                  title={formatMessage({
                    id: 'odc.components.UserPage.component.RoleDisabled',
                  })}
                  /* 角色已停用 */
                >
                  <ExclamationCircleFilled style={{ color: '#faad14' }} />
                </span>
              )}
            </Space>
          ))
        ) : (
          <span>-</span>
        )}
      </Space>
    </div>
  );
};

const UserDetail: React.FC<{
  data: IManagerUser;
  disabledOp: boolean;
  handleCloseAndReload: () => void;
}> = ({ data, disabledOp, handleCloseAndReload }) => {
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
  } = data;
  const [visible, setVisible] = useState(false);

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
            {appConfig.manage.user.resetPwd && isUserAdmin() && (
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
          <RoleList roleIds={roleIds} isWrap />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.Note',
          })}
          /* 备注 */
        >
          {description}
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
          {getLocalFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.UserPage.component.UpdateTime',
          })}
          /* 更新时间 */
        >
          {getLocalFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      {appConfig.manage.user.delete && (
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

      {appConfig.manage.user.resetPwd && (
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
    const res = await getPublicConnectionList({
      userId: id,
    });

    setResource(res?.contents);
  };

  useEffect(() => {
    loadResource();
  }, []);

  const resourceGroup = resource?.reduce((total, item) => {
    item.resourceGroups?.forEach(({ name: resourceName, id: resourceId }) => {
      if (!total.some(({ value }) => value === resourceId)) {
        total.push({
          text: resourceName,
          value: resourceId,
        });
      }
    });
    return total;
  }, []);

  return (
    <DisplayTable
      rowKey="id"
      columns={getColumns(resourceGroup)}
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

export const UserDetailContent: React.FC<{
  activeKey: IManagerDetailTabs;
  data: IManagerUser;
  disabledOp: boolean;
  handleCloseAndReload: () => void;
}> = ({ activeKey, data, disabledOp, handleCloseAndReload }) => {
  const DetailContent = DetailContents[activeKey];
  return (
    <DetailContent
      data={{ ...data }}
      disabledOp={disabledOp}
      handleCloseAndReload={handleCloseAndReload}
    />
  );
};
