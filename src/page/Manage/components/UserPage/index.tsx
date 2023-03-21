import {
  batchImportUser,
  getUserDetail,
  getUserList,
  setUserEnable,
} from '@/common/network/manager';
import { Acess, actionTypes, canAcess, systemUpdatePermissions } from '@/component/Acess';
import Action from '@/component/Action';
import BatchImportButton from '@/component/BatchImportButton';
import { EmptyLabel } from '@/component/CommonFilter';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import appConfig from '@/constant/appConfig';
import type { IManagerUser, IResponseData } from '@/d.ts';
import { IManagerDetailTabs, IManagerResourceType } from '@/d.ts';
import { ManageContext } from '@/page/Manage/context';
import type { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { encrypt, getLocalFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Empty, message, Modal, Popover, Space, Tooltip, Typography } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import { inject, observer } from 'mobx-react';
import type { FixedType } from 'rc-table/lib/interface';
import React from 'react';
import CommonDetailModal from '../CommonDetailModal';
import Status from '../CommonStatus';
import FormUserModal from '../FormUserModal';
import { RoleList, UserDetailContent } from './component';
import styles from './index.less';

interface IProps {
  userStore?: UserStore;
}
interface IState {
  editId: number;
  detailId: number;
  users: IResponseData<IManagerUser>;
  user: IManagerUser;
  formModalVisible: boolean;
  detailModalVisible: boolean;
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
  static contextType = ManageContext;

  private tableRef = React.createRef<ITableInstance>();

  private batchImportRef = React.createRef<{
    closeModal: () => void;
  }>();

  readonly state = {
    editId: null,
    detailId: null,
    users: null,
    user: null,
    formModalVisible: false,
    detailModalVisible: false,
  };

  private getPageColumns = () => {
    const { roles } = this.context;
    return [
      {
        title: formatMessage({ id: 'odc.components.UserPage.Name' }), // 姓名
        dataIndex: 'name',
        width: 120,
        ellipsis: true,
        key: 'name',
        className: styles.title,
        fixed: 'left' as FixedType,
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.Account' }), // 账号
        width: 140,
        ellipsis: true,
        dataIndex: 'accountName',
        key: 'accountName',
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.Role' }), // 角色
        dataIndex: 'roleIds',
        ellipsis: true,
        key: 'roleIds',
        filters: [{ name: <EmptyLabel />, id: 0 }]
          .concat([...roles.values()])
          .map(({ name, id }) => {
            return {
              text: name,
              value: id,
            };
          }),
        render: (roleIds) => {
          return <RoleList roleIds={roleIds} isShowIcon />;
        },
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.State' }), // 状态
        width: 115,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: formatMessage({ id: 'odc.components.UserPage.Enable' }), // 启用
            value: true,
          },

          {
            text: formatMessage({ id: 'odc.components.UserPage.Disable' }), // 停用
            value: false,
          },
        ],

        render: (enabled) => <Status enabled={enabled} />,
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.UpdateTime' }), // 更新时间
        width: 190,
        ellipsis: true,
        key: 'updateTime',
        dataIndex: 'updateTime',
        sorter: true,
        render: (updateTime) => getLocalFormatDateTime(updateTime),
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.LogonTime' }), // 登录时间
        width: 190,
        ellipsis: true,
        key: 'lastLoginTime',
        dataIndex: 'lastLoginTime',
        sorter: true,
        render: (lastLoginTime) => (lastLoginTime ? getLocalFormatDateTime(lastLoginTime) : '-'),
      },

      {
        title: formatMessage({ id: 'odc.components.UserPage.Operation' }), // 操作
        width: 124,
        key: 'action',
        fixed: 'right' as FixedType,
        render: (value, record) => {
          const disabledOp = this.isAdminOrMe(record);
          return (
            <Action.Group>
              <Action.Link
                onClick={async () => {
                  this.openDetailModal(record);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.UserPage.See',
                  }) /* 查看 */
                }
              </Action.Link>
              <Acess {...systemUpdatePermissions[IManagerResourceType.user]}>
                <Action.Group>
                  <Action.Link
                    disabled={disabledOp}
                    onClick={async () => {
                      this.openFormModal(record.id);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.UserPage.Editing',
                      })
                      /* 编辑 */
                    }
                  </Action.Link>
                  {record.enabled ? (
                    <Action.Link
                      disabled={disabledOp}
                      onClick={async () => {
                        this.handleStatusChange(false, record);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.components.UserPage.Disable',
                        })
                        /* 停用 */
                      }
                    </Action.Link>
                  ) : (
                    <Action.Link
                      disabled={disabledOp}
                      onClick={async () => {
                        this.handleStatusChange(true, record);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.components.UserPage.Enable',
                        })
                        /* 启用 */
                      }
                    </Action.Link>
                  )}
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

  private handleStatusChange = (enabled: boolean, user: IManagerUser, callback = () => {}) => {
    if (!enabled) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.UserPage.AreYouSureYouWant',
        }),
        // 确定要停用用户吗？
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.components.UserPage.DisabledUsersWillNotBe',
                })
                /* 被停用的用户将无法登录产品 */
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.components.UserPage.TheInformationOfTheDeactivated',
                })
                /* 被停用的用户账号信息仍保留，支持启用 */
              }
            </div>
          </>
        ),

        cancelText: formatMessage({ id: 'odc.components.UserPage.Cancel' }), // 取消
        okText: formatMessage({ id: 'odc.components.UserPage.Determine' }), // 确定
        centered: true,
        onOk: () => {
          if (user) {
            this.handleUserEnable({
              user,
              enabled,
            });
          }
        },
        onCancel: callback,
      });
    } else {
      this.handleUserEnable({
        user,
        enabled,
      });
    }
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
          ? formatMessage({ id: 'odc.components.UserPage.Enabled' }) // 启用成功
          : formatMessage({ id: 'odc.components.UserPage.Disabled' }), // 停用成功
      );
      this.reloadData();
    } else {
      message.error(
        enabled
          ? formatMessage({ id: 'odc.components.UserPage.FailedToEnable' }) // 启用失败
          : formatMessage({ id: 'odc.components.UserPage.Disabled.1' }), // 停用失败
      );
    }
  };

  private handleCloseDetailModal = () => {
    this.setState({
      detailModalVisible: false,
    });
  };

  private loadData = async (args: ITableLoadOptions = {}) => {
    const { searchValue = '', filters, sorter, pagination, pageSize } = args ?? {};
    const { roleIds, enabled } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const data: Record<string, any> = {
      name: searchValue,
      accountName: searchValue,
      roleId: roleIds,
      enabled,
      page: current,
      size: pageSize,
      sort: column?.dataIndex,
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
    this.context.getUserList();
  };

  private reloadData = () => {
    this.tableRef.current.reload();
  };

  private isAdminOrMe = (user: IManagerUser) => {
    const {
      userStore: { user: me },
    } = this.props;
    const isAdmin = appConfig.manage.user.isAdmin
      ? appConfig.manage.user.isAdmin(user)
      : user?.builtIn && user?.accountName === 'admin';
    const isMeUser = user?.id === me?.id;
    return isAdmin || isMeUser;
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
        formatMessage({ id: 'odc.components.UserPage.BatchImportSucceeded' }), //批量导入成功
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

  render() {
    const { formModalVisible, detailModalVisible, editId, detailId, users, user } = this.state;
    const { roles } = this.context;
    const disabledOp = this.isAdminOrMe(user);
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
          titleContent={{
            title: formatMessage({
              id: 'odc.components.UserPage.UserManagement',
            }),
            /* 用户管理 */
          }}
          filterContent={{
            searchPlaceholder: formatMessage({
              id: 'odc.components.UserPage.EnterAUserOrAccount',
            }),
            /* 请输入用户/账号搜索 */
          }}
          operationContent={
            canAcessCreate
              ? {
                  options: [
                    {
                      type: IOperationOptionType.custom,
                      render: () => (
                        <BatchImportButton
                          type="button"
                          ref={this.batchImportRef}
                          action="/api/v2/iam/users/previewBatchImport"
                          description={formatMessage({
                            id: 'odc.components.UserPage.TheFileMustContainInformation',
                          })} /*文件需包含用户账号、姓名、密码等信息，建议使用用户配置模版*/
                          templateName="user_template.xlsx"
                          previewContent={(data: IManagerBatchUser[]) => {
                            if (!data?.length) {
                              return (
                                <Empty
                                  description={formatMessage({
                                    id: 'odc.components.UserPage.NoValidUserInformationIs',
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
                                                    },
                                                    { itemAccountName: item.accountName },
                                                  ) /*账号：{itemAccountName}*/
                                                }
                                              </div>
                                              <div>
                                                {
                                                  formatMessage({
                                                    id: 'odc.components.UserPage.Role.1',
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
                    {
                      type: IOperationOptionType.button,
                      content: (
                        <span>
                          {formatMessage({
                            id: 'odc.components.UserPage.CreateUser',
                          })}
                        </span>
                      ),

                      isPrimary: true,
                      disabled: !appConfig.manage.user.create,
                      onClick: this.handleCreate,
                    },
                  ],
                }
              : null
          }
          onLoad={this.loadData}
          onChange={this.loadData}
          tableProps={{
            columns: this.getPageColumns(),
            dataSource: users?.contents,
            rowKey: 'id',
            pagination: {
              current: users?.page?.number,
              total: users?.page?.totalElements,
            },
          }}
        />

        <FormUserModal
          editId={editId}
          role={[...roles.values()]}
          visible={formModalVisible}
          handleStatusChange={this.handleStatusChange}
          reloadData={this.reloadData}
          onClose={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
            });
            this.context.getUserList();
          }}
        />

        <CommonDetailModal
          visible={detailModalVisible}
          title={formatMessage({
            id: 'odc.components.UserPage.UserInformation',
          })}
          /* 用户信息 */
          detailId={detailId}
          tabs={[
            {
              key: IManagerDetailTabs.DETAIL,
              title: formatMessage({
                id: 'odc.components.UserPage.UserDetails',
              }),
              // 用户详情
            },
            {
              key: IManagerDetailTabs.RESOURCE,
              title: formatMessage({
                id: 'odc.components.UserPage.RelatedResources',
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
                    })
                    /* 编辑 */
                  }
                </Button>
              )}

              <Button onClick={this.handleCloseDetailModal}>
                {
                  formatMessage({
                    id: 'odc.components.UserPage.Closed',
                  })
                  /* 关闭 */
                }
              </Button>
            </Space>
          }
          onClose={this.handleCloseDetailModal}
          getDetail={getUserDetail}
          renderContent={(key, data) => (
            <UserDetailContent
              activeKey={key}
              data={data}
              disabledOp={disabledOp}
              handleCloseAndReload={this.handleCloseAndReload}
            />
          )}
        />
      </>
    );
  }
}

export default UserPage;
