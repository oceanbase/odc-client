import CommonTable from '@/component/CommonTable';
import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import styles from '../index.less';
import { formatMessage } from '@/util/intl';
import SearchFilter from '@/component/SearchFilter';
import Icon, { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import {
  ILogicDatabaseChangeExecuteRecord,
  LogicDatabaseChangeExecuteRecordStats,
  TaskDetail,
  TaskRecordParameters,
} from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { Popover, Space, Tooltip, Typography, message } from 'antd';
import { logicDBChangeTaskStatus } from '@/component/Task/component/Status';
import { SchemaChangeRecordStatus } from '@/d.ts/logicalDatabase';
import { skipPhysicalSqlExecute, stopPhysicalSqlExecute } from '@/common/network/logicalDatabase';
import LogicDatabaseChangeExecuteModal from './LogicDatabaseChangeExecuteModal';
import TaskProgressHeader from '../TaskProgressHeader';
import { IResponseDataWithStats } from '@/common/network/task';
import { UserStore } from '@/store/login';
import { useLoop } from '@/util/hooks/useLoop';
import { getLogicDatabaseChangeExecuteRecordList } from '@/common/network/logicalDatabase';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
const { Link } = Typography;

interface IProps {
  task: TaskDetail<TaskRecordParameters>;
  userStore?: UserStore;
  theme?: string;
  databaseList: IDatabase[];
}
const LogicDatabaseChangeExecute = (props: IProps) => {
  const { task, databaseList } = props;
  const tableRef = useRef();
  const [subTasks, setSubTasks] = useState<ILogicDatabaseChangeExecuteRecord[]>([]);
  const [result, setResult] = useState<ILogicDatabaseChangeExecuteRecord>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [listParams, setListParams] = useState<ITableLoadOptions>(null);
  const [logicDatabaseExecuteRecordRes, setLogicDatabaseExecuteRecordRes] =
    useState<
      IResponseDataWithStats<
        ILogicDatabaseChangeExecuteRecord,
        LogicDatabaseChangeExecuteRecordStats
      >
    >();
  const { loop: loadData, destory } = useLoop(() => {
    return async (params: {
      page: number;
      size: number;
      statuses?: string[];
      databaseKeyword?: string;
      datasourceKeyword?: string;
    }) => {
      if (!params?.size) return;
      const rawData: ILogicDatabaseChangeExecuteRecord[] = [];
      const res = await getLogicDatabaseChangeExecuteRecordList({
        id: task.id,
        ...params,
      });
      res?.contents?.forEach((item) => {
        const physicalDatabase = databaseList?.find((i) => i?.id === item?.physicalDatabaseId);
        rawData.push({
          ...item,
          physicalDatabase: physicalDatabase,
        });
      });
      setSubTasks(rawData);
      setLogicDatabaseExecuteRecordRes(res);
    };
  }, 6000);

  const handleLogicalDatabaseAsyncModalOpen = (data: ILogicDatabaseChangeExecuteRecord) => {
    setResult(data);
    setModalOpen(true);
  };

  const handleLogicalDatabaseTaskStop = async (data: ILogicDatabaseChangeExecuteRecord) => {
    const res = await stopPhysicalSqlExecute(task?.id, data?.physicalDatabaseId);
    if (res) {
      message.success(
        formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.1F689C8D',
          defaultMessage: '正在尝试终止',
        }),
      );
    } else {
      message.warning(
        formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.30E204EE',
          defaultMessage: '当前任务状态不支持终止',
        }),
      );
    }
  };

  const handleLogicalDatabaseTaskSkip = async (data: ILogicDatabaseChangeExecuteRecord) => {
    const res = await skipPhysicalSqlExecute(task?.id, data?.physicalDatabaseId);
    if (res) {
      message.success(
        formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.B0CD0DE9',
          defaultMessage: '正在尝试跳过',
        }),
      );
    } else {
      message.warning(
        formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.6C8E11EA',
          defaultMessage: '当前任务状态不支持跳过',
        }),
      );
    }
  };

  const handleLoad = async (args?: ITableLoadOptions) => {
    loadData({
      page: 1,
      size: args?.pageSize,
    });
  };

  useEffect(() => {
    return () => {
      destory();
    };
  }, []);

  const handleChange = async (args?: ITableLoadOptions) => {
    setListParams(args);
    loadData({
      databaseKeyword: args?.filters?.physicalDatabase?.[0] || '',
      datasourceKeyword: args?.filters?.datasource?.[0] || '',
      statuses: args?.filters?.status || [],
      page: args?.pagination?.current || 1,
      size: args?.pageSize,
    });
  };

  const initColumns = (listParams: ITableLoadOptions) => {
    const { filters } = listParams ?? {};
    const columns = [
      {
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.7E35E39B',
          defaultMessage: '执行数据库',
        }),
        key: 'physicalDatabase',
        dataIndex: 'physicalDatabase',
        ellipsis: {
          showTitle: true,
        },
        filterDropdown: (props) => {
          return (
            <SearchFilter
              {...props}
              placeholder={formatMessage({
                id: 'src.component.Task.component.CommonDetailModal.B77644B9',
                defaultMessage: '请输入执行数据库名称',
              })}
            />
          );
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
        ),
        filteredValue: filters?.physicalDatabase || null,
        render: (physicalDatabase: IDatabase, record: ILogicDatabaseChangeExecuteRecord) => {
          const icon = getDataSourceStyleByConnectType(physicalDatabase?.dataSource?.type);

          return (
            <Space size={0}>
              <Space size={4}>
                <Icon
                  component={icon?.icon?.component}
                  style={{
                    color: icon?.icon?.color,
                    fontSize: 16,
                    marginRight: 4,
                  }}
                />

                <div>{physicalDatabase?.name}</div>
              </Space>
            </Space>
          );
        },
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.B38FABC4',
          defaultMessage: '数据源',
        }),
        key: 'datasource',
        dataIndex: 'datasource',
        render: (value, record: ILogicDatabaseChangeExecuteRecord) => {
          return record?.dataSourceName ?? '-';
        },
        filterDropdown: (props) => {
          return (
            <SearchFilter
              {...props}
              placeholder={formatMessage({
                id: 'src.component.Task.component.CommonDetailModal.EB0FAD1D',
                defaultMessage: '请输入数据源名称',
              })}
            />
          );
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
        ),
        filteredValue: filters?.datasource || null,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.D5F9DCA0',
          defaultMessage: '执行状态',
        }),
        key: 'status',
        dataIndex: 'status',
        ellipsis: true,
        filters: Object.entries(SchemaChangeRecordStatus).map(([key, value]) => {
          return {
            text: logicDBChangeTaskStatus[key]?.text,
            value: key,
          };
        }),
        filteredValue: filters?.status || null,
        render: (value, row: ILogicDatabaseChangeExecuteRecord) => {
          return (
            <Space size={2}>
              {logicDBChangeTaskStatus[value]?.icon}
              {logicDBChangeTaskStatus[value]?.text}
              {row?.completedSqlCount && row?.totalSqlCount && (
                <span>
                  ({row?.completedSqlCount}/{row?.totalSqlCount})
                </span>
              )}
            </Space>
          );
        },
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.13DCD7AB',
          defaultMessage: '操作',
        }),
        key: 'operation',
        render: (value, record: ILogicDatabaseChangeExecuteRecord) => {
          return (
            <Space>
              <Link onClick={() => handleLogicalDatabaseAsyncModalOpen(record)}>
                {formatMessage({
                  id: 'src.component.Task.component.CommonDetailModal.178F11D7',
                  defaultMessage: '查看',
                })}
              </Link>
              {record?.status === SchemaChangeRecordStatus.RUNNING && (
                <Link onClick={() => handleLogicalDatabaseTaskStop(record)}>
                  {formatMessage({
                    id: 'src.component.Task.component.CommonDetailModal.7EF67970',
                    defaultMessage: '终止',
                  })}
                </Link>
              )}

              {[
                SchemaChangeRecordStatus.FAILED,
                SchemaChangeRecordStatus.TERMINATED,
                SchemaChangeRecordStatus.TERMINATE_FAILED,
              ]?.includes(record?.status as SchemaChangeRecordStatus) && (
                <Link onClick={() => handleLogicalDatabaseTaskSkip(record)}>
                  {formatMessage({
                    id: 'src.component.Task.component.CommonDetailModal.88502ED7',
                    defaultMessage: '跳过',
                  })}
                </Link>
              )}
            </Space>
          );
        },
      },
    ];
    return columns;
  };

  return (
    <>
      <TaskProgressHeader subTasks={subTasks} pendingExectionDatabases={0} isLogicalDb={true} />
      <CommonTable
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        titleContent={null}
        showToolbar={false}
        enabledReload={false}
        tableProps={{
          className: styles.subTaskTable,
          columns: initColumns(listParams),
          dataSource: subTasks,
          rowKey: 'physicalDatabaseId',
          scroll: {
            x: 650,
          },
          pagination: {
            current: logicDatabaseExecuteRecordRes?.page?.number,
            total: logicDatabaseExecuteRecordRes?.page?.totalElements,
          },
        }}
        onLoad={handleLoad}
        onChange={handleChange}
      />
      <LogicDatabaseChangeExecuteModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        data={result}
        task={task}
      />
    </>
  );
};

export default LogicDatabaseChangeExecute;
