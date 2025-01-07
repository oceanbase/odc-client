import { formatMessage } from '@/util/intl';
import { render } from '@/app';
import {
  checkLogicalTable,
  deleteLogicalTable,
  extractLogicalTables,
  getLogicalTable,
  logicalDatabaseDetail,
} from '@/common/network/logicalDatabase';
import Action from '@/component/Action';
import Reload from '@/component/Button/Reload';
import HelpDoc from '@/component/helpDoc';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { IResponseData } from '@/d.ts';
import { DatabasePermissionType, IDatabase } from '@/d.ts/database';
import { ILogicalDatabase, ILogicalTable, InconsistentPhysicalTable } from '@/d.ts/logicalDatabase';
import { ReactComponent as NewOpenSvg } from '@/svgr/newopen.svg';
import { isLogicalDatabase } from '@/util/database';
import { gotoSQLWorkspace } from '@/util/route';
import Icon, { ExclamationCircleFilled } from '@ant-design/icons';
import {
  Button,
  ConfigProvider,
  Descriptions,
  Drawer,
  Empty,
  message,
  Modal,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { getLocalFormatDateTime } from '@/util/utils';
import type { FixedType } from 'rc-table/es/interface';
import datasourceStatus from '@/store/datasourceStatus';

const getColumns = ({ logicalDatabaseId, reload, hasOperateAuth }) => {
  return [
    {
      key: 'name',
      title: formatMessage({
        id: 'src.page.Project.Database.components.LogicDatabase.9C2434F4',
        defaultMessage: '逻辑表',
      }),
      dataIndex: 'name',
      render: (value: string, record) => {
        const inconsistentTableList = record?.inconsistentPhysicalTables?.reduce(
          (str, { tableName }) => {
            return str ? str + ',' + tableName : str + tableName;
          },
          '',
        );
        return (
          <Space>
            {value}
            <Tooltip
              title={
                record?.inconsistentPhysicalTables?.length &&
                formatMessage(
                  {
                    id: 'src.page.Project.Database.components.LogicDatabase.4541D5D8',
                    defaultMessage: '表{inconsistentTableList}表结构不一致，请检查',
                  },
                  { inconsistentTableList },
                )
              }
            >
              {record?.inconsistentPhysicalTables?.length > 0 && (
                <ExclamationCircleFilled style={{ color: 'var(--function-gold6-color)' }} />
              )}
            </Tooltip>
          </Space>
        );
      },
    },
    {
      key: 'expression',
      title: () => (
        <HelpDoc
          isTip
          leftText
          title={formatMessage({
            id: 'src.page.Project.Database.components.LogicDatabase.5C864DDF',
            defaultMessage: '根据物理表在实际数据库上分布，计算获得的拓扑',
          })}
        >
          {formatMessage({
            id: 'src.page.Project.Database.components.LogicDatabase.6483A6AD',
            defaultMessage: '表达式',
          })}
        </HelpDoc>
      ),
      width: 400,
      ellipsis: {
        showTitle: false,
      },
      dataIndex: 'expression',
      render(value) {
        return (
          <Tooltip title={value} placement="topLeft">
            {value}
          </Tooltip>
        );
      },
    },
    {
      key: 'physicalTableCount',
      title: formatMessage({
        id: 'src.page.Project.Database.components.LogicDatabase.050806D0',
        defaultMessage: '物理表数量',
      }),
      dataIndex: 'physicalTableCount',
      render: (value) => {
        return <div style={{ width: 60 }}>{value}</div>;
      },
    },
    {
      key: 'action',
      title: formatMessage({
        id: 'src.page.Project.Database.components.LogicDatabase.CEDEA776',
        defaultMessage: '操作',
      }),
      render(record: ILogicalTable) {
        return (
          <Action.Group size={2}>
            <Action.Link
              key={'check'}
              onClick={async () => {
                const res = await checkLogicalTable(logicalDatabaseId, record.id);
                if (res) {
                  message.success(
                    formatMessage({
                      id: 'src.page.Project.Database.components.LogicDatabase.E3A5218D',
                      defaultMessage: '检查中',
                    }),
                  );
                }
              }}
              disabled={!hasOperateAuth}
              tooltip={
                hasOperateAuth
                  ? null
                  : formatMessage({
                      id: 'src.page.Project.Database.8FB9732D',
                      defaultMessage: '暂无权限',
                    })
              }
            >
              {formatMessage({
                id: 'src.page.Project.Database.components.LogicDatabase.5DF738A9',
                defaultMessage: '检查',
              })}
            </Action.Link>
            <Action.Link
              key={'delete'}
              onClick={async () => {
                Modal.confirm({
                  title: formatMessage(
                    {
                      id: 'src.page.Project.Database.components.LogicDatabase.1620D67B',
                      defaultMessage: '确认要移除逻辑表{recordName}?',
                    },
                    { recordName: record?.name },
                  ),
                  onOk: async () => {
                    const successful = await deleteLogicalTable(logicalDatabaseId, record.id);
                    if (successful) {
                      message.success(
                        formatMessage({
                          id: 'src.page.Project.Database.components.LogicDatabase.238549D2',
                          defaultMessage: '移除成功',
                        }),
                      );
                      reload?.();
                      return;
                    }
                  },
                });
              }}
              disabled={record.physicalTableCount === 0 || !hasOperateAuth}
              tooltip={
                record.physicalTableCount === 0
                  ? formatMessage({
                      id: 'src.page.Project.Database.components.LogicDatabase.B3657267',
                      defaultMessage: '存在物理表，暂不可移除',
                    })
                  : !hasOperateAuth
                  ? formatMessage({
                      id: 'src.page.Project.Database.8FB9732D',
                      defaultMessage: '暂无权限',
                    })
                  : null
              }
            >
              {formatMessage({
                id: 'src.page.Project.Database.components.LogicDatabase.CF774305',
                defaultMessage: '移除',
              })}
            </Action.Link>
          </Action.Group>
        );
      },
    },
  ];
};
const subColumn = [
  {
    key: 'expression',
    title: formatMessage({
      id: 'src.page.Project.Database.components.LogicDatabase.B79AD693',
      defaultMessage: '表达式',
    }),
    dataIndex: 'expression',
  },
  {
    key: 'tableCount',
    title: formatMessage({
      id: 'src.page.Project.Database.components.LogicDatabase.9BABFCEF',
      defaultMessage: '物理表数量',
    }),
    dataIndex: 'tableCount',
  },
  {
    key: 'name',
    title: formatMessage({
      id: 'src.page.Project.Database.components.LogicDatabase.ECD64A3E',
      defaultMessage: '数据库',
    }),
    dataIndex: ['physicalDatabase', 'name'],
    render(value, record) {
      return record?.physicalDatabase ? (
        <Space>
          <DataBaseStatusIcon item={record?.physicalDatabase} />
          {value}
          <Typography.Text type="secondary">
            {record?.physicalDatabase?.dataSource?.name || '-'}
          </Typography.Text>
        </Space>
      ) : (
        value
      );
    },
  },
];

const physicalDbColumns = [
  {
    key: 'name',
    title: formatMessage({
      id: 'src.page.Project.Database.components.LogicDatabase.35970C60',
      defaultMessage: '数据库名称',
    }),
    dataIndex: 'name',
    width: 130,
    fixed: 'left' as FixedType,
    render(value, record) {
      return (
        <>
          <Space size={2}>
            <DataBaseStatusIcon item={record} />
            <Tooltip title={value}>
              <Typography.Text ellipsis style={{ maxWidth: 100 }}>
                {value}
              </Typography.Text>
            </Tooltip>
          </Space>
        </>
      );
    },
  },
  {
    title: formatMessage({
      id: 'src.page.Project.Database.components.LogicDatabase.74E8F833',
      defaultMessage: '所属数据源',
    }),
    dataIndex: ['dataSource', 'name'],
    width: 160,
    ellipsis: {
      showTitle: false,
    },
    render(value, record, index) {
      const style = getDataSourceStyleByConnectType(record?.dialectType);
      if (!value) {
        return '-';
      }
      return (
        <>
          <Icon
            component={style?.icon?.component}
            style={{
              color: style?.icon?.color,
              fontSize: 16,
              marginRight: 4,
            }}
          />

          <Tooltip title={value}>{value}</Tooltip>
        </>
      );
    },
  },
  {
    title: formatMessage({
      id: 'src.page.Project.Database.components.LogicDatabase.B2364234',
      defaultMessage: '环境',
    }),
    dataIndex: 'environmentId',
    width: 80,
    render(value, record, index) {
      return (
        <RiskLevelLabel color={record?.environment?.style} content={record?.environment?.name} />
      );
    },
  },
  {
    title: formatMessage({
      id: 'src.page.Project.Database.components.LogicDatabase.8BC044C4',
      defaultMessage: '上一次同步时间',
    }),
    dataIndex: 'objectLastSyncTime',
    width: 170,
    render(v, record) {
      const time = record?.objectLastSyncTime || record?.lastSyncTime;
      return getLocalFormatDateTime(time);
    },
  },
];

const expandedRowRender = (record: ILogicalTable, logicalDatabaseId: number, callback: any) => {
  return (
    <div key={record?.id}>
      <ConfigProvider renderEmpty={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}>
        <MiniTable
          isExpandedRowRender
          columns={subColumn}
          dataSource={record?.topologies ?? []}
          loadData={async () => {
            const res = await getLogicalTable(logicalDatabaseId, record.id);
            callback?.(res);
          }}
        />
      </ConfigProvider>
    </div>
  );
};
const ManageLogicDatabase: React.FC<{
  database?: IDatabase;
  openManageLogicDatabase: boolean;
  setOpenManageLogicDatabase: (oepn: boolean) => void;
  isOwner?: boolean;
}> = ({
  database,
  openManageLogicDatabase = false,
  setOpenManageLogicDatabase,
  isOwner = false,
}) => {
  const hasOperateAuth =
    isOwner || database?.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
  const [currentDatabase, setCurrentDatabase] = useState<ILogicalDatabase>();
  const logicalTableMap = useRef<Map<number, IResponseData<InconsistentPhysicalTable>>>(new Map());
  const [_logicalTableMap, setLogicalTableMap] = useState<
    Map<number, IResponseData<InconsistentPhysicalTable>>
  >(new Map());
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const handleExtractLogicalTables = async () => {
    const successful = await extractLogicalTables(database?.id);
    if (successful) {
      message.info(
        formatMessage({
          id: 'src.page.Project.Database.components.LogicDatabase.031534C2',
          defaultMessage: '逻辑表正在提取中，请耐心等待。',
        }),
      );
    }
  };
  const queryLogicalDatabaseById = async () => {
    const responseData = await logicalDatabaseDetail(database?.id);
    if (responseData?.successful) {
      setCurrentDatabase(responseData?.data);
      datasourceStatus.asyncUpdateStatus(
        responseData?.data?.physicalDatabases?.map((a) => a?.dataSource?.id),
      );
    }
  };
  const columns = getColumns({
    logicalDatabaseId: currentDatabase?.id,
    reload: queryLogicalDatabaseById,
    hasOperateAuth: hasOperateAuth,
  });

  const openPhysicalDbdrawer = () => {
    setDrawerOpen(true);
  };

  useEffect(() => {
    if (database && openManageLogicDatabase) {
      queryLogicalDatabaseById();
    }
    return () => {
      setCurrentDatabase(null);
      logicalTableMap.current = null;
    };
  }, [openManageLogicDatabase]);
  return (
    <>
      <Drawer
        open={openManageLogicDatabase}
        destroyOnClose
        title={formatMessage({
          id: 'src.page.Project.Database.components.LogicDatabase.6425DB17',
          defaultMessage: '逻辑表管理',
        })}
        width={800}
        closable
        onClose={() => setOpenManageLogicDatabase(false)}
      >
        <Descriptions column={1}>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.page.Project.Database.components.LogicDatabase.C900315F',
              defaultMessage: '当前库',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DataBaseStatusIcon item={database} />
              <Typography.Text>{database?.name}</Typography.Text>
            </div>
          </Descriptions.Item>
        </Descriptions>
        <TableCard
          title={
            <Space size={8}>
              <Tooltip
                title={
                  hasOperateAuth
                    ? formatMessage({
                        id: 'src.page.Project.Database.components.LogicDatabase.BC210D00',
                        defaultMessage: '将表名相似、结构一致的表提取为逻辑表',
                      })
                    : formatMessage({
                        id: 'src.page.Project.Database.8FB9732D',
                        defaultMessage: '暂无权限',
                      })
                }
              >
                <Button
                  type="primary"
                  onClick={handleExtractLogicalTables}
                  disabled={!hasOperateAuth}
                >
                  {formatMessage({
                    id: 'src.page.Project.Database.components.LogicDatabase.5FE18380',
                    defaultMessage: '提取逻辑表',
                  })}
                </Button>
              </Tooltip>
              <Tooltip
                title={
                  hasOperateAuth
                    ? null
                    : formatMessage({
                        id: 'src.page.Project.Database.8FB9732D',
                        defaultMessage: '暂无权限',
                      })
                }
              >
                <Button
                  disabled={!hasOperateAuth}
                  onClick={() =>
                    gotoSQLWorkspace(
                      database?.project?.id,
                      null,
                      database?.id,
                      null,
                      '',
                      isLogicalDatabase(database),
                      true,
                    )
                  }
                >
                  {formatMessage({
                    id: 'src.page.Project.Database.components.LogicDatabase.7F48554F',
                    defaultMessage: '新建逻辑表',
                  })}

                  <Icon component={NewOpenSvg} />
                </Button>
              </Tooltip>
              <Button onClick={openPhysicalDbdrawer}>
                {formatMessage({
                  id: 'src.component.Task.component.CommonDetailModal.178F11D7',
                  defaultMessage: '查看',
                })}
                {formatMessage({ id: 'src.constant.5363D697', defaultMessage: '物理库' })}
              </Button>
            </Space>
          }
          extra={<Reload onClick={queryLogicalDatabaseById} />}
        >
          <ConfigProvider
            renderEmpty={() => (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div>
                      {formatMessage({
                        id: 'src.page.Project.Database.components.LogicDatabase.6D19E2E5',
                        defaultMessage: '暂无数据',
                      })}
                    </div>
                    {hasOperateAuth && (
                      <div>
                        {formatMessage({
                          id: 'src.page.Project.Database.components.LogicDatabase.CF799F8B',
                          defaultMessage:
                            '系统可能正在将表名相似、结构一致的表提取逻辑表，请耐心等待；也可选择手动提取',
                        })}
                      </div>
                    )}
                  </div>
                }
              />
            )}
          >
            <MiniTable<ILogicalTable>
              rowKey={'id'}
              scroll={{
                x: 752,
              }}
              expandable={{
                expandedRowRender: (record) =>
                  expandedRowRender(record, currentDatabase?.id, (values) => {
                    const newLogicalTables = currentDatabase?.logicalTables?.reduce((pre, cur) => {
                      if (record?.id === cur?.id) {
                        cur.topologies = values;
                      }
                      pre.push(cur);
                      return pre;
                    }, []);
                    currentDatabase.logicalTables = newLogicalTables;
                    setCurrentDatabase({ ...currentDatabase });
                  }),
                rowExpandable: (record) => record.physicalTableCount > 0,
              }}
              columns={columns}
              dataSource={currentDatabase?.logicalTables ?? []}
              pagination={null}
              loadData={(page, filters) => {
                const pageSize = page.pageSize;
                const current = page.current;
                // loadData(pageSize, current, filters['environmentId']?.[0]);
              }}
            />
          </ConfigProvider>
        </TableCard>
      </Drawer>
      <Drawer
        title={formatMessage(
          {
            id: 'src.page.Project.Database.components.LogicDatabase.71602A20',
            defaultMessage: '逻辑库{databaseName}的物理分库',
          },
          { databaseName: database?.name },
        )}
        width={600}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closable
        destroyOnClose
      >
        <MiniTable
          rowKey={'id'}
          columns={physicalDbColumns}
          dataSource={currentDatabase?.physicalDatabases}
          pagination={null}
          loadData={() => {}}
        />
      </Drawer>
    </>
  );
};
export default ManageLogicDatabase;
