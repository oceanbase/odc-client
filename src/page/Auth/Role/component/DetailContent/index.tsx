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

import { deleteRole } from '@/common/network/manager';
import DisplayTable from '@/component/DisplayTable';
import { CommonDeleteModal } from '@/component/Manage/DeleteModal';
import RoleList, { useRoleListByIds } from '@/component/Manage/RoleList';
import Status from '@/component/Manage/Status';
import { CommonUserResource } from '@/component/Manage/UserResource';
import type { IManagerRole } from '@/d.ts';
import { IManagerDetailTabs, IManagerResourceType, IManagerRolePermissionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Divider, message, Space, Tooltip } from 'antd';
import React, { useContext, useState } from 'react';
import { ResourceContext } from '../../../context';
import styles from '../../index.less';
import { permissionMap, resourceManagementTypeOptions } from '../ResourceSelector/const';
import resourceActions from '../ResourceSelector/resourceActions';
const defaultSystemOperationPermission = [
  {
    label: formatMessage({
      id: 'odc.src.page.Auth.Role.component.DetailContent.Environment',
    }), //'环境'
    value: IManagerResourceType.environment,
  },
];
const getColumns = (roles: IManagerRole[]) => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.RolePage.component.Name',
      }),
      // 姓名
      ellipsis: true,
      width: 120,
      render: (name, record) => (
        <Tooltip
          placement="right"
          color="var(--background-normal-color)"
          overlayClassName={styles.userName}
          title={
            <Space direction="vertical">
              <span>
                {
                  formatMessage(
                    {
                      id: 'odc.components.RolePage.component.NameName',
                    },
                    {
                      name,
                    },
                  )

                  /* 姓名：{name} */
                }
              </span>
              <span>
                {
                  formatMessage(
                    {
                      id: 'odc.components.RolePage.component.AccountRecordaccountname',
                    },
                    {
                      recordAccountName: record.accountName,
                    },
                  )

                  /* 账号：{recordAccountName} */
                }
              </span>
            </Space>
          }
        >
          <span>{name}</span>
          <InfoCircleOutlined
            style={{
              margin: '0px 4px',
              color: 'var(--text-color-secondary)',
            }}
          />
        </Tooltip>
      ),
    },
    {
      dataIndex: 'roleIds',
      title: formatMessage({
        id: 'odc.components.RolePage.component.Role',
      }),
      // 角色
      ellipsis: true,
      filters: roles.map(({ name, id }) => {
        return {
          text: name,
          value: id,
        };
      }),
      onFilter: (value, record) => {
        return record.roleIds?.includes(value) || (!value && !record.roleIds?.length);
      },
      render: (roleIds) => {
        const relatedRoles = useRoleListByIds(roles, roleIds);
        return <RoleList roles={relatedRoles} />;
      },
    },
    {
      dataIndex: 'enabled',
      width: 110,
      title: formatMessage({
        id: 'odc.components.RolePage.component.State',
      }),
      // 状态
      ellipsis: true,
      filters: [
        {
          text: formatMessage({
            id: 'odc.components.RolePage.component.Enable',
          }),
          // 启用
          value: true,
        },
        {
          text: formatMessage({
            id: 'odc.components.RolePage.component.Disable',
          }),
          // 停用
          value: false,
        },
      ],
      onFilter: (value, record) => value === record.enabled,
      render: (enabled) => <Status enabled={enabled} showIcon={false} />,
    },
  ];
};
const getResourceColumns = (
  type: IManagerRolePermissionType,
  getResourceName: (type: IManagerResourceType, resourceId: number) => any,
) => {
  const { typeOptions, actionOptions } = permissionMap[type] ?? {};
  return [
    {
      dataIndex: 'resourceType',
      title: formatMessage({
        id: 'odc.components.RolePage.component.ObjectType',
      }),
      // 对象类型
      ellipsis: true,
      width: 160,
      filters: typeOptions?.map(({ label, value }) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record?.resourceType === value,
      render: (resourceType) => {
        return <span>{typeOptions?.find((item) => item.value === resourceType)?.label}</span>;
      },
    },
    {
      dataIndex: 'resourceId',
      title: formatMessage({
        id: 'odc.components.RolePage.component.ObjectName',
      }),
      // 对象名称
      ellipsis: true,
      render: (resourceId, record) => {
        const name = getResourceName(record.resourceType, resourceId);
        return <span>{name ?? '-'}</span>;
      },
    },
    {
      dataIndex: 'actions',
      title: formatMessage({
        id: 'odc.components.RolePage.component.Permissions',
      }),
      // 权限
      ellipsis: true,
      width: 108,
      filters: actionOptions?.map(({ label, value }) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => {
        return value === record?.actions;
      },
      render: (actions, _) => {
        return resourceActions.getActionStringLabel(actions, type);
      },
    },
  ];
};
const getSystemResourceColumns = (type: IManagerRolePermissionType) => {
  const { typeOptions } = permissionMap[type];
  const allTypeOptions = [...typeOptions, ...defaultSystemOperationPermission];
  const actionsFilter = [
    {
      text: formatMessage({
        id: 'odc.components.RolePage.component.Operational',
      }),
      //可操作
      value: 'update',
    },
    {
      text: formatMessage({
        id: 'odc.components.RolePage.component.ViewOnly',
      }),
      //仅查看
      value: 'action_read',
    },
  ];
  return [
    {
      dataIndex: 'resourceType',
      title: formatMessage({
        id: 'odc.components.RolePage.component.ObjectType',
      }),
      // 对象类型
      ellipsis: true,
      filters: allTypeOptions.map(({ label, value }) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record?.resourceType === value,
      render: (resourceType) => {
        return <span>{allTypeOptions?.find((item) => item.value === resourceType)?.label}</span>;
      },
    },
    {
      dataIndex: 'actions',
      title: formatMessage({
        id: 'odc.components.RolePage.component.Permissions',
      }),
      // 权限
      ellipsis: true,
      width: 108,
      filters: actionsFilter,
      onFilter: (value, record) => {
        return record?.actions?.indexOf(value) > -1;
      },
      render: (actions, _) => resourceActions.getActionStringLabel(actions, type),
    },
  ];
};
export const getPermissionsTypes = (value: Partial<IManagerRole>) => {
  const {
    connectionAccessPermissions,
    resourceManagementPermissions,
    systemOperationPermissions,
  } = value;
  const types = [];
  if (connectionAccessPermissions?.length) {
    types.push({
      title: formatMessage({
        id: 'odc.components.RolePage.component.ConnectionAccess',
      }),
      //连接访问权限
      value: IManagerRolePermissionType.connectionAccessPermissions,
    });
  }
  if (resourceManagementPermissions?.length) {
    types.push({
      title: formatMessage({
        id: 'odc.components.RolePage.component.ResourceManagementPermissions',
      }),
      //资源管理权限
      value: IManagerRolePermissionType.resourceManagementPermissions,
    });
  }
  if (systemOperationPermissions?.length) {
    types.push({
      title: formatMessage({
        id: 'odc.components.RolePage.component.SystemOperatingPermissions',
      }),
      //系统操作权限
      value: IManagerRolePermissionType.systemOperationPermissions,
    });
  }
  return types;
};
export const PermissionTypes: React.FC<IManagerRole> = (props) => {
  const content = getPermissionsTypes(props)
    ?.map((item) => item.title)
    ?.join(' | ');
  return (
    <Tooltip className={styles.ellipsis} title={content}>
      {content}
    </Tooltip>
  );
};
const UserDetail: React.FC<{
  data: IManagerRole;
  handleCloseAndReload: () => void;
}> = ({ data, handleCloseAndReload }) => {
  const {
    name,
    id,
    description,
    creatorName,
    createTime,
    updateTime,
    resourceManagementPermissions,
    systemOperationPermissions,
    builtIn,
  } = data;
  const [visible, setVisible] = useState(false);
  const { resource, roles, users } = useContext(ResourceContext);
  const createAbleResourceLabels = resourceManagementTypeOptions
    ?.map((option) => {
      const hasCreate = resourceManagementPermissions?.some(
        (item) => item.resourceType === option.value && item.actions?.includes('create'),
      );
      return hasCreate ? option?.label : null;
    })
    ?.filter(Boolean);
  const _resourceManagementPermissions = resourceManagementPermissions
    ?.filter((item) => {
      return !item?.actions.includes('create');
    })
    ?.map(({ actions, ...rest }) => ({
      ...rest,
      actions: resourceActions.getActionStringValue(
        actions,
        IManagerRolePermissionType.resourceManagementPermissions,
      ),
    }));
  const _systemOperationPermissions = systemOperationPermissions?.map(({ actions, ...rest }) => ({
    ...rest,
    actions: resourceActions.getActionStringValue(
      actions,
      IManagerRolePermissionType.systemOperationPermissions,
    ),
  }));
  const handleDelete = async () => {
    const res = await deleteRole(id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.RolePage.component.Deleted',
        }), // 删除成功
      );

      setVisible(false);
      handleCloseAndReload();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.RolePage.component.UnableToDelete',
        }),

        // 删除失败
      );
    }
  };

  const getResourceName = (type: IManagerResourceType, resourceId: number) => {
    const resourceMap = {
      [IManagerResourceType.resource]: resource,
      [IManagerResourceType.role]: roles,
      [IManagerResourceType.user]: users,
    };
    const info = resourceMap[type]?.find((item) => item.id === resourceId);
    // 后端实现：resourceId为null，表示对所有资源都有权限
    return resourceId
      ? info?.name
      : formatMessage({
          id: 'odc.components.RolePage.component.AllPublicResources',
        });

    // 所有公共资源
  };

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{
            whiteSpace: 'pre',
          }}
          label={formatMessage({
            id: 'odc.components.RolePage.component.RoleName',
          })}

          /* 角色名称 */
        >
          {name}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.RolePage.component.PermissionType',
          })}

          /* 权限类型 */
        >
          <PermissionTypes {...data} />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.RolePage.component.Note',
          })}

          /* 备注 */
        >
          {description}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      {!!resourceManagementPermissions?.length && (
        <Descriptions column={2}>
          <Descriptions.Item span={2}>
            {
              formatMessage({
                id: 'odc.components.RolePage.component.ResourceManagementPermissions',
              }) /*资源管理权限*/
            }
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.components.RolePage.component.ObjectsThatCanBeCreated',
            })}
            /*可新建的对象*/ span={2}
          >
            {createAbleResourceLabels?.join(', ') || '-'}
          </Descriptions.Item>
          <Descriptions.Item span={2}>
            <DisplayTable
              rowKey="id"
              columns={getResourceColumns(
                IManagerRolePermissionType.resourceManagementPermissions,
                getResourceName,
              )}
              dataSource={_resourceManagementPermissions || []}
              showSizeChanger={false}
              showQuickJumper={false}
              pageSize={10}
              scroll={null}
            />
          </Descriptions.Item>
        </Descriptions>
      )}

      {!!_systemOperationPermissions?.length && (
        <Descriptions column={2}>
          <Descriptions.Item span={2}>
            {
              formatMessage({
                id: 'odc.components.RolePage.component.SystemOperatingPermissions',
              }) /*系统操作权限*/
            }
          </Descriptions.Item>
          <Descriptions.Item span={2}>
            <DisplayTable
              rowKey="id"
              columns={getSystemResourceColumns(
                IManagerRolePermissionType.systemOperationPermissions,
              )}
              dataSource={_systemOperationPermissions || []}
              disablePagination
              scroll={null}
            />
          </Descriptions.Item>
        </Descriptions>
      )}

      <Divider
        style={{
          margin: '12px 0',
        }}
      />

      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.RolePage.component.Founder',
          })}

          /* 创建人 */
        >
          {creatorName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.RolePage.component.Created',
          })}

          /* 创建时间 */
        >
          {getFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.RolePage.component.UpdateTime',
          })}

          /* 更新时间 */
        >
          {getFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Space size={5}>
        <span>
          {
            formatMessage({
              id: 'odc.components.RolePage.component.AfterARoleIsDeleted',
            })

            /* 删除角色后，赋予该角色的用户将失去相关权限/公共资源 */
          }
        </span>
        <Button
          type="link"
          disabled={builtIn}
          onClick={() => {
            setVisible(true);
          }}
        >
          {
            formatMessage({
              id: 'odc.components.RolePage.component.DeleteARole',
            })

            /* 删除角色 */
          }
        </Button>
      </Space>
      <CommonDeleteModal
        type={formatMessage({
          id: 'odc.components.RolePage.component.Role',
        })}
        /* 角色 */ description={formatMessage({
          id: 'odc.components.RolePage.component.AfterARoleIsDeleted',
        })}
        /* 删除角色后，赋予该角色的用户将失去相关权限/公共资源 */ name={name}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={handleDelete}
      />
    </>
  );
};
const UserResource: React.FC<{
  data: IManagerRole;
  roles: IManagerRole[];
}> = ({ data: { id }, roles }) => {
  return <CommonUserResource getColumns={getColumns} roles={roles} id={id} roleIds={[id]} />;
};
const DetailContents = {
  [IManagerDetailTabs.DETAIL]: UserDetail,
  [IManagerDetailTabs.RESOURCE]: UserResource,
};
const DetailContent: React.FC<{
  activeKey: IManagerDetailTabs;
  data: IManagerRole;
  roles: IManagerRole[];
  handleCloseAndReload: () => void;
}> = ({ activeKey, ...rest }) => {
  const DetailContent = DetailContents[activeKey];
  return <DetailContent {...rest} />;
};
export default DetailContent;
