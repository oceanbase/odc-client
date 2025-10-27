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

import {
  batchImportUser,
  getRoleList,
  getUserDetail,
  getUserList,
  setUserEnable,
} from '@/common/network/manager';
import { Acess, actionTypes, canAcess, createPermission } from '@/component/Acess';
import Action from '@/component/Action';
import BatchImportButton from '@/component/BatchImportButton';
import { EmptyLabel } from '@/component/CommonFilter';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import CommonDetailModal from '@/component/Manage/DetailModal';
import RoleList, { useRoleListByIds } from '@/component/Manage/RoleList';
import StatusSwitch from '@/component/StatusSwitch';
import type { IManagerRole, IManagerUser, IResponseData } from '@/d.ts';
import { IManagerDetailTabs, IManagerResourceType } from '@/d.ts';
import odc from '@/plugins/odc';
import type { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { encrypt, getFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Empty, message, Popover, Space, Tooltip, Typography } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import { inject, observer } from 'mobx-react';
import type { FixedType } from 'rc-table/lib/interface';
import React from 'react';
import { ResourceContext } from '../context';
import DetailContent from './component/DetailContent';
import FormModal from './component/FormModal';
import AccessKeyManageModal from './component/AccessKeyManageModal';
import styles from './index.less';
import login from '@/store/login';
import InputSelect from '@/component/InputSelect';

enum UserSearchType {
  all = 'all',
  name = 'name',
  accountName = 'accountName',
}

const UserSearchTypeTextMap = {
  [UserSearchType.all]: formatMessage({
    id: 'src.page.Auth.User.D4FAC19B',
    defaultMessage: '全部',
  }),
  [UserSearchType.name]: formatMessage({
    id: 'odc.components.UserPage.Name',
    defaultMessage: '姓名',
  }),
  [UserSearchType.accountName]: formatMessage({
    id: 'odc.components.UserPage.Account',
    defaultMessage: '账号',
  }),
};

interface IProps {
  userStore?: UserStore;
}
interface IState {
  editId: number;
  detailId: number;
  users: IResponseData<IManagerUser>;
  roles: IManagerRole[];
  user: IManagerUser;
  formModalVisible: boolean;
  detailModalVisible: boolean;
  accessKeyModalVisible: boolean;
  selectedUserId: number;
  searchType: UserSearchType;
  searchValue: string;
}

interface IManagerBatchUser extends IManagerUser {
  roleNames: string[];
}

const getResultByFiles = (files: UploadFile[]) => {
  const res = [];
  files
    ?.filter((file) => file?.status === 'done')
    ?.forEach((file) => {
      file?.response?.data?.batchImportUserList?.map((item) => {
        res.push(item);
      });
    });
  return res;
};

@inject('userStore')
@observer
class UserPage extends React.PureComponent<IProps, IState> {
  static contextType = ResourceContext;

  private tableRef = React.createRef<ITableInstance>();

  private batchImportRef = React.createRef<{
    closeModal: () => void;
  }>();

  readonly state = {
    editId: null,
    detailId: null,
    users: null,
    roles: null,
    user: null,
    formModalVisible: false,
    detailModalVisible: false,
    accessKeyModalVisible: false,
    selectedUserId: null,
    searchValue: undefined,
    searchType: undefined,
  };

  private getPageColumns = (roles: any[]) => {
    return [
      {
        title: formatMessage({ id: 'odc.components.UserPage.Name', defaultMessage: '姓名' }), // 姓名
        dataIndex: 'name',
        width: 200,
        ellipsis: true,
        key: 'name',
        className: styles.title,
        fixed: 'left' as FixedType,
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.Account', defaultMessage: '账号' }), // 账号
        width: 200,
        ellipsis: true,
        dataIndex: 'accountName',
        key: 'accountName',
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.Role', defaultMessage: '角色' }), // 角色
        dataIndex: 'roles',
        ellipsis: true,
        width: 220,
        key: 'roles',
        filters: [{ name: <EmptyLabel />, id: 0 }].concat(roles ?? []).map(({ name, id }) => {
          return {
            text: name,
            value: id,
          };
        }),
        onFilter: (value, record) => {
          // 如果过滤值为0，表示选择"空"选项，匹配没有角色的用户
          if (value === 0) {
            return !record?.roles?.length;
          }
          // 检查用户是否包含选中的角色
          return record?.roles?.some((role) => role.id === value);
        },
        render: (roles) => {
          return <RoleList roles={roles} isShowIcon />;
        },
      },

      {
        title: formatMessage({
          id: 'odc.components.UserPage.UpdateTime',
          defaultMessage: '更新时间',
        }), // 更新时间
        width: 160,
        ellipsis: true,
        key: 'updateTime',
        dataIndex: 'updateTime',
        sorter: true,
        render: (updateTime) => getFormatDateTime(updateTime),
      },

      {
        title: formatMessage({
          id: 'odc.components.UserPage.LogonTime',
          defaultMessage: '登录时间',
        }), // 登录时间
        width: 160,
        ellipsis: true,
        key: 'lastLoginTime',
        dataIndex: 'lastLoginTime',
        sorter: true,
        render: (lastLoginTime) => (lastLoginTime ? getFormatDateTime(lastLoginTime) : '-'),
      },

      {
        title: formatMessage({ id: 'odc.Auth.User.EnableStatus', defaultMessage: '启用状态' }), //启用状态
        width: 80,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: formatMessage({ id: 'odc.components.UserPage.Enable', defaultMessage: '启用' }), // 启用
            value: true,
          },

          {
            text: formatMessage({ id: 'odc.components.UserPage.Disable', defaultMessage: '停用' }), // 停用
            value: false,
          },
        ],

        render: (enabled, record) => {
          const canAcessUpdate = () =>
            canAcess({
              resourceIdentifier: IManagerResourceType.user,
              action: actionTypes.update,
            }).accessible;
          const disabledOp = this.isMe(record) || !canAcessUpdate();
          return (
            <StatusSwitch
              disabled={disabledOp}
              checked={enabled}
              onConfirm={() => {
                this.handleStatusChange(!enabled, record);
              }}
              onCancel={() => {
                this.handleStatusChange(!enabled, record);
              }}
            />
          );
        },
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.Operation', defaultMessage: '操作' }), // 操作
        width: 212,
        key: 'action',
        fixed: 'right' as FixedType,
        render: (value, record) => {
          const disabledOp = this.isMe(record);
          return (
            <Action.Group>
              <Action.Link
                key="view"
                onClick={async () => {
                  this.openDetailModal(record);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.UserPage.See',
                    defaultMessage: '查看',
                  }) /* 查看 */
                }
              </Action.Link>
              <Acess
                {...createPermission(IManagerResourceType.user, actionTypes.update, record.id)}
                key="editAccess"
              >
                <Action.Group>
                  <Action.Link
                    key="edit"
                    disabled={disabledOp}
                    onClick={async () => {
                      this.openFormModal(record.id);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.UserPage.Editing',
                        defaultMessage: '编辑',
                      })
                      /* 编辑 */
                    }
                  </Action.Link>
                </Action.Group>
              </Acess>
              <Acess
                {...createPermission(IManagerResourceType.user, actionTypes.update, record.id)}
                key="accessKey"
              >
                <Action.Group>
                  <Action.Link
                    key="accessKey"
                    disabled={disabledOp}
                    onClick={async () => {
                      this.openAccessKeyModal(record.id);
                    }}
                  >
                    {formatMessage({
                      id: 'src.page.Auth.User.C98D9F83',
                      defaultMessage: '管理 AccessKey',
                    })}
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
  };

  private openDetailModal = (user: IManagerUser) => {
    this.setState({
      detailModalVisible: true,
      detailId: user.id,
      user,
    });
  };

  private handleStatusChange = (enabled: boolean, user: IManagerUser) => {
    this.handleUserEnable({
      user,
      enabled,
    });
  };

  private handleUserEnable = async (data: { user: IManagerUser; enabled: boolean }) => {
    const { user, enabled } = data;
    const res = await setUserEnable({
      id: user.id,
      enabled,
    });

    if (res) {
      message.success(
        enabled
          ? formatMessage({ id: 'odc.components.UserPage.Enabled', defaultMessage: '启用成功' }) // 启用成功
          : formatMessage({ id: 'odc.components.UserPage.Disabled', defaultMessage: '停用成功' }), // 停用成功
      );
      this.reloadData();
    } else {
      message.error(
        enabled
          ? formatMessage({
              id: 'odc.components.UserPage.FailedToEnable',
              defaultMessage: '启用失败',
            }) // 启用失败
          : formatMessage({ id: 'odc.components.UserPage.Disabled.1', defaultMessage: '停用失败' }), // 停用失败
      );
    }
  };

  private handleCloseDetailModal = () => {
    this.setState({
      detailModalVisible: false,
    });
  };

  private openAccessKeyModal = (userId: number) => {
    this.setState({
      accessKeyModalVisible: true,
      selectedUserId: userId,
    });
  };

  private handleCloseAccessKeyModal = () => {
    this.setState({
      accessKeyModalVisible: false,
      selectedUserId: null,
    });
  };

  loadRoles = async () => {
    const roles = await getRoleList();
    this.setState({
      roles: roles?.contents,
    });
  };

  private loadData = async (args: ITableLoadOptions = {}) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { roleIds, enabled } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const data: Record<string, any> = {
      name: [UserSearchType.name, UserSearchType.all].includes(this.state.searchType)
        ? this.state.searchValue
        : undefined,
      accountName: [UserSearchType.accountName, UserSearchType.all].includes(this.state.searchType)
        ? this.state.searchValue
        : undefined,
      roleId: roleIds,
      enabled,
      page: current,
      size: pageSize,
      sort: column?.dataIndex,
      minPrivilege: 'read',
    };

    // roleIds filter
    data.roleId = roleIds?.length ? roleIds : undefined;
    // enabled filter
    data.enabled = enabled?.length === 1 ? enabled : undefined;
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const users = await getUserList(data);
    this.setState({
      users,
    });
  };

  private handleCloseAndReload = () => {
    this.handleCloseDetailModal();
    this.reloadData();
    this.context.loadUsers();
  };

  private reloadData = () => {
    this.tableRef.current.reload();
  };

  private isMe = (user: IManagerUser) => {
    const {
      userStore: { user: me },
    } = this.props;
    return user?.id === me?.id;
  };

  private handleCreate = () => {
    this.openFormModal();
  };

  private handleBatchImportSubmit = async (files: UploadFile[]) => {
    const users: IManagerUser[] = getResultByFiles(files);
    const formData = users?.map(({ password, ...rest }) => ({
      ...rest,
      password: encrypt(password),
    }));
    const res = await batchImportUser(formData);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.UserPage.BatchImportSucceeded',
          defaultMessage: '批量导入成功',
        }), //批量导入成功
      );
      this.batchImportRef.current.closeModal();
      this.reloadData();
    }
  };

  private handleFileChange = (files: UploadFile[]) => {
    return files.map((item) => {
      const res = item.response;
      if (res) {
        const result = { ...item };
        const errorMessage = res?.data?.errorMessage;
        if (errorMessage) {
          result.status = 'error';
          result.response = errorMessage;
        }
        return result;
      }
      return item;
    });
  };

  private handleSearch = ({
    searchValue,
    searchType,
  }: {
    searchValue: string;
    searchType: UserSearchType;
  }) => {
    this.setState(
      {
        searchValue,
        searchType,
      },
      () => {
        this.loadData();
      },
    );
  };

  componentDidMount() {
    this.loadRoles();
  }

  render() {
    const {
      formModalVisible,
      detailModalVisible,
      accessKeyModalVisible,
      editId,
      detailId,
      selectedUserId,
      users,
      roles,
      user,
    } = this.state;
    const disabledOp = this.isMe(user);
    const selectTypeOptions = Object.keys(UserSearchType).map((item) => ({
      value: item,
      label: UserSearchTypeTextMap[item],
    }));
    const canAcessCreate = canAcess({
      resourceIdentifier: IManagerResourceType.user,
      action: actionTypes.create,
    }).accessible;
    const canAcessUpdate = canAcess({
      resourceIdentifier: IManagerResourceType.user,
      action: actionTypes.update,
    }).accessible;

    return (
      <>
        <CommonTable
          ref={this.tableRef}
          enableResize
          titleContent={null}
          filterContent={{
            enabledSearch: false,
            filters: [
              {
                render: (params) => {
                  return (
                    <InputSelect
                      searchValue={this.state.searchValue}
                      searchType={this.state.searchType}
                      selectTypeOptions={selectTypeOptions}
                      onSelect={({ searchValue, searchType }) => {
                        this.setState(
                          {
                            searchValue,
                            searchType: searchType as UserSearchType,
                          },
                          () => {
                            this.loadData(params);
                          },
                        );
                      }}
                    />
                  );
                },
              },
            ],
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
                            id: 'odc.components.UserPage.CreateUser',
                            defaultMessage: '新建用户',
                          })}
                        </span>
                      ),

                      isPrimary: true,
                      disabled: !odc.appConfig.manage.user.create,
                      onClick: this.handleCreate,
                    },
                    {
                      type: IOperationOptionType.custom,
                      render: () => (
                        <BatchImportButton
                          type="button"
                          ref={this.batchImportRef}
                          action="/api/v2/iam/users/previewBatchImport"
                          description={formatMessage({
                            id: 'odc.components.UserPage.TheFileMustContainInformation',
                            defaultMessage:
                              '文件需包含用户账号、姓名、密码等信息，建议使用用户配置模版',
                          })} /*文件需包含用户账号、姓名、密码等信息，建议使用用户配置模版*/
                          templatePath="/api/v2/iam/users/template"
                          previewContent={(data: IManagerBatchUser[]) => {
                            if (!data?.length) {
                              return (
                                <Empty
                                  description={formatMessage({
                                    id: 'odc.components.UserPage.NoValidUserInformationIs',
                                    defaultMessage: '暂无有效用户信息',
                                  })} /*暂无有效用户信息*/
                                />
                              );
                            }
                            return (
                              <>
                                {data.map((item, index) => {
                                  const hasError = !!item.errorMessage;
                                  return (
                                    <div key={index} className={styles['pre-item']}>
                                      {hasError ? (
                                        <Tooltip title={item.errorMessage}>
                                          <Space size={4}>
                                            <Typography.Text>{`${item.name}(${item.accountName})`}</Typography.Text>
                                            <ExclamationCircleFilled
                                              style={{
                                                color: 'var(--icon-orange-color)',
                                              }}
                                            />
                                          </Space>
                                        </Tooltip>
                                      ) : (
                                        <Popover
                                          placement="right"
                                          content={
                                            <>
                                              <div>
                                                {
                                                  formatMessage(
                                                    {
                                                      id: 'odc.components.UserPage.NameItemname',
                                                      defaultMessage: '姓名：{itemName}',
                                                    },
                                                    { itemName: item.name },
                                                  ) /*姓名：{itemName}*/
                                                }
                                              </div>
                                              <div>
                                                {
                                                  formatMessage(
                                                    {
                                                      id: 'odc.components.UserPage.AccountItemaccountname',
                                                      defaultMessage: '账号：{itemAccountName}',
                                                    },
                                                    { itemAccountName: item.accountName },
                                                  ) /*账号：{itemAccountName}*/
                                                }
                                              </div>
                                              <div>
                                                {
                                                  formatMessage({
                                                    id: 'odc.components.UserPage.Role.1',
                                                    defaultMessage: '角色：',
                                                  }) /*角色：*/
                                                }

                                                {item.roleNames?.join(' | ') || '-'}
                                              </div>
                                            </>
                                          }
                                        >
                                          <Typography.Text>{`${item.name}(${item.accountName})`}</Typography.Text>
                                        </Popover>
                                      )}
                                    </div>
                                  );
                                })}
                              </>
                            );
                          }}
                          getResultByFiles={getResultByFiles}
                          onChange={this.handleFileChange}
                          onSubmit={this.handleBatchImportSubmit}
                        />
                      ),
                    },
                  ],
                }
              : null
          }
          onLoad={this.loadData}
          onChange={this.loadData}
          tableProps={{
            columns: this.getPageColumns(roles),
            dataSource: users?.contents,
            rowKey: 'id',
            pagination: {
              current: users?.page?.number,
              total: users?.page?.totalElements,
            },
          }}
        />

        <FormModal
          editId={editId}
          roles={roles}
          visible={formModalVisible}
          handleStatusChange={this.handleStatusChange}
          reloadData={this.reloadData}
          onClose={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
            });
            this.loadData();
          }}
          onCancel={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
            });
          }}
        />

        <CommonDetailModal
          visible={detailModalVisible}
          title={formatMessage({
            id: 'odc.components.UserPage.UserInformation',
            defaultMessage: '用户信息',
          })}
          /* 用户信息 */
          detailId={detailId}
          tabs={[
            {
              key: IManagerDetailTabs.DETAIL,
              title: formatMessage({
                id: 'odc.components.UserPage.UserDetails',
                defaultMessage: '用户详情',
              }),
              // 用户详情
            },
            {
              key: IManagerDetailTabs.RESOURCE,
              title: formatMessage({
                id: 'odc.components.UserPage.RelatedResources',
                defaultMessage: '相关资源',
              }),
              // 相关资源
            },
          ]}
          footer={
            <Space>
              {canAcessUpdate && (
                <Button
                  disabled={disabledOp}
                  onClick={() => {
                    this.handleCloseDetailModal();
                    this.openFormModal(detailId);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.UserPage.Editing',
                      defaultMessage: '编辑',
                    })
                    /* 编辑 */
                  }
                </Button>
              )}

              <Button onClick={this.handleCloseDetailModal}>
                {
                  formatMessage({
                    id: 'odc.components.UserPage.Closed',
                    defaultMessage: '关闭',
                  })
                  /* 关闭 */
                }
              </Button>
            </Space>
          }
          onClose={this.handleCloseDetailModal}
          getDetail={async (id: number) => {
            const user = await getUserDetail(id);
            return {
              ...user,
              roles: users?.contents?.find((i) => i?.id === id)?.roles,
            };
          }}
          renderContent={(key, data) => (
            <DetailContent
              activeKey={key}
              data={data}
              disabledOp={disabledOp}
              roles={roles}
              handleCloseAndReload={this.handleCloseAndReload}
            />
          )}
        />

        <AccessKeyManageModal
          visible={accessKeyModalVisible}
          userId={selectedUserId}
          onClose={this.handleCloseAccessKeyModal}
        />
      </>
    );
  }
}

export default UserPage;
