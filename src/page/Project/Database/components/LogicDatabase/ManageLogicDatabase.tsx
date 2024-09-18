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
import { IDatabase } from '@/d.ts/database';
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
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const getColumns = ({ logicalDatabaseId, reload }) => {
  return [
    {
      key: 'name',
      title: '逻辑表',
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
                `表${inconsistentTableList}表结构不一致，请检查`
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
        <HelpDoc isTip leftText title={'根据物理表在实际数据库上分布，计算获得的拓扑'}>
          表达式
        </HelpDoc>
      ),
      dataIndex: 'expression',
    },
    {
      key: 'physicalTableCount',
      title: '物理表数量',
      dataIndex: 'physicalTableCount',
      render: (value) => {
        return <div style={{ width: 60 }}>{value}</div>;
      },
    },
    {
      key: 'action',
      title: '操作',
      render(record: ILogicalTable) {
        return (
          <Action.Group size={2}>
            <Action.Link
              key={'check'}
              onClick={async () => {
                const res = await checkLogicalTable(logicalDatabaseId, record.id);
                if (res) {
                  message.success('检查中');
                }
              }}
            >
              检查
            </Action.Link>
            <Action.Link
              key={'delete'}
              onClick={async () => {
                Modal.confirm({
                  title: `确认要移除逻辑表${record?.name}?`,
                  onOk: async () => {
                    const successful = await deleteLogicalTable(logicalDatabaseId, record.id);
                    if (successful) {
                      message.success('移除成功');
                      reload?.();
                      return;
                    }
                  },
                });
              }}
              disabled={record.physicalTableCount === 0}
              tooltip={record.physicalTableCount === 0 ? '存在物理表，暂不可移除' : ''}
            >
              移除
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
    title: '表达式',
    dataIndex: 'expression',
  },
  {
    key: 'tableCount',
    title: '物理表数量',
    dataIndex: 'tableCount',
  },
  {
    key: 'name',
    title: '数据库',
    dataIndex: ['physicalDatabase', 'name'],
    render(value, record) {
      return record?.physicalDatabase ? (
        <Space>
          <DataBaseStatusIcon item={record?.physicalDatabase} />
          {value}
        </Space>
      ) : (
        value
      );
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
  const [currentDatabase, setCurrentDatabase] = useState<ILogicalDatabase>();
  const logicalTableMap = useRef<Map<number, IResponseData<InconsistentPhysicalTable>>>(new Map());
  const [_logicalTableMap, setLogicalTableMap] = useState<
    Map<number, IResponseData<InconsistentPhysicalTable>>
  >(new Map());

  const handleExtractLogicalTables = async () => {
    const successful = await extractLogicalTables(database?.id);
    if (successful) {
      message.info('逻辑表正在提取中，请耐心等待。提取后需确认是否更新逻辑表。');
    }
  };
  const queryLogicalDatabaseById = async () => {
    const responseData = await logicalDatabaseDetail(database?.id);
    if (responseData?.successful) {
      setCurrentDatabase(responseData?.data);
    }
  };
  const columns = getColumns({
    logicalDatabaseId: currentDatabase?.id,
    reload: queryLogicalDatabaseById,
  });
  // const CallbackExpandedRowRender = useCallback((record) => expandedRowRender(record, logicalTableMap, _logicalTableMap), [_logicalTableMap])
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
    <Drawer
      open={openManageLogicDatabase}
      destroyOnClose
      title={'逻辑表管理'}
      width={800}
      closable
      onClose={() => setOpenManageLogicDatabase(false)}
    >
      <Descriptions column={1}>
        <Descriptions.Item label={'当前库'}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DataBaseStatusIcon item={database} />
            {database?.name}
          </div>
        </Descriptions.Item>
      </Descriptions>
      <TableCard
        title={
          <Space size={8}>
            <Tooltip title="将表名相似、结构一致的表提取为逻辑表">
              <Button type="primary" onClick={handleExtractLogicalTables}>
                提取逻辑表
              </Button>
            </Tooltip>
            <Button
              onClick={() =>
                gotoSQLWorkspace(
                  database?.project?.id,
                  null,
                  database?.id,
                  null,
                  '',
                  isLogicalDatabase(database),
                )
              }
            >
              新建逻辑表 <Icon component={NewOpenSvg} />
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
                  <div>暂无数据</div>
                  {isOwner && (
                    <div>
                      系统可能正在将表名相似、结构一致的表提取逻辑表，请耐心等待；也可选择手动提取
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
  );
};
export default ManageLogicDatabase;
