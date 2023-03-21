import { getConnectionList } from '@/common/network/connection';
import CommonTable from '@/component/CommonTable';
import type {
  ITableFilter,
  ITableInstance,
  ITableLoadOptions,
  ITableSorter,
} from '@/component/CommonTable/interface';
import { CommonTableMode } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import StatusLabel, { cycleStatus } from '@/component/TaskStatus';
import { TimeOptions } from '@/component/TimeSelect';
import TreeFilter from '@/component/TreeFilter';
import UserPopover from '@/component/UserPopover';
import type { TaskRecord, TaskRecordParameters } from '@/d.ts';
import { IConnectionType, TaskPageType } from '@/d.ts';
import type { SchemaStore } from '@/store/schema';
import type { SettingStore } from '@/store/setting';
import type { TaskStore } from '@/store/task';
import task from '@/store/task';
import { isClient } from '@/util/env';
import { useLoop } from '@/util/hooks/useLoop';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { FilterFilled, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import { flatten } from 'lodash';
import { inject, observer } from 'mobx-react';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import styles from '../index.less';
import { getTaskTypeList } from './helper';
import { SubTaskTable } from './SubTaskTable';
import {
  getCronCycle,
  getStatusFilters,
  TASK_EXECUTE_DATE_KEY,
  TASK_EXECUTE_TIME_KEY,
} from './TaskTable';
import TaskTools from './TaskTools';

const { RangePicker } = DatePicker;

interface IProps {
  tableRef: React.RefObject<ITableInstance>;
  schemaStore?: SchemaStore;
  taskStore?: TaskStore;
  settingStore?: SettingStore;
  getTaskList: (args: ITableLoadOptions, executeDate: [Moment, Moment]) => Promise<any>;
  onReloadList: () => void;
  onApprovalVisible: (
    task: TaskRecord<TaskRecordParameters>,
    status: boolean,
    visible: boolean,
  ) => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onChange?: (args: ITableLoadOptions) => void;
}

const cycleTaskStatusFilters = getStatusFilters(cycleStatus);

const CycleTaskTable: React.FC<IProps> = inject(
  'schemaStore',
  'taskStore',
  'settingStore',
)(
  observer((props) => {
    const { taskStore, schemaStore, settingStore, tableRef } = props;
    const { cycleTasks, taskPageScope, taskPageType } = taskStore;
    const [executeTime, setExecuteTime] = useState(() => {
      return JSON.parse(localStorage?.getItem(TASK_EXECUTE_TIME_KEY)) ?? 7;
    });
    const [executeDate, setExecuteDate] = useState<[Moment, Moment]>(() => {
      const [start, end] = JSON.parse(localStorage?.getItem(TASK_EXECUTE_DATE_KEY)) ?? [null, null];
      return !start || !end ? null : [moment(start), moment(end)];
    });
    const [loading, setLoading] = useState(false);
    const [connections, setConnection] = useState(null);
    const [subTableHeightMap, setSubTableHeightMap] = useState<
      Record<
        number,
        {
          expanded: boolean;
          height: number;
        }
      >
    >(null);
    const [listParams, setListParams] = useState(null);
    const loadParams = useRef(null);
    const reqCountRef = useRef(0);
    const fileExpireHours = settingStore?.serverSystemInfo?.fileExpireHours ?? null;
    const subTableTotalHeight = Object?.values(subTableHeightMap ?? {})
      ?.filter((item) => item.expanded)
      ?.reduce((total, curr) => {
        return (total += curr.height);
      }, 0);

    const alertMessage = fileExpireHours
      ? formatMessage(
          {
            id: 'odc.TaskManagePage.component.TaskTable.TheAttachmentUploadedByThe',
          },

          { fileMaxRetainHours: fileExpireHours },
        )
      : //`创建任务上传的附件保留时间为 ${fileMaxRetainHours}小时`
        null;

    const taskTypeList: {
      value: TaskPageType;
      label: string;
      enabled: boolean;
    }[] = flatten(
      getTaskTypeList(settingStore, schemaStore, task)?.map((a) => {
        return a.group || [];
      }),
    );

    const taskLabelInfo = taskTypeList.find((item) => item.value === taskPageType);

    const columns = initCycleTaskColumns(listParams);

    useEffect(() => {
      getConnections();
    }, []);

    const loadData = useLoop((count) => {
      const enableLoading = count === 0;
      return async (args: ITableLoadOptions) => {
        const _executeTime = args?.filters?.executeTime ?? executeTime;
        loadParams.current = args;
        setExecuteTime(_executeTime);
        reqCountRef.current++;
        const filters = {
          ...args?.filters,
          executeTime: _executeTime,
        };
        await props.getTaskList(
          {
            ...args,
            filters,
          },
          executeDate,
        );
        setListParams({
          ...args,
          filters,
        });
        reqCountRef.current--;
        !reqCountRef.current && enableLoading && setLoading(false);
      };
    }, 6000);

    useEffect(() => {
      loadData(loadParams.current);
    }, [executeDate]);

    useEffect(() => {
      if (loadParams.current) {
        setLoading(true);
        loadData({
          ...loadParams.current,
          filters: null,
          sorter: null,
          pagination: {
            current: 1,
          },
        });
      }
    }, [taskPageScope, taskPageType]);

    useEffect(() => {
      if (executeTime) {
        localStorage.setItem(TASK_EXECUTE_TIME_KEY, JSON.stringify(executeTime));
      }
    }, [executeTime]);

    async function getConnections() {
      const privateConnections = await getConnectionList({
        visibleScope: IConnectionType.PRIVATE,
      });

      const publicConnections = await getConnectionList({
        visibleScope: IConnectionType.ORGANIZATION,
      });

      setConnection({
        privateConnections: privateConnections?.contents,
        publicConnections: publicConnections?.contents,
      });
    }

    function getConnectionFilter() {
      return [
        {
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.PersonalConnection',
          }),

          //个人连接
          key: IConnectionType.PRIVATE,
          children: getTreeChild(connections?.privateConnections),
        },

        {
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.PublicConnection',
          }),

          //公共连接
          key: IConnectionType.ORGANIZATION,
          children: getTreeChild(connections?.publicConnections),
          disabled: !connections?.publicConnections?.length,
        },
      ];
    }

    function getTreeChild(params: { name: string; id: number }[]) {
      return (
        params?.map(({ name, id }) => {
          return {
            title: name,
            key: id,
          };
        }) ?? []
      );
    }

    function initCycleTaskColumns(listParams: { filters: ITableFilter; sorter: ITableSorter }) {
      const { filters, sorter } = listParams ?? {};
      const treeData = getConnectionFilter();
      const columns = [
        {
          key: 'id',
          dataIndex: 'id',
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.No',
          }), //编号
          filterDropdown: (props) => {
            return (
              <SearchFilter
                {...props}
                selectedKeys={filters?.id}
                placeholder={formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTable.PleaseEnterTheNumber',
                })}

                /*请输入编号*/
              />
            );
          },
          filterIcon: (filtered) => (
            <SearchOutlined
              style={{
                color: filtered ? 'var(--icon-color-focus)' : undefined,
              }}
            />
          ),
          filteredValue: filters?.id || null,
          filters: [],
          ellipsis: true,
          width: 100,
        },

        {
          key: 'cycleTaskConnection',
          dataIndex: 'connection',
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.Connection',
          }), //所属连接
          textWrap: 'word-break',
          ellipsis: true,
          width: 300,
          filterDropdown: (props) => {
            return <TreeFilter {...props} treeData={treeData} />;
          },
          filterIcon: (filtered) => (
            <FilterFilled
              style={{
                color: filtered ? 'var(--icon-color-focus)' : undefined,
              }}
            />
          ),

          render: (connection) => connection?.name || '-',
        },

        {
          key: 'cycleTaskTriggerConfig',
          dataIndex: 'triggerConfig',
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.ExecutionCycle',
          }), //执行周期
          width: 204,
          ellipsis: true,
          textWrap: 'word-break',
          render: (triggerConfig) => {
            return getCronCycle(triggerConfig);
          },
        },

        {
          key: 'cycleTaskNextFireTimes',
          dataIndex: 'nextFireTimes',
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.NextExecutionTime',
          }), //下一次执行时间
          render: (nextFireTimes: number[]) => getLocalFormatDateTime(nextFireTimes?.[0]),
          width: 180,
        },

        {
          key: 'creator',
          dataIndex: 'creator',
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.Founder',
          }), //创建人
          width: 80,
          ellipsis: {
            showTitle: false,
          },

          filterDropdown: (props) => {
            return (
              <SearchFilter
                {...props}
                selectedKeys={filters?.creator}
                placeholder={formatMessage({
                  id: 'odc.TaskManagePage.component.TaskTable.EnterTheCreator',
                })}

                /*请输入创建人*/
              />
            );
          },
          filterIcon: (filtered) => (
            <SearchOutlined
              style={{
                color: filtered ? 'var(--icon-color-focus)' : undefined,
              }}
            />
          ),
          filteredValue: filters?.creator || null,
          filters: [],
          render: (creator) => {
            return (
              <UserPopover
                name={creator?.name || '-'}
                accountName={creator?.accountName}
                roles={creator?.roleNames}
              />
            );
          },
        },

        {
          key: 'updateTime',
          dataIndex: 'updateTime',
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.UpdateTime',
          }), //更新时间
          render: (updateTime: number) => getLocalFormatDateTime(updateTime),
          sorter: true,
          sortOrder: sorter?.columnKey === 'updateTime' && sorter?.order,
          width: 180,
        },

        {
          key: 'cycleTaskStatus',
          dataIndex: 'status',
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.Status',
          }), //状态
          width: 120,
          filters: cycleTaskStatusFilters,
          render: (_status, record) => (
            <StatusLabel
              status={_status}
              progress={Math.floor(record.progressPercentage)}
              type={record?.type}
            />
          ),
        },

        {
          key: 'cycleTaskDeal',
          dataIndex: 'deal',
          title: formatMessage({
            id: 'odc.components.TaskManagePage.Operation',
          }),
          width: 145,
          render: (_, record) => (
            <TaskTools
              task={record}
              onReloadList={props.onReloadList}
              onApprovalVisible={props.onApprovalVisible}
              onDetailVisible={props.onDetailVisible}
            />
          ),
        },
      ];

      return !isClient() ? columns : columns.filter((item) => item.dataIndex !== 'creator');
    }

    const handleChange = (params: ITableLoadOptions) => {
      loadData(params);
    };

    const handleReload = () => {
      tableRef?.current.reload();
    };

    const handleSubTableHeightChange = (
      rowId: number,
      value: {
        expanded: boolean;
        height: number;
      },
    ) => {
      setSubTableHeightMap({
        ...subTableHeightMap,
        [rowId]: value,
      });
    };

    return (
      <CommonTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        subTableTotalHeight={subTableTotalHeight}
        alertInfoContent={{
          message: !isClient() ? alertMessage : null,
        }}
        titleContent={{
          title: taskLabelInfo?.label,
          enabledReload: false,
          wrapperClass: styles.title,
        }}
        filterContent={{
          enabledSearch: false,
          filters: [
            {
              name: 'executeTime',
              defaultValue: executeTime,
              dropdownWidth: 160,
              options: TimeOptions,
            },

            {
              render: (params: ITableLoadOptions) => {
                const content = executeTime === 'custom' && (
                  <RangePicker
                    className={styles.rangePicker}
                    style={{ width: '250px' }}
                    size="small"
                    bordered={false}
                    suffixIcon={null}
                    defaultValue={executeDate}
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={(value) => {
                      setExecuteDate(value);
                      localStorage.setItem(TASK_EXECUTE_DATE_KEY, JSON.stringify(value));
                    }}
                  />
                );

                return content;
              },
            },

            {
              render: (params: ITableLoadOptions) => {
                return (
                  <SyncOutlined className={styles.cursor} onClick={handleReload} spin={loading} />
                );
              },
            },
          ],
        }}
        onLoad={loadData}
        onChange={handleChange}
        tableProps={{
          className: styles.commonTable,
          rowClassName: styles.tableRrow,
          columns: columns as any,
          dataSource: cycleTasks?.contents,
          rowKey: 'id',
          loading: loading,
          pagination: {
            current: cycleTasks?.page?.number,
            total: cycleTasks?.page?.totalElements,
          },

          expandable: {
            expandedRowRender: (record: { id: number }, index, indent, expanded) => (
              <SubTaskTable
                taskId={record?.id}
                expanded={expanded}
                onApprovalVisible={props.onApprovalVisible}
                onDetailVisible={props.onDetailVisible}
                onHeightChange={handleSubTableHeightChange}
              />
            ),
          },
        }}
      />
    );
  }),
);

export default CycleTaskTable;
