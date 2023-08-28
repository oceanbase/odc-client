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

import { getRoleDetail, setRoleEnable } from '@/common/network/manager';
import { Acess, actionTypes, canAcess, createPermission } from '@/component/Acess';
import Action from '@/component/Action';
import { EmptyLabel } from '@/component/CommonFilter';
import CommonTable from '@/component/CommonTable';
import type {
  ITableFilter,
  ITableLoadOptions,
  ITableSorter,
} from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import CommonDetailModal from '@/component/Manage/DetailModal';
import type { IManagerRole } from '@/d.ts';
import { IManagerDetailTabs, IManagerResourceType, IManagerRolePermissionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Button, message, Modal, Space, Switch } from 'antd';
import type { FixedType } from 'rc-table/lib/interface';
import React from 'react';
import { ResourceContext } from '../context';
import DetailContent, { PermissionTypes } from './component/DetailContent';
import FormModal from './component/FormModal';
import styles from './index.less';
import tracert from '@/util/tracert';

interface IProps {}
interface IState {
  searchValue: string;
  editId: number;
  currentRole: IManagerRole;
  detailId: number;
  copyId: number;
  formModalVisible: boolean;
  detailModalVisible: boolean;
  defaultPageSize: number;
  filters: ITableFilter;
  sorter: ITableSorter;
  loading: boolean;
}

const authTypeFilter = [
  {
    text: <EmptyLabel />,
    value: 'EMPTY',
  },

  {
    text: formatMessage({
      id: 'odc.components.RolePage.ResourceManagementPermissions',
    }), //资源管理权限
    value: IManagerRolePermissionType.resourceManagementPermissions,
  },

  {
    text: formatMessage({
      id: 'odc.components.RolePage.SystemOperatingPermissions',
    }), //系统操作权限
    value: IManagerRolePermissionType.systemOperationPermissions,
  },
];

class RolePage extends React.PureComponent<IProps, IState> {
  static contextType = ResourceContext;

  readonly state = {
    searchValue: '',
    editId: null,
    detailId: null,
    currentRole: null,
    copyId: null,
    formModalVisible: false,
    detailModalVisible: false,
    defaultPageSize: 0,
    filters: null,
    sorter: null,
    loading: true,
  };

  private getPageColumns = () => {
    return [
      {
        title: formatMessage({ id: 'odc.components.RolePage.RoleName' }), // 角色名称
        width: 200,
        dataIndex: 'name',
        className: styles.title,
        key: 'name',
        ellipsis: true,
        fixed: 'left' as FixedType,
      },

      {
        title: formatMessage({ id: 'odc.components.RolePage.PermissionType' }), // 权限类型
        ellipsis: true,
        dataIndex: 'authTypes',
        key: 'authTypes',
        filters: authTypeFilter,
        render: (authTypes, record: IManagerRole) => <PermissionTypes {...record} />,
      },

      {
        title: formatMessage({ id: 'odc.components.RolePage.UpdateTime' }), // 更新时间
        width: 160,
        ellipsis: true,
        key: 'updateTime',
        dataIndex: 'updateTime',
        sorter: true,
        render: (updateTime) => getFormatDateTime(updateTime),
      },

      {
        title: formatMessage({ id: 'odc.Auth.Role.EnableStatus' }), //启用状态
        width: 80,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: formatMessage({ id: 'odc.components.RolePage.Enable' }), // 启用
            value: true,
          },

          {
            text: formatMessage({ id: 'odc.components.RolePage.Disable' }), // 停用
            value: false,
          },
        ],

        render: (enabled, record) => {
          const isBuiltIn = record.builtIn;
          return (
            <Switch
              size="small"
              disabled={isBuiltIn}
              checked={enabled}
              onChange={() => {
                this.handleStatusChange(!enabled, record);
              }}
            />
          );
        },
      },

      {
        title: formatMessage({ id: 'odc.components.RolePage.Operation' }), // 操作
        width: 132,
        key: 'action',
        fixed: 'right' as FixedType,
        render: (value, record) => {
          const isBuiltIn = record.builtIn;
          return (
            <Action.Group>
              <Action.Link
                onClick={async () => {
                  this.openDetailModal(record);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.RolePage.See',
                  })
                  /* 查看 */
                }
              </Action.Link>
              <Acess
                {...createPermission(IManagerResourceType.role, actionTypes.update, record.id)}
              >
                <Action.Group>
                  <Action.Link
                    disabled={isBuiltIn}
                    onClick={async () => {
                      this.openFormModal(record.id);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.RolePage.Editing',
                      })

                      /* 编辑 */
                    }
                  </Action.Link>
                </Action.Group>
              </Acess>
            </Action.Group>
          );
        },
      },
    ];
  };

  private openFormModal = (id: number = null) => {
    this.setState({
      formModalVisible: true,
      editId: id,
    });

    this.loadDependentData();
  };

  private openDetailModal = (detail: IManagerRole) => {
    this.setState({
      detailModalVisible: true,
      detailId: detail.id,
      currentRole: detail,
    });

    this.loadDependentData();
  };

  private handleStatusChange = (enabled: boolean, role: IManagerRole, callback = () => {}) => {
    if (!enabled) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.RolePage.AreYouSureYouWant',
        }),

        // 确定要停用角色吗？
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.components.RolePage.DisabledRolesCannotBeUsed',
                })

                /* 被停用的角色将无法使用 */
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.components.RolePage.TheDisabledRoleInformationIs',
                })

                /* 被停用的角色信息仍保留，支持启用 */
              }
            </div>
          </>
        ),

        cancelText: formatMessage({ id: 'odc.components.RolePage.Cancel' }), // 取消
        okText: formatMessage({ id: 'odc.components.RolePage.Determine' }), // 确定
        centered: true,
        onOk: () => {
          if (role) {
            this.handleRoleEnable({
              role,
              enabled,
            });
          }
        },
        onCancel: callback,
      });
    } else {
      this.handleRoleEnable({
        role,
        enabled,
      });
    }
  };

  private handleRoleEnable = async (data: { role: IManagerRole; enabled: boolean }) => {
    const { role, enabled } = data;
    const res = await setRoleEnable({
      id: role.id,
      enabled,
    });

    if (res) {
      message.success(
        enabled
          ? formatMessage({ id: 'odc.components.RolePage.Enabled' }) // 启用成功
          : formatMessage({ id: 'odc.components.RolePage.Disabled' }), // 停用成功
      );
      this.context.loadRoles();
    } else {
      message.error(
        enabled
          ? formatMessage({ id: 'odc.components.RolePage.FailedToEnable' }) // 启用失败
          : formatMessage({ id: 'odc.components.RolePage.Disabled.1' }), // 停用失败
      );
    }
  };

  private handleCloseDetailModal = () => {
    this.setState({
      detailModalVisible: false,
    });
  };

  private handleCopyRole = (copyId: number) => {
    this.handleCloseDetailModal();
    this.setState({
      formModalVisible: true,
      editId: copyId,
      copyId,
    });
  };

  private handleChange = (args: ITableLoadOptions) => {
    const { filters, sorter, searchValue } = args;
    this.setState({
      filters,
      sorter,
      searchValue,
    });
  };

  private loadDependentData() {
    this.context?.loadUsers();
    this.context?.loadConnections();
  }

  async componentDidMount() {
    this.loadDependentData();
    tracert.expo('a3112.b64007.c330919');
    this.context.loadRoles();
  }

  private handleCloseAndReload = () => {
    this.handleCloseDetailModal();
    this.context.loadRoles();
  };

  private handleFilterAndSort = (data: IManagerRole[]) => {
    const { searchValue, filters, sorter } = this.state;
    const { authTypes, enabled } = filters ?? {};
    const { order } = sorter ?? {};
    return data
      ?.filter((item) => {
        return searchValue ? item.name.indexOf(searchValue) > -1 : true;
      })
      ?.filter((item) => {
        return enabled ? enabled.includes(item.enabled) : true;
      })
      .filter((item) => {
        return authTypes
          ? authTypes?.some((auth) => {
              let hasAuth = true;
              if (auth === IManagerRolePermissionType.systemOperationPermissions) {
                hasAuth = !!item.systemOperationPermissions?.length;
              } else if (auth === IManagerRolePermissionType.connectionAccessPermissions) {
                hasAuth = !!item.connectionAccessPermissions?.length;
              } else if (auth === IManagerRolePermissionType.resourceManagementPermissions) {
                hasAuth = !!item.resourceManagementPermissions?.length;
              } else if (auth === 'EMPTY') {
                hasAuth =
                  !item.systemOperationPermissions?.length &&
                  !item.connectionAccessPermissions?.length &&
                  !item.resourceManagementPermissions?.length;
              }
              return hasAuth;
            })
          : true;
      })
      .sort((pre, next) => {
        if (!order) {
          return 0;
        }
        return order === 'ascend'
          ? pre.updateTime - next.updateTime
          : next.updateTime - pre.updateTime;
      });
  };

  private renderDetailFooter = () => {
    const { detailId, currentRole } = this.state;
    const isBuiltIn = currentRole?.builtIn;
    const canAcessUpdate = canAcess({
      resourceIdentifier: IManagerResourceType.role,
      action: actionTypes.update,
    }).accessible;
    return (
      <Space>
        {canAcessUpdate && (
          <>
            <Button
              disabled={isBuiltIn}
              onClick={() => {
                this.handleCopyRole(detailId);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.RolePage.CopyRoles',
                })

                /* 复制角色 */
              }
            </Button>
            <Button
              disabled={isBuiltIn}
              onClick={() => {
                this.handleCloseDetailModal();
                this.openFormModal(detailId);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.RolePage.Editing',
                })

                /* 编辑 */
              }
            </Button>
          </>
        )}

        <Button onClick={this.handleCloseDetailModal}>
          {
            formatMessage({
              id: 'odc.components.RolePage.Closed',
            })

            /* 关闭 */
          }
        </Button>
      </Space>
    );
  };

  private handleCreate = () => {
    tracert.click('a3112.b64007.c330919.d367467');
    this.openFormModal();
  };

  render() {
    const { formModalVisible, detailModalVisible, editId, detailId, copyId } = this.state;
    const { roles } = this.context;
    const canAcessCreate = canAcess({
      resourceIdentifier: IManagerResourceType.role,
      action: actionTypes.create,
    }).accessible;
    return (
      <>
        <CommonTable
          enableResize
          titleContent={null}
          filterContent={{
            searchPlaceholder: formatMessage({
              id: 'odc.components.RolePage.EnterARoleName',
            }),

            /* 请输入角色名称 */
          }}
          operationContent={
            canAcessCreate
              ? {
                  options: [
                    {
                      type: IOperationOptionType.button,
                      content: (
                        <span>
                          {formatMessage({
                            id: 'odc.components.RolePage.CreateARole',
                          })}
                        </span>
                      ),

                      isPrimary: true,
                      onClick: this.handleCreate,
                    },
                  ],
                }
              : null
          }
          onLoad={this.context.loadRoles}
          onChange={this.handleChange}
          tableProps={{
            columns: this.getPageColumns(),
            dataSource: this.handleFilterAndSort(roles),
            rowKey: 'id',
          }}
        />

        <FormModal
          editId={editId}
          copyId={copyId}
          visible={formModalVisible}
          handleStatusChange={this.handleStatusChange}
          onClose={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
              copyId: null,
            });
            this.context.loadRoles();
          }}
        />

        <CommonDetailModal
          width={720}
          visible={detailModalVisible}
          title={formatMessage({
            id: 'odc.components.RolePage.RoleInformation',
          })}
          /* 角色信息 */
          detailId={detailId}
          tabs={[
            {
              key: IManagerDetailTabs.DETAIL,
              title: formatMessage({
                id: 'odc.components.RolePage.RoleDetails',
              }),

              // 角色详情
            },
            {
              key: IManagerDetailTabs.RESOURCE,
              title: formatMessage({
                id: 'odc.components.RolePage.RelatedUsers',
              }),

              // 相关用户
            },
          ]}
          footer={this.renderDetailFooter()}
          getDetail={getRoleDetail}
          onClose={this.handleCloseDetailModal}
          renderContent={(key, data) => (
            <DetailContent
              activeKey={key}
              data={data}
              roles={roles}
              handleCloseAndReload={this.handleCloseAndReload}
            />
          )}
        />
      </>
    );
  }
}

export default RolePage;
