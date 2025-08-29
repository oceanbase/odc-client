import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  IMultipleAsyncExecuteRecord,
  IMultipleAsyncTaskParams,
  TaskDetail,
  TaskRecordParameters,
} from '@/d.ts';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import MultipAsyncExecuteDetailDrawer from './MultipAsyncExecuteDetailDrawer';
import { formatMessage } from '@/util/intl';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { Popover, Space } from 'antd';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import Icon, { SearchOutlined } from '@ant-design/icons';
import { getLocalFormatDateTime } from '@/util/utils';
import StatusLabel, { status } from '@/component/Task/component/Status';
import Action from '@/component/Action';
import { IDatabase } from '@/d.ts/database';
import { TaskStore } from '@/store/task';
import { UserStore } from '@/store/login';
import SearchFilter from '@/component/SearchFilter';
import { getStatusFilters } from '@/component/Task/component/TaskTable/utils';
import { getMultipleAsyncExecuteRecordList, IResponseDataWithStats } from '@/common/network/task';
import { MultipleAsyncExecuteRecordStats } from '@/d.ts';

interface MultipAsyncExecuteProps {
  taskStore?: TaskStore;
  userStore?: UserStore;
  task: TaskDetail<TaskRecordParameters>;
  theme?: string;
  onReload: () => void;
  databaseList: IDatabase[];
}
const MultipAsyncExecute: React.FC<MultipAsyncExecuteProps> = (props) => {
  const { task, databaseList } = props;
  const [multipAsyncExecuteDetailDrawerVisible, setMultipAsyncExecuteDetailDrawerVisible] =
    useState<boolean>(false);
  const [multipAsyncExecuteRecord, setMultipAsyncExecuteRecord] =
    useState<IMultipleAsyncExecuteRecord>();
  const tableRef = useRef();
  const [multipAsyncExecuteRecordList, setMultipAsyncExecuteRecordList] = useState<
    IMultipleAsyncExecuteRecord[]
  >([]);
  const [multipAsyncExecuteRecordRes, setMultipAsyncExecuteRecordRes] =
    useState<
      IResponseDataWithStats<IMultipleAsyncExecuteRecord, MultipleAsyncExecuteRecordStats>
    >();
  const [listParams, setListParams] = useState<ITableLoadOptions>(null);
  const taskStatusFilters = getStatusFilters(status);
  const columns = initColumns(listParams);
  const [loading, setLoading] = useState(false);
  const handleMultipleAsyncOpen = async (record: IMultipleAsyncExecuteRecord) => {
    setMultipAsyncExecuteDetailDrawerVisible(true);
    setMultipAsyncExecuteRecord(record);
  };

  const filter2DArray = (arr: number[][], filter: (item: number) => boolean): number[][] => {
    return arr?.map((subArray) => subArray?.filter(filter));
  };

  const loadData = async (params: {
    page: number;
    size: number;
    keyword?: string;
    statuses?: string[];
  }) => {
    if (!params.size) {
      return;
    }
    setLoading(true);
    const res = await getMultipleAsyncExecuteRecordList({
      id: task.id,
      page: params.page,
      size: params.size,
      keyword: params.keyword,
      statuses: params.statuses,
    });
    setLoading(false);
    setMultipAsyncExecuteRecordRes(res);
    const dbMap = res?.contents?.reduce((pre, cur) => {
      pre[cur?.databaseId] = cur;
      return pre;
    }, {});
    const orderedDatabaseIds = (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters
      ?.orderedDatabaseIds;
    const rawData = [];
    let rawCount = 0;
    filter2DArray(orderedDatabaseIds, (item) => !!dbMap?.[item])?.map((item, index) => {
      item?.forEach((_item_, _index_) => {
        const rowSpan = item?.length;
        const needMerge = _index_ === 0;
        rawData.push({
          id: rawCount,
          nodeIndex: index,
          rowSpan,
          needMerge,
          ...dbMap[_item_],
          database: databaseList?.find((item) => item?.id === _item_),
        });
        rawCount++;
      });
    });
    setMultipAsyncExecuteRecordList(rawData);
  };

  const handleLoad = async (args?: ITableLoadOptions) => {
    loadData({
      page: 1,
      size: args?.pageSize,
    });
  };

  const handleChange = async (args?: ITableLoadOptions) => {
    setListParams(args);
    loadData({
      keyword: args?.filters?.database?.[0] || '',
      statuses: args?.filters?.statuses || [],
      page: args?.pagination?.current || 1,
      size: args?.pageSize,
    });
  };

  function initColumns(listParams: ITableLoadOptions) {
    const { filters } = listParams ?? {};
    const columns = [
      {
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.FC1C254D',
          defaultMessage: '执行顺序',
        }),
        dataIndex: 'nodeIndex',
        width: 80,
        render: (nodeIndex) => nodeIndex + 1,
        fixed: 'left',
        onCell: (record, index) => {
          return {
            rowSpan: record?.needMerge ? record?.rowSpan : 0,
          };
        },
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.9A136568',
          defaultMessage: '数据库',
        }),
        dataIndex: 'database',
        fixed: 'left',
        width: 200,
        ellipsis: {
          showTitle: true,
        },
        filterIcon: (filtered) => (
          <SearchOutlined
            style={{
              color: filtered ? 'var(--icon-color-focus)' : undefined,
            }}
          />
        ),
        filterDropdown: (props) => {
          return <SearchFilter {...props} placeholder={'请输入数据库'} />;
        },
        filteredValue: filters?.database || null,
        render: (_, record) => {
          const icon = getDataSourceStyleByConnectType(record?.database?.dataSource?.type);
          return (
            <Popover
              content={
                <Space size={0}>
                  <RiskLevelLabel
                    content={record?.database?.environment?.name}
                    color={record?.database?.environment?.style}
                  />

                  <Space size={4}>
                    <Icon
                      component={icon?.icon?.component}
                      style={{
                        color: icon?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />

                    <div>{record?.database?.name}</div>
                    <div style={{ color: 'var(--neutral-black45-color)' }}>
                      {record?.database?.dataSource?.name}
                    </div>
                  </Space>
                </Space>
              }
            >
              <Space size={0}>
                <RiskLevelLabel
                  content={record?.database?.environment?.name}
                  color={record?.database?.environment?.style}
                />

                <Space size={4}>
                  <Icon
                    component={icon?.icon?.component}
                    style={{
                      color: icon?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />

                  <div>{record?.database?.name}</div>
                  <div style={{ color: 'var(--neutral-black45-color)' }}>
                    {record?.database?.dataSource?.name}
                  </div>
                </Space>
              </Space>
            </Popover>
          );
        },
      },
      {
        title: 'DML 预估影响行数',
        dataIndex: 'affectedRows',
        width: 150,
        render: (_, record) => {
          return <span>{record?.affectedRows ?? '-'}</span>;
        },
      },
      {
        title: '执行时间',
        dataIndex: 'executionTime',
        width: 178,
        render: (_, record) => (
          <div>{record?.executionTime ? getLocalFormatDateTime(record?.executionTime) : '-'}</div>
        ),
      },
      {
        title: '结束时间',
        dataIndex: 'completeTime',
        width: 178,
        render: (_, record) => {
          return (
            <div>{record?.completeTime ? getLocalFormatDateTime(record?.completeTime) : '-'}</div>
          );
        },
      },
      {
        dataIndex: 'status',
        title: '状态',
        ellipsis: true,
        key: 'statuses',
        fixed: 'right',
        width: 120,
        filters: taskStatusFilters,
        filteredValue: filters?.statuses || null,
        render: (status, record) => {
          return (
            <StatusLabel
              status={record?.status}
              progress={Math.floor(record?.flowInstanceDetailResp?.progressPercentage)}
            />
          );
        },
      },
      {
        dataIndex: 'action',
        title: formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.1DB56DDA',
          defaultMessage: '操作',
        }),
        fixed: 'right',
        ellipsis: true,
        width: 90,
        render: (_, record) => {
          return (
            <>
              <Action.Link
                onClick={async () => {
                  handleMultipleAsyncOpen(record);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.CommonDetailModal.TaskProgress.View',
                  }) /*查看*/
                }
              </Action.Link>
            </>
          );
        },
      },
    ];
    return columns;
  }

  const HeaderContent = useMemo(() => {
    const {
      EXECUTION_FAILED = 0,
      EXECUTION_SUCCEEDED = 0,
      WAIT_FOR_EXECUTION = 0,
      EXECUTING = 0,
    } = multipAsyncExecuteRecordRes?.stats?.statusCount?.count ?? {};
    return (
      <div>{`以下 ${WAIT_FOR_EXECUTION} 个数据库待执行，${EXECUTING} 个数据库执行中， ${EXECUTION_SUCCEEDED} 个数据库执行成功，${EXECUTION_FAILED}个数据库执行失败`}</div>
    );
  }, [multipAsyncExecuteRecordRes?.stats]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {HeaderContent}
      <div style={{ flex: 1 }}>
        <CommonTable
          stripe={false}
          mode={CommonTableMode.SMALL}
          ref={tableRef}
          titleContent={null}
          showToolbar={false}
          enabledReload={false}
          tableProps={{
            dataSource: multipAsyncExecuteRecordList,
            // @ts-ignore
            columns,
            rowKey: 'id',
            scroll: {
              x: 650,
            },
            loading,
            bordered: true,
            pagination: {
              current: multipAsyncExecuteRecordRes?.page?.number,
              total: multipAsyncExecuteRecordRes?.page?.totalElements,
            },
          }}
          onLoad={handleLoad}
          onChange={handleChange}
        />
      </div>

      <MultipAsyncExecuteDetailDrawer
        task={task as TaskDetail<IMultipleAsyncTaskParams>}
        visible={multipAsyncExecuteDetailDrawerVisible}
        onClose={() => setMultipAsyncExecuteDetailDrawerVisible(false)}
        executeRecord={multipAsyncExecuteRecord}
        stats={multipAsyncExecuteRecordRes?.stats}
      />
    </div>
  );
};

export default MultipAsyncExecute;
