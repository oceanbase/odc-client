import {
  getResourceGroupDetail,
  getResourceGroupList,
  setPublicResourceGroup,
} from '@/common/network/manager';
import { Acess, actionTypes, canAcess, systemUpdatePermissions } from '@/component/Acess';
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import appConfig from '@/constant/appConfig';
import type { IManagerResourceGroup, IResponseData } from '@/d.ts';
import { IManagerDetailTabs, IManagerResourceType } from '@/d.ts';
import type { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Button, message, Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import type { FixedType } from 'rc-table/lib/interface';
import React from 'react';
import { ManageContext } from '../../context';
import CommonDetailModal from '../CommonDetailModal';
import Status from '../CommonStatus';
import FormResourceGroupModal from '../FormResourceGroupModal';
import { UserDetailContent } from './component';
import styles from './index.less';

interface IProps {
  settingStore?: SettingStore;
}

interface IState {
  resourceGroups: IResponseData<IManagerResourceGroup>;
  editId: number;
  detailId: number;
  formModalVisible: boolean;
  detailModalVisible: boolean;
}

@inject('settingStore')
@observer
class ResourceGroup extends React.PureComponent<IProps, IState> {
  static contextType = ManageContext;

  private tableRef = React.createRef<ITableInstance>();

  readonly state = {
    editId: null,
    detailId: null,
    formModalVisible: false,
    detailModalVisible: false,
    resourceGroups: null,
  };

  componentDidMount() {
    this.context.getPublicConnectionList();
  }

  private getPageColumns = () => {
    return [
      {
        title: formatMessage({
          id: 'odc.components.ResourceGroupPage.ResourceGroupId',
        }),
        // 资源组 ID
        dataIndex: 'id',
        key: 'id',
        sorter: true,
        ellipsis: true,
        width: 110,
        fixed: 'left' as FixedType,
      },

      {
        title: formatMessage({
          id: 'odc.components.ResourceGroupPage.ResourceGroupName',
        }),

        // 资源组名称
        dataIndex: 'name',
        className: styles.title,
        key: 'name',
        ellipsis: true,
        fixed: 'left' as FixedType,
      },

      {
        title: formatMessage({
          id: 'odc.components.ResourceGroupPage.Connections',
        }),

        // 连接数量
        width: 127,
        ellipsis: true,
        key: 'connections',
        dataIndex: 'connections',
        render: (connections) => connections?.length ?? 0,
      },

      {
        title: formatMessage({ id: 'odc.components.ResourceGroupPage.State' }), // 状态
        width: 115,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: formatMessage({
              id: 'odc.components.ResourceGroupPage.Enable',
            }),

            // 启用
            value: true,
          },

          {
            text: formatMessage({
              id: 'odc.components.ResourceGroupPage.Disable',
            }),

            // 停用
            value: false,
          },
        ],

        render: (enabled) => <Status enabled={enabled} />,
      },

      {
        title: formatMessage({
          id: 'odc.components.ResourceGroupPage.UpdateTime',
        }),

        // 更新时间
        width: 190,
        ellipsis: true,
        key: 'updateTime',
        dataIndex: 'updateTime',
        sorter: true,
        render: (updateTime) => getLocalFormatDateTime(updateTime),
      },

      {
        title: formatMessage({
          id: 'odc.components.ResourceGroupPage.Operation',
        }),

        // 操作
        width: 124,
        key: 'action',
        fixed: 'right' as FixedType,
        render: (value, record) => (
          <Action.Group>
            <Action.Link
              onClick={async () => {
                this.openDetailModal(record.id);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.ResourceGroupPage.See',
                })

                /* 查看 */
              }
            </Action.Link>
            <Acess {...systemUpdatePermissions[IManagerResourceType.resource_group]}>
              <Action.Group>
                <Action.Link
                  onClick={async () => {
                    this.openFormModal(record.id);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.ResourceGroupPage.Editing',
                    })

                    /* 编辑 */
                  }
                </Action.Link>
                {record.enabled ? (
                  <Action.Link
                    onClick={async () => {
                      this.handleStatusChange(false, record);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.ResourceGroupPage.Disable',
                      })

                      /* 停用 */
                    }
                  </Action.Link>
                ) : (
                  <Action.Link
                    onClick={async () => {
                      this.handleStatusChange(true, record);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.ResourceGroupPage.Enable',
                      })

                      /* 启用 */
                    }
                  </Action.Link>
                )}
              </Action.Group>
            </Acess>
          </Action.Group>
        ),
      },
    ];
  };

  private openFormModal = (id: number = null) => {
    this.setState({
      formModalVisible: true,
      editId: id,
    });
  };

  private openDetailModal = (detailId: number) => {
    this.setState({
      detailModalVisible: true,
      detailId,
    });
  };

  private handleStatusChange = (
    enabled: boolean,
    resourceGroup: IManagerResourceGroup,
    callback = () => {},
  ) => {
    if (!enabled) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.ResourceGroupPage.AreYouSureYouWant',
        }),

        // 确定要停用资源组吗？
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.components.ResourceGroupPage.AfterTheResourceGroupIs',
                })

                /* 被停用后用户将无法访问资源组包含的连接 */
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.components.ResourceGroupPage.TheDeactivatedResourceGroupRemains',
                })

                /* 被停用的资源组仍保留，支持启用 */
              }
            </div>
          </>
        ),

        cancelText: formatMessage({
          id: 'odc.components.ResourceGroupPage.Cancel',
        }),

        // 取消
        okText: formatMessage({
          id: 'odc.components.ResourceGroupPage.Determine',
        }),

        // 确定
        centered: true,
        onOk: () => {
          if (resourceGroup) {
            this.handleResourceGroupEnable({
              enabled,
              resourceGroup,
            });
          }
        },
        onCancel: callback,
      });
    } else {
      this.handleResourceGroupEnable({
        enabled,
        resourceGroup,
      });
    }
  };

  private handleCloseDetailModal = () => {
    this.setState({
      detailModalVisible: false,
    });
  };

  private handleResourceGroupEnable = async (data: {
    resourceGroup: IManagerResourceGroup;
    enabled: boolean;
  }) => {
    const { resourceGroup, enabled } = data;
    const res = await setPublicResourceGroup({
      id: resourceGroup.id,
      enabled,
    });

    if (res) {
      message.success(
        enabled
          ? formatMessage({ id: 'odc.components.ResourceGroupPage.Enabled' }) // 启用成功
          : formatMessage({ id: 'odc.components.ResourceGroupPage.Disabled' }), // 停用成功
      );
      this.reloadData();
    } else {
      message.error(
        enabled
          ? formatMessage({
              id: 'odc.components.ResourceGroupPage.FailedToEnable',
            })
          : // 启用失败
            formatMessage({
              id: 'odc.components.ResourceGroupPage.Disabled.1',
            }), // 停用失败
      );
    }
  };

  private loadData = async (args: ITableLoadOptions) => {
    const { searchValue = '', filters, sorter, pagination, pageSize } = args ?? {};
    const { enabled } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};

    const data = {
      fuzzySearchKeyword: searchValue,
      status: enabled,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    // enabled filter
    data.status = enabled?.length ? enabled : undefined;
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const resourceGroups = await getResourceGroupList(data);
    this.setState({
      resourceGroups,
    });
  };

  private handleCloseAndReload = () => {
    this.handleCloseDetailModal();
    this.reloadData();
  };

  private reloadData = () => {
    this.tableRef.current.reload();
    this.context.getResourceGroupList();
  };

  private handleCreate = () => {
    this.openFormModal();
  };

  render() {
    const {
      settingStore: { serverSystemInfo },
    } = this.props;
    const { formModalVisible, detailModalVisible, editId, detailId, resourceGroups } = this.state;
    const { publicConnections } = this.context;
    const canAcessCreate = canAcess({
      resourceIdentifier: IManagerResourceType.resource_group,
      action: actionTypes.create,
    }).accessible;
    const canAcessUpdate = canAcess({
      resourceIdentifier: IManagerResourceType.resource_group,
      action: actionTypes.update,
    }).accessible;
    return (
      <>
        <CommonTable
          enableResize
          ref={this.tableRef}
          titleContent={{
            title: formatMessage({
              id: 'odc.components.ResourceGroupPage.ResourceGroupManagement',
            }),

            /* 资源组管理 */
          }}
          filterContent={{
            searchPlaceholder: formatMessage({
              id: 'odc.components.ResourceGroupPage.EnterAResourceGroupName',
            }),

            /* 请输入资源组名称 */
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
                            id: 'odc.components.ResourceGroupPage.CreateAResourceGroup',
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
          onLoad={this.loadData}
          onChange={this.loadData}
          tableProps={{
            columns: this.getPageColumns(),
            dataSource: resourceGroups?.contents,
            rowKey: 'id',
            pagination: {
              current: resourceGroups?.page?.number,
              total: resourceGroups?.page?.totalElements,
            },
          }}
        />

        <FormResourceGroupModal
          editId={editId}
          visible={formModalVisible}
          publicConnections={publicConnections?.contents}
          handleStatusChange={this.handleStatusChange}
          reloadData={this.reloadData}
          onClose={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
            });

            this.context.getResourceGroupList();
          }}
        />

        <CommonDetailModal
          visible={detailModalVisible}
          title={formatMessage({
            id: 'odc.components.ResourceGroupPage.ResourceGroupInformation',
          })}
          /* 资源组信息 */
          detailId={detailId}
          tabs={[
            {
              key: IManagerDetailTabs.DETAIL,
              title: formatMessage({
                id: 'odc.components.ResourceGroupPage.ResourceGroupDetails',
              }),

              // 资源组详情
            },
            {
              key: IManagerDetailTabs.RESOURCE,
              title: formatMessage({
                id: 'odc.components.ResourceGroupPage.RelatedUsers',
              }),

              // 相关用户
              hidden: appConfig.manage.user.tabInVisible(this.props.settingStore),
            },

            {
              key: IManagerDetailTabs.TASK_FLOW,
              title: formatMessage({
                id: 'odc.components.ResourceGroupPage.RelatedProcesses',
              }), //相关流程
            },
          ]}
          footer={
            <Space>
              {canAcessUpdate && (
                <Button
                  onClick={() => {
                    this.handleCloseDetailModal();
                    this.openFormModal(detailId);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.ResourceGroupPage.Editing',
                    })

                    /* 编辑 */
                  }
                </Button>
              )}
              <Button onClick={this.handleCloseDetailModal}>
                {
                  formatMessage({
                    id: 'odc.components.ResourceGroupPage.Closed',
                  })

                  /* 关闭 */
                }
              </Button>
            </Space>
          }
          onClose={this.handleCloseDetailModal}
          getDetail={() => getResourceGroupDetail(detailId)}
          renderContent={(key, data) => (
            <UserDetailContent
              activeKey={key}
              data={data}
              handleCloseAndReload={this.handleCloseAndReload}
            />
          )}
        />
      </>
    );
  }
}

export default ResourceGroup;
