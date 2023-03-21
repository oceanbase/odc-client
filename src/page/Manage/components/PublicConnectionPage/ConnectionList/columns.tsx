import Action from '@/component/Action';
import CommonFilter, { EmptyLabel } from '@/component/CommonFilter';
import {
  ConnectType,
  IConnection,
  IConnectionStatus,
  IConnectionType,
  IManagerPublicConnection,
  IManagerResourceGroup,
} from '@/d.ts';
import { hasSourceAuth, hasSourceWriteAuth } from '@/page/Manage';
import Status from '@/page/Manage/components/CommonStatus';
import type { ConnectionStore } from '@/store/connection';
import WifiIcon from '@/svgr/Wifi.svg';
import { haveOCP as _haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import Icon, {
  ExclamationCircleFilled,
  Loading3QuartersOutlined,
  MinusCircleFilled,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ITableFilter, ITablePagination, ITableSorter } from './type';

import { ConnectTypeText } from '@/constant/label';
import cluster from '@/store/cluster';

import { ColumnType } from 'antd/es/table';
import styles from './index.less';

const haveOCP = _haveOCP();

export interface IProps {
  connections?: IConnection[];
  total?: number;
  connectionType: IConnectionType;
  connectionStore?: ConnectionStore;
  isEn?: boolean;
  isManage?: boolean;
  resourceGroups?: IManagerResourceGroup[];
  enabledTabs?: IConnectionType[];
  defaultPageSize?: number;
  customFiltersOptions?: Record<string, any>;
  showAlertInfo?: boolean;
  filters?: IFilter;
  sorter?: ITableSorter;
  onCreate?: () => void;
  onEnter?: (connection: IConnection) => void;
  onEdit?: (connection: IConnection) => void;
  onCopy?: (connection: IConnection) => void;
  onDelete?: (connection: IConnection) => void;
  onChangeLabelManageVisible?: (visible: boolean, connection?: IConnection) => void;
  onReloadConnection?: () => void;
  onChangeLabel?: (connection: IConnection, labelId?: string | number) => void;
  onChangeTop?: (connection: IConnection) => void;
  onChangeConnectionType?: (value: IConnectionType) => void;
  onReadById?: (id: number) => void;
  onEditById?: (id: number) => void;
  onAuthManage?: (id: number) => void;
  onCopyById?: (id: number) => void;
  onStatusChange?: (
    enabled: boolean,
    connection: IManagerPublicConnection,
    callback?: () => void,
  ) => void;
  loadData?: (args: {
    searchKey?: string;
    filters?: ITableFilter;
    sorter?: ITableSorter;
    pagination?: ITablePagination;
  }) => void;
  closeAlertInfo?: () => void;
  handleChangeFilter?: (key: string, status: any) => void;
}

interface IFilter extends ITableFilter {
  resourceGroups?: string[];
  enabled?: boolean[];
}

export const connectionModeTagMap = {
  [ConnectType.ODP_SHARDING_OB_MYSQL]: {
    text: 'Sharding',
  },

  [ConnectType.OB_MYSQL]: {
    text: 'MySQL',
  },

  [ConnectType.CLOUD_OB_MYSQL]: {
    text: 'MySQL Cloud',
  },

  [ConnectType.OB_ORACLE]: {
    text: 'Oracle',
  },

  [ConnectType.CLOUD_OB_ORACLE]: {
    text: 'Oracle Cloud',
  },
};

const getAuthLabel = (auths: string[]) => {
  return hasSourceWriteAuth(auths)
    ? formatMessage({
        id: 'odc.page.ConnectionList.columns.ReadAndWrite',
      })
    : formatMessage({
        id: 'odc.page.ConnectionList.columns.ReadOnly',
      });
};

const getClusterOrTenantNameById = (
  id: string,
  options: {
    label: string;
    value: string;
  }[],
) => {
  return !haveOCP ? id : options?.find((item) => item.value === id)?.label;
};

const renderStatus = (status: IConnectionStatus | boolean, errorMessage: string) => {
  switch (status) {
    case IConnectionStatus.TESTING: {
      return (
        <Tooltip
          placement="topLeft"
          title={formatMessage({
            id: 'odc.components.ConnectionCardList.StatusSynchronizationInProgress',
          })}
        >
          <Loading3QuartersOutlined
            spin
            style={{
              color: '#1890FF',
            }}
          />
        </Tooltip>
      );
    }
    case IConnectionStatus.ACTIVE: {
      return (
        <Tooltip
          placement="topLeft"
          title={formatMessage({
            id: 'odc.components.ConnectionCardList.ValidConnection',
          })}
        >
          <Icon component={WifiIcon} className={styles.activeStatus} />
        </Tooltip>
      );
    }
    case IConnectionStatus.NOPASSWORD: {
      return (
        <Tooltip
          placement="topLeft"
          title={
            formatMessage({
              id: 'odc.components.ConnectionCardList.TheConnectionPasswordIsNot',
            })

            // 连接密码未保存，无法获取状态
          }
        >
          <MinusCircleFilled />
        </Tooltip>
      );
    }
    case IConnectionStatus.DISABLED: {
      return (
        <Tooltip
          placement="topLeft"
          title={formatMessage({
            id: 'odc.page.ConnectionList.columns.TheConnectionIsDisabled',
          })}

          /* 连接已停用 */
        >
          <MinusCircleFilled />
        </Tooltip>
      );
    }
    case IConnectionStatus.INACTIVE:
    default: {
      return (
        <Tooltip title={errorMessage} placement="topLeft">
          <ExclamationCircleFilled
            style={{
              color: '#F5222D',
            }}
          />
        </Tooltip>
      );
    }
  }
};

const getFooterContent = (record: IConnection, isManage: boolean = false) => {
  const content = [];
  if (record.configUrl) {
    content.push(
      `${formatMessage({ id: 'portal.connection.form.configUrl' })}: ${record.configUrl}`,
    );
  } else if (!haveOCP) {
    content.push(
      `${formatMessage({ id: 'portal.connection.form.host' })}/${formatMessage({
        id: 'portal.connection.form.port',
      })}: ${record.host}:${record.port}`,
    );
  }
  if (haveOCP) {
    const defaultSchema = record.defaultSchema || '-';
    content.push(
      formatMessage(
        {
          id: 'odc.page.ConnectionList.columns.DefaultDatabaseDefaultschema',
        },

        { defaultSchema },
      ),

      // `默认数据库：${defaultSchema}`
    );
  }
  if (ConnectTypeText[record.type]) {
    content.push(ConnectTypeText[record.type]);
  }
  if (record.visibleScope === IConnectionType.ORGANIZATION && !isManage) {
    content.push(
      `${hasSourceAuth(record.permittedActions) ? getAuthLabel(record.permittedActions) : '-'}`,
    );
  }
  return content.join(' | ');
};

const getColumnsPublic = (props: IProps) => {
  const { isManage = false, customFiltersOptions, filters, sorter } = props;
  const columns = [
    {
      title: formatMessage({
        id: 'odc.page.ConnectionList.columns.ConnectionId',
      }),

      // 连接 ID
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      sortOrder: sorter?.columnKey === 'id' && sorter?.order,
      ellipsis: true,
      width: 100,
      fixed: 'left' as any,
      render: (id) => id,
    },

    {
      title: formatMessage({
        id: 'odc.components.ConnectionCardList.ConnectionName',
      }),

      // 连接名
      dataIndex: 'name',
      className: styles.connectionTitle,
      key: 'name',
      sorter: true,
      width: 200,
      sortOrder: sorter?.columnKey === 'name' && sorter?.order,
      ellipsis: true,
      fixed: 'left' as any,
      render: (name, record) => {
        const isTop = record?.setTop;
        const footContent = getFooterContent(record, isManage);
        return (
          <div className={styles.nameCell}>
            <header className={isTop ? `${styles.header} ${styles.top}` : styles.header}>
              <div className={styles.cellTitle}>
                <span className={styles.conectionStatus}>
                  {renderStatus(record.status.status, record.status.errorMessage)}
                </span>
                <Tooltip title={record.name}>
                  <span
                    className={styles.sessionName}
                    onClick={() => {
                      return props?.onEnter(record);
                    }}
                  >
                    {record.name}
                  </span>
                </Tooltip>
              </div>
            </header>
            <div className={styles.footer}>
              <Tooltip title={footContent}>{footContent}</Tooltip>
            </div>
          </div>
        );
      },
    },

    {
      title: formatMessage({ id: 'odc.page.ConnectionList.columns.Cluster' }), // 集群
      key: 'clusterName',
      width: 180,
      ellipsis: true,
      dataIndex: 'clusterName',
      filters: [],
      filteredValue: filters?.clusterName || null,
      filterDropdown: (filterProps) => (
        <CommonFilter
          {...filterProps}
          filters={customFiltersOptions?.clusters}
          selectedKeys={filters?.clusterName}
        />
      ),

      render: (clusterName, record) => {
        const clusterTitle =
          getClusterOrTenantNameById(clusterName, customFiltersOptions?.clusters) || '-';
        // 同上 '公有云环境: clusterName ...' 注释说明
        const clusterId = (!haveOCP ? '' : clusterName) || '-';
        const isTenantInstance =
          haveOCP && !!cluster.clusterList.find((c) => c.instanceId === record.tenantName);
        if (isTenantInstance) {
          return '-';
        }
        return (
          <>
            <header>
              <Tooltip title={clusterTitle}>{clusterTitle}</Tooltip>
            </header>
            {haveOCP && (
              <Tooltip title={clusterId} className={styles.subTitle}>
                {
                  formatMessage({
                    id: 'odc.page.ConnectionList.columns.ClusterId',
                  })

                  /* 集群ID： */
                }

                {clusterId}
              </Tooltip>
            )}
          </>
        );
      },
    },

    {
      title: formatMessage({ id: 'odc.page.ConnectionList.columns.Tenant' }), // 租户
      key: 'tenantName',
      width: 120,
      ellipsis: true,
      dataIndex: 'tenantName',
      filterDropdown: (filterProps) => (
        <CommonFilter
          {...filterProps}
          filters={customFiltersOptions?.tenants}
          selectedKeys={filters?.tenantName}
        />
      ),

      filteredValue: filters?.tenantName || null,
      filters: [],
      render: (tenantName) => {
        // 同上 '公有云环境: clusterName ...' 注释说明
        const tenantTitle =
          getClusterOrTenantNameById(tenantName, customFiltersOptions?.tenants) || '-';
        const tenantId = (!haveOCP ? '' : tenantName) || '-';
        return (
          <>
            <header style={{ display: haveOCP ? 'none' : 'block' }}>
              <Tooltip title={tenantTitle}>{tenantTitle}</Tooltip>
            </header>
            {haveOCP && (
              <Tooltip title={tenantId} className="footer">
                {tenantId}
              </Tooltip>
            )}
          </>
        );
      },
    },

    {
      title: formatMessage({
        id: 'odc.page.ConnectionList.columns.ResourceGroup',
      }),

      // 所属资源组
      width: 140,
      ellipsis: true,
      dataIndex: 'resourceGroups',
      key: 'resourceGroups',
      filters: [{ name: <EmptyLabel />, id: 0 } as any]
        .concat(props.resourceGroups ?? [])
        .map((item) => {
          return {
            text: item.name,
            value: item.id,
          };
        }),
      filteredValue: filters?.resourceGroups || null,
      render: (resourceGroups) => {
        const resourceGroupTitle = resourceGroups?.map((item) => item.name)?.join(' | ') || '-';
        return <Tooltip title={resourceGroupTitle}>{resourceGroupTitle}</Tooltip>;
      },
    },

    {
      title: formatMessage({ id: 'odc.page.ConnectionList.columns.State' }), // 状态
      width: 90,
      key: 'enabled',
      dataIndex: 'enabled',
      filters: [
        {
          text: formatMessage({ id: 'odc.page.ConnectionList.columns.Enable' }), // 启用
          value: true,
        },

        {
          text: formatMessage({
            id: 'odc.page.ConnectionList.columns.Disable',
          }),

          // 停用
          value: false,
        },
      ],

      filteredValue: filters?.enabled || null,
      render: (enabled) => <Status enabled={enabled} />,
    },

    {
      title: formatMessage({
        id: 'odc.components.ConnectionCardList.OperationTime',
      }),

      // 操作时间
      key: 'updateTime',
      width: 200,
      dataIndex: 'updateTime',
      sorter: true,
      sortOrder: sorter?.columnKey === 'updateTime' && sorter?.order,
      render: (updateTime) => <span>{getLocalFormatDateTime(updateTime)}</span>,
    },

    {
      title: formatMessage({
        id: 'odc.components.ConnectionCardList.Operation',
      }),

      // 操作
      key: 'indexAction',
      width: 75,
      fixed: 'right' as any,
      render: (connection) => (
        <Action.Link
          disabled={!connection.enabled}
          onClick={async () => {
            props?.onEnter(connection);
          }}
        >
          {
            formatMessage({
              id: 'odc.components.ConnectionCardList.Open',
            })

            /* 打开 */
          }
        </Action.Link>
      ),
    },

    {
      title: formatMessage({ id: 'odc.page.ConnectionList.columns.Operation' }), // 操作
      width: 154,
      key: 'manageAction',
      fixed: 'right' as any,
      render: (value, record) => (
        <Action.Group>
          <Action.Link
            onClick={async () => {
              props?.onReadById(record.id);
            }}
          >
            {
              formatMessage({
                id: 'odc.page.ConnectionList.columns.See',
              })

              /* 查看 */
            }
          </Action.Link>
          {record?.permittedActions?.includes('update') ? (
            <Action.Group size={1}>
              <Action.Link
                onClick={async () => {
                  props?.onAuthManage(record.id);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.PublicConnectionPage.ConnectionList.columns.ManagePermissions',
                  }) /*管理权限*/
                }
              </Action.Link>
              <Action.Link
                onClick={async () => {
                  props?.onEditById(record.id);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.page.ConnectionList.columns.Editing',
                  })

                  /* 编辑 */
                }
              </Action.Link>
              {
                <Action.Link
                  onClick={async () => {
                    props?.onCopyById(record.id);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.ConnectionCardList.Copy',
                    })

                    /* 复制 */
                  }
                </Action.Link>
              }

              {record.enabled ? (
                <Action.Link
                  onClick={async () => {
                    props?.onStatusChange(false, record);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.page.ConnectionList.columns.Disable',
                    })

                    /* 停用 */
                  }
                </Action.Link>
              ) : (
                <Action.Link
                  onClick={async () => {
                    props?.onStatusChange(true, record);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.page.ConnectionList.columns.Enable',
                    })

                    /* 启用 */
                  }
                </Action.Link>
              )}
            </Action.Group>
          ) : (
            <Action.Link disabled />
          )}
        </Action.Group>
      ),
    },
  ].filter((item) => {
    return isManage
      ? !['auths', 'indexAction'].includes(item.key)
      : !['id', 'resourceGroups', 'enabled', 'manageAction'].includes(item.key);
  });
  return columns;
};

export const getColumns = (props: IProps): ColumnType<unknown>[] => {
  return getColumnsPublic(props) as any;
};
