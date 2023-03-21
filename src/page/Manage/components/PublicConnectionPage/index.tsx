import {
  batchImportPublicConnection,
  getPublicConnectionDetail,
  getPublicConnectionList,
  setPublicConnectionEnable,
} from '@/common/network/manager';
import { actionTypes, canAcess } from '@/component/Acess';
import BatchImportButton from '@/component/BatchImportButton';
import { EmptyLabel } from '@/component/CommonFilter';
import CommonTable from '@/component/CommonTable';
import type {
  ITableFilter,
  ITableInstance,
  ITableLoadOptions,
  ITableSorter,
} from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import ConnectionPopover from '@/component/ConnectionPopover';
import appConfig from '@/constant/appConfig';
import { ConnectTypeText } from '@/constant/label';
import {
  ConnectionFilterStatus,
  ConnectionMode,
  ConnectType,
  IConnectionStatus,
  IConnectionType,
  IManagerDetailTabs,
  IManagerPublicConnection,
  IManagerResourceType,
  IResponseData,
} from '@/d.ts';
import styles from '@/page/Index/index.less';
import type { ClusterStore, ICluster, ITenant } from '@/store/cluster';
import type { SettingStore } from '@/store/setting';
import ConIcon from '@/svgr/icon_connection.svg';
import { encryptConnection } from '@/util/connection';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Empty, message, Modal, Popover, Space, Tooltip, Typography } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import * as _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { ManageContext } from '../../context';
import CommonDetailModal from '../CommonDetailModal';
import FormAuthManageModal from '../FormAuthManageModal';
import FormConnectionModal from '../FormConnectionModal';
import { UserDetailContent } from './component';
import { getColumns } from './ConnectionList/columns';
import styles2 from './ConnectionList/index.less';

interface IProps {
  settingStore?: SettingStore;
  clusterStore?: ClusterStore;
}

interface IState {
  detailId: number;
  editId: number;
  publicConnections: IResponseData<IManagerPublicConnection>;
  formModalVisible: boolean;
  detailModalVisible: boolean;
  authManageModalVisible: boolean;
  defaultPageSize: number;
  filters: ITableFilter;
  sorter: ITableSorter;
  isCopy: boolean;
}

const tableOptions = [
  ConnectType.NONE,
  ConnectType.OB_MYSQL,
  ConnectType.CLOUD_OB_MYSQL,
  ConnectType.OB_ORACLE,
  ConnectType.CLOUD_OB_ORACLE,
  ConnectType.ODP_SHARDING_OB_MYSQL,
].map((item) => ({
  label: ConnectTypeText[item],
  value: item,
}));

const getResultByFiles = (files: UploadFile[]) => {
  const res = [];
  files
    ?.filter((file) => file?.status === 'done')
    ?.forEach((file) => {
      file?.response?.data?.batchImportConnectionList?.map((item) => {
        res.push(item);
      });
    });
  return res;
};

@inject('clusterStore', 'settingStore')
@observer
class PublicConnectionPage extends React.PureComponent<IProps, IState> {
  static contextType = ManageContext;

  private tableRef = React.createRef<ITableInstance>();

  private batchImportRef = React.createRef<{
    closeModal: () => void;
  }>();

  private reloadTimer = null;

  readonly state = {
    detailId: null,
    editId: null,
    publicConnections: null,
    formModalVisible: false,
    detailModalVisible: false,
    authManageModalVisible: false,
    defaultPageSize: 10,
    filters: null,
    sorter: null,
    isCopy: false,
  };

  componentDidMount() {
    this.context.getResourceGroupList();
    this.props.clusterStore.loadClusterList(IConnectionType.ORGANIZATION);
  }

  private openFormModal = (editId?: number, isCopy = false) => {
    this.setState({
      formModalVisible: true,
      editId,
      isCopy,
    });
  };

  private openDetailModal = (detailId: number) => {
    this.setState({
      detailModalVisible: true,
      detailId,
    });
  };

  private openAuthManageModal = (detailId: number) => {
    this.setState({
      authManageModalVisible: true,
      detailId,
    });
  };

  private handleStatusChange = (
    enabled: boolean,
    connection: IManagerPublicConnection,
    callback = () => {},
  ) => {
    if (!enabled) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.PublicConnectionPage.AreYouSureYouWant.1',
        }),
        // 是否确定停用公共连接
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.components.PublicConnectionPage.AfterTheConnectionIsDisabled',
                })
                /* 被停用后用户将无法访问该连接 */
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.components.PublicConnectionPage.TheDisabledConnectionIsRetained',
                })
                /* 被停用的连接仍保留，支持启用 */
              }
            </div>
          </>
        ),

        cancelText: formatMessage({
          id: 'odc.components.PublicConnectionPage.Cancel',
        }),

        // 取消
        okText: formatMessage({
          id: 'odc.components.PublicConnectionPage.Determine',
        }),

        // 确定
        centered: true,
        onOk: () => {
          if (connection) {
            this.handlePublicConnectionEnable({
              connection,
              enabled,
            });
          }
        },
        onCancel: callback,
      });
    } else {
      this.handlePublicConnectionEnable({
        connection,
        enabled,
      });
    }
  };

  private handlePublicConnectionEnable = async (data: {
    connection: IManagerPublicConnection;
    enabled: boolean;
  }) => {
    const { connection, enabled } = data;
    const res = await setPublicConnectionEnable({
      id: connection.id,
      enabled,
    });

    if (res) {
      message.success(
        enabled
          ? formatMessage({ id: 'odc.components.PublicConnectionPage.Enabled' }) // 启用成功
          : formatMessage({
              id: 'odc.components.PublicConnectionPage.Disabled',
            }),
        // 停用成功
      );
      this.updatePublicConnection({
        ...connection,
        enabled,
        status: res.status,
      });
    } else {
      message.error(
        enabled
          ? formatMessage({
              id: 'odc.components.PublicConnectionPage.FailedToEnable',
            })
          : // 启用失败
            formatMessage({
              id: 'odc.components.PublicConnectionPage.Disabled.1',
            }),
        // 停用失败
      );
    }
  };

  private handleCloseDetailModal = () => {
    this.setState({
      detailModalVisible: false,
    });
  };

  private handleCloseAuthManageModal = () => {
    this.setState({
      authManageModalVisible: false,
    });
  };

  private loadData = async (args: ITableLoadOptions) => {
    const { searchValue = '', filters: filter, sorter, pagination, pageSize } = args ?? {};
    const { filters } = this.state;
    const filterParams = {
      ...filters,
      ...filter,
    };

    const {
      dialectType,
      type,
      status,
      enabled,
      clusterName,
      tenantName,
      resourceGroups: resourceGroupId,
    } = filterParams;
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const data = {
      enabled,
      clusterName,
      tenantName,
      resourceGroupId,
      dialectType: dialectType === ConnectionMode.ALL ? undefined : dialectType,
      type: type === ConnectType.NONE ? undefined : type,
      status: status === ConnectionFilterStatus.ALL ? undefined : status,
      fuzzySearchKeyword: searchValue,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    // clusterName filter
    data.clusterName = data.clusterName ? data.clusterName : undefined;
    // tenantName filter
    data.tenantName = data.tenantName ? data.tenantName : undefined;
    // enabled filter
    data.enabled = enabled?.length ? enabled : undefined;
    // fuzzySearchKeyword filter
    data.fuzzySearchKeyword = data.fuzzySearchKeyword ? data.fuzzySearchKeyword : undefined;
    // resourceGroups filter
    data.resourceGroupId = resourceGroupId?.length ? resourceGroupId : undefined;
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const publicConnections = await getPublicConnectionList(data);
    this.setState({
      publicConnections,
      filters: filterParams,
      sorter,
    });

    this.reloadConnectionsStatus(publicConnections?.contents);
  };

  private updatePublicConnection = async (data: IManagerPublicConnection) => {
    const { publicConnections } = this.state;
    const connectionsList = publicConnections?.contents?.map((item) => {
      return item.id === data.id ? data : item;
    });
    this.setState({
      publicConnections: {
        contents: [...connectionsList],
        page: publicConnections.page,
      },
    });

    this.reloadConnectionsStatus(connectionsList);
  };

  private reloadConnectionsStatus(connections: IManagerPublicConnection[]) {
    const hasTestingStatus = connections?.some(
      (item) => item.status.status === IConnectionStatus.TESTING,
    );

    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }
    if (hasTestingStatus) {
      this.reloadTimer = setTimeout(() => {
        this.reloadData();
      }, 3000);
    }
  }

  private handleCloseAndReload = () => {
    this.handleCloseDetailModal();
    this.reloadData();
    this.context.getPublicConnectionList();
  };

  private getData = (connections: IManagerPublicConnection[]) => {
    return connections?.map((connection) => {
      return {
        ...connection,
        key: connection.id,
        mode: connection.dialectType,
        action: connection.name,
      };
    });
  };

  private reloadData = () => {
    this.tableRef.current.reload();
  };

  private getClusterAndTenant = () => {
    const {
      clusterStore: { clusterList, tenantListMap },
    } = this.props;

    return {
      clusters: [{ instanceName: <EmptyLabel />, instanceId: '{empty}' } as ICluster]
        .concat(clusterList ?? [])
        ?.map(({ instanceId, instanceName }) => {
          return {
            label: instanceName,
            value: instanceId,
          };
        }),
      tenants: [{ tenantName: <EmptyLabel />, tenantId: '{empty}' } as ITenant]
        .concat(_.flatten(Object.values(tenantListMap ?? {})).filter(Boolean))
        ?.map(({ tenantId, tenantName }) => {
          return {
            label: tenantName,
            value: tenantId,
          };
        }),
    };
  };

  private handleCreate = () => {
    this.openFormModal();
  };

  private handleBatchImportSubmit = async (files: UploadFile[]) => {
    const connections: IManagerPublicConnection[] = getResultByFiles(files);
    const data = connections?.map((item) => encryptConnection<IManagerPublicConnection>(item));
    const res = await batchImportPublicConnection(data);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.PublicConnectionPage.BatchImportSucceeded',
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

  render() {
    const {
      settingStore: { serverSystemInfo },
    } = this.props;
    const {
      formModalVisible,
      detailModalVisible,
      authManageModalVisible,
      detailId,
      editId,
      publicConnections,
      filters,
      isCopy,
      sorter,
    } = this.state;
    const { resourceGroups } = this.context;
    const { clusters, tenants } = this.getClusterAndTenant();
    const columns = getColumns({
      connectionType: IConnectionType.ORGANIZATION,
      isEn: false,
      isManage: true,
      resourceGroups: resourceGroups?.contents,
      customFiltersOptions: {
        clusters,
        tenants,
      },

      filters,
      sorter,
      onReadById: this.openDetailModal,
      onEditById: this.openFormModal,
      onCopyById: (id: number) => {
        this.openFormModal(id, true);
      },
      onStatusChange: this.handleStatusChange,
      onAuthManage: this.openAuthManageModal,
    });

    const dataSource = this.getData(publicConnections?.contents);
    const canAcessCreate = canAcess({
      resourceIdentifier: IManagerResourceType.public_connection,
      action: actionTypes.create,
    }).accessible;
    const canAcessUpdate = canAcess({
      resourceIdentifier: IManagerResourceType.public_connection,
      action: actionTypes.update,
    }).accessible;

    return (
      <>
        <CommonTable
          ref={this.tableRef}
          titleContent={{
            title: formatMessage({
              id: 'odc.components.PublicConnectionPage.PublicConnectionManagement',
            }),

            /* 公共连接管理 */
          }}
          filterContent={{
            searchPlaceholder: formatMessage({
              id: 'odc.components.PublicConnectionPage.EnterAConnectionName',
            }),

            /* 请输入连接名称 */
            filters: [
              {
                name: 'type',
                defaultValue: ConnectType.NONE,
                dropdownWidth: 150,
                options: tableOptions,
              },
            ],
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
                          action="/api/v2/connect/connections/previewBatchImport"
                          description={formatMessage({
                            id: 'odc.components.PublicConnectionPage.TheFileMustContainConnection',
                          })} /*文件需包含连接类型、主机端口、租户名、读写账号、只读账号等相关连接信息，建议使用连接配置模版*/
                          templateName="connection_template.xlsx"
                          data={{
                            visibleScope: IConnectionType.ORGANIZATION,
                          }}
                          previewContent={(data: IManagerPublicConnection[]) => {
                            if (!data?.length) {
                              return (
                                <Empty
                                  description={formatMessage({
                                    id: 'odc.components.PublicConnectionPage.NoValidConnectionInformationIs',
                                  })} /*暂无有效连接信息*/
                                />
                              );
                            }
                            return (
                              <>
                                {data.map((item, index) => {
                                  const hasError = !!item.errorMessage;
                                  return (
                                    <div key={index} className={styles['pre-item']}>
                                      <ConIcon style={{ marginRight: '4px' }} />
                                      {hasError ? (
                                        <Tooltip title={item.errorMessage}>
                                          <Space size={4}>
                                            <Typography.Text>{item.name}</Typography.Text>
                                            <ExclamationCircleFilled
                                              style={{
                                                color: 'var(--icon-orange-color)',
                                              }}
                                            />
                                          </Space>
                                        </Tooltip>
                                      ) : (
                                        <Popover
                                          overlayClassName={styles.connectionPopover}
                                          placement="right"
                                          content={
                                            <ConnectionPopover
                                              connection={item}
                                              showResourceGroups={true}
                                              showType={false}
                                            />
                                          }
                                        >
                                          <Typography.Text>{item.name}</Typography.Text>
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
                            id: 'odc.components.PublicConnectionPage.CreateAPublicConnection',
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
          // @ts-ignore
          enableResize
          rowHeight={65}
          tableProps={{
            rowClassName: styles2.tableRow,
            columns,
            dataSource,
            rowKey: 'id',
            pagination: {
              current: publicConnections?.page?.number,
              total: publicConnections?.page?.totalElements,
            },

            scroll: {
              x: 1200,
            },
          }}
        />

        <FormConnectionModal
          visible={formModalVisible}
          editId={editId}
          isCopy={isCopy}
          onClose={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
            });

            this.reloadData();
            this.context.getPublicConnectionList();
          }}
          handleStatusChange={this.handleStatusChange}
        />

        <FormAuthManageModal
          visible={authManageModalVisible}
          id={detailId}
          onClose={this.handleCloseAuthManageModal}
        />

        <CommonDetailModal
          visible={detailModalVisible}
          title={formatMessage({
            id: 'odc.components.PublicConnectionPage.PublicConnectionInformation',
          })}
          /* 公共连接信息 */
          detailId={detailId}
          tabs={[
            {
              key: IManagerDetailTabs.DETAIL,
              title: formatMessage({
                id: 'odc.components.PublicConnectionPage.ConnectionDetails',
              }),

              // 连接详情
            },
            {
              key: IManagerDetailTabs.RESOURCE,
              title: formatMessage({
                id: 'odc.components.PublicConnectionPage.RelatedUsers',
              }),

              // 相关用户
              hidden: appConfig.manage.user.tabInVisible(this.props.settingStore),
            },
            /**
         * {
              key: IManagerDetailTabs.ROLE,
              title: '相关角色',
              hidden: appConfig.manage.user.tabInVisible(this.props.settingStore),
            },
         */
            {
              key: IManagerDetailTabs.TASK_FLOW,
              title: formatMessage({
                id: 'odc.components.PublicConnectionPage.RelatedProcesses',
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
                      id: 'odc.components.PublicConnectionPage.Editing',
                    })

                    /* 编辑 */
                  }
                </Button>
              )}

              <Button onClick={this.handleCloseDetailModal}>
                {
                  formatMessage({
                    id: 'odc.components.PublicConnectionPage.Closed',
                  })

                  /* 关闭 */
                }
              </Button>
            </Space>
          }
          onClose={this.handleCloseDetailModal}
          getDetail={() => getPublicConnectionDetail(detailId)}
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

export default PublicConnectionPage;
