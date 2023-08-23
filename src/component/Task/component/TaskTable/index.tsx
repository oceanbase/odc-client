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

import CommonTable from '@/component/CommonTable';
import type {
  ITableFilter,
  ITableInstance,
  ITableLoadOptions,
  ITableSorter,
} from '@/component/CommonTable/interface';
import { CommonTableMode, IOperationOptionType } from '@/component/CommonTable/interface';
import { getCronExecuteCycleByObject, translator } from '@/component/Crontab';
import SearchFilter from '@/component/SearchFilter';
import StatusLabel, { cycleStatus, status } from '@/component/Task/component/Status';
import { TimeOptions } from '@/component/TimeSelect';
import UserPopover from '@/component/UserPopover';
import type {
  ICycleTaskRecord,
  ICycleTaskTriggerConfig,
  IDataArchiveJobParameters,
  IResponseData,
  ISqlPlayJobParameters,
  TaskRecord,
  TaskRecordParameters,
} from '@/d.ts';
import { TaskExecStrategy, TaskPageType, TaskStatus, TaskType } from '@/d.ts';
import type { PageStore } from '@/store/page';
import type { TaskStore } from '@/store/task';
import { isClient } from '@/util/env';
import { useLoop } from '@/util/hooks/useLoop';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Divider, Menu } from 'antd';
import { inject, observer } from 'mobx-react';
import type { Moment } from 'moment';
import moment from 'moment';
import type { FixedType } from 'rc-table/lib/interface';
import React, { useEffect, useRef, useState } from 'react';
import { getTaskGroupLabels, getTaskLabelByType, isCycleTaskPage } from '../../helper';
import styles from '../../index.less';
import TaskTools from '../ActionBar';
const { RangePicker } = DatePicker;
export const getCronCycle = (triggerConfig: ICycleTaskTriggerConfig) => {
  const { triggerStrategy, days, hours, cronExpression } = triggerConfig;
  return triggerStrategy !== TaskExecStrategy.CRON
    ? getCronExecuteCycleByObject(triggerStrategy as any, {
        hour: hours,
        dayOfWeek: days,
        dayOfMonth: days,
      })
    : translator.parse(cronExpression).toLocaleString();
};
export const TaskTypeMap = {
  [TaskType.IMPORT]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.Import',
  }),
  //导入
  [TaskType.EXPORT]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.Export',
  }),
  //导出
  [TaskType.DATAMOCK]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.AnalogData',
  }),
  //模拟数据
  [TaskType.ASYNC]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.DatabaseChanges',
  }),
  // 数据库变更

  [TaskType.PARTITION_PLAN]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
  }),
  //分区计划

  [TaskType.SHADOW]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.ShadowTableSynchronization',
  }),
  //影子表同步

  [TaskType.ALTER_SCHEDULE]: formatMessage({
    id: 'odc.TaskManagePage.component.TaskTable.PlannedChange',
  }),
  //计划变更
  [TaskType.EXPORT_RESULT_SET]: formatMessage({
    id: 'odc.src.component.Task.component.TaskTable.ExportResultSet',
  }), //'导出结果集'
  [TaskType.SQL_PLAN]: formatMessage({
    id: 'odc.component.TaskTable.SqlPlan',
  }),
  //SQL 计划
  [TaskType.DATA_ARCHIVE]: formatMessage({
    id: 'odc.component.TaskTable.DataArchiving',
  }),
  //数据归档
  [TaskType.ONLINE_SCHEMA_CHANGE]: formatMessage({
    id: 'odc.component.TaskTable.LockFreeStructureChange',
  }),
  //无锁结构变更
  [TaskType.DATA_DELETE]: formatMessage({
    id: 'odc.component.TaskTable.DataCleansing',
  }), //数据清理
};

export const getStatusFilters = (status: {
  [key: string]: {
    text: string;
  };
}) => {
  return Object.keys(status)
    ?.filter((key) => key !== TaskStatus.WAIT_FOR_CONFIRM)
    .map((key) => {
      return {
        text: status?.[key].text,
        value: key,
      };
    });
};
export const TASK_EXECUTE_TIME_KEY = 'task:executeTime';
export const TASK_EXECUTE_DATE_KEY = 'task:executeDate';
interface IProps {
  tableRef: React.RefObject<ITableInstance>;
  taskStore?: TaskStore;
  pageStore?: PageStore;
  taskTabType?: TaskPageType;
  taskList: IResponseData<
    | TaskRecord<TaskRecordParameters>
    | ICycleTaskRecord<ISqlPlayJobParameters | IDataArchiveJobParameters>
  >;
  isMultiPage?: boolean;
  getTaskList: (args: ITableLoadOptions, executeDate: [Moment, Moment]) => Promise<any>;
  onReloadList: () => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onChange?: (args: ITableLoadOptions) => void;
  onMenuClick?: (type: TaskPageType) => void;
}
const TaskTable: React.FC<IProps> = inject(
  'taskStore',
  'pageStore',
)(
  observer((props) => {
    const { taskStore, pageStore, taskTabType, tableRef, taskList, isMultiPage } = props;
    const { taskPageScope } = taskStore;
    const taskStatusFilters = getStatusFilters(isCycleTaskPage(taskTabType) ? cycleStatus : status);
    const currentTask = taskList;
    const [executeTime, setExecuteTime] = useState(() => {
      return JSON.parse(localStorage?.getItem(TASK_EXECUTE_TIME_KEY)) ?? 7;
    });
    const [executeDate, setExecuteDate] = useState<[Moment, Moment]>(() => {
      const [start, end] = JSON.parse(localStorage?.getItem(TASK_EXECUTE_DATE_KEY)) ?? [null, null];
      return !start || !end ? null : [moment(start), moment(end)];
    });
    const [loading, setLoading] = useState(false);
    const [listParams, setListParams] = useState(null);
    const loadParams = useRef(null);
    const { activePageKey } = pageStore;
    const columns = initColumns(listParams);
    const { loop: loadData, destory } = useLoop((count) => {
      return async (args: ITableLoadOptions) => {
        const _executeTime = args?.filters?.executeTime ?? executeTime;
        loadParams.current = args;
        if (isMultiPage && activePageKey !== taskTabType) {
          destory();
          return;
        }
        setExecuteTime(_executeTime);
        const filters = {
          ...args?.filters,
          executeTime: _executeTime,
        };
        setListParams({
          ...args,
          filters,
        });
        await props.getTaskList(
          {
            ...args,
            filters,
          },
          executeDate,
        );
        setLoading(false);
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
    }, [taskPageScope, taskTabType, activePageKey]);
    useEffect(() => {
      if (executeTime) {
        localStorage.setItem(TASK_EXECUTE_TIME_KEY, JSON.stringify(executeTime));
      }
    }, [executeTime]);
    function initColumns(listParams: { filters: ITableFilter; sorter: ITableSorter }) {
      const { filters, sorter } = listParams ?? {};
      const columns = [
        {
          dataIndex: 'id',
          title: formatMessage({
            id: 'odc.component.TaskTable.No',
          }),
          //编号
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
          width: 80,
          fixed: 'left' as FixedType,
        },
        {
          dataIndex: 'type',
          title: formatMessage({
            id: 'odc.component.TaskTable.Type',
          }),
          //类型
          ellipsis: true,
          width: 100,
          render: (type, record) => {
            return TaskTypeMap[type === TaskType.ALTER_SCHEDULE ? record?.parameters?.type : type];
          },
        },
        {
          dataIndex: 'description',
          title: formatMessage({
            id: 'odc.component.TaskTable.TicketDescription',
          }),
          //工单描述
          ellipsis: true,
          render: (description) => description || '-',
        },
        {
          dataIndex: 'candidateApprovers',
          title: formatMessage({
            id: 'odc.component.TaskTable.CurrentHandler',
          }),
          //当前处理人
          ellipsis: true,
          width: 115,
          filterDropdown: (props) => {
            return (
              <SearchFilter
                {...props}
                selectedKeys={filters?.candidateApprovers}
                placeholder={formatMessage({
                  id: 'odc.component.TaskTable.CurrentHandler',
                })} /*当前处理人*/
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
          filteredValue: filters?.candidateApprovers || null,
          filters: [],
          render: (candidateApprovers) =>
            candidateApprovers?.map((item) => item.name)?.join(', ') || '-',
        },
        {
          dataIndex: 'creator',
          title: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.Created',
          }),
          //创建人
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
          dataIndex: 'createTime',
          key: 'createTime',
          title: formatMessage({
            id: 'odc.components.TaskManagePage.CreationTime',
          }),
          render: (time: number) => getLocalFormatDateTime(time),
          sorter: true,
          sortOrder: sorter?.columnKey === 'createTime' && sorter?.order,
          width: 180,
        },
        {
          dataIndex: 'status',
          title: formatMessage({
            id: 'odc.component.TaskTable.Status',
          }),
          //状态
          width: 120,
          filters: taskStatusFilters,
          filteredValue: filters?.status || null,
          render: (status, record) => (
            <StatusLabel
              status={status}
              type={record?.type}
              progress={Math.floor(record.progressPercentage)}
            />
          ),
        },
        {
          dataIndex: 'deal',
          title: formatMessage({
            id: 'odc.components.TaskManagePage.Operation',
          }),
          width: 145,
          render: (_, record) => (
            <TaskTools
              task={record}
              onReloadList={props.onReloadList}
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
      loadData(listParams);
    };
    const isAll = [
      TaskPageType.APPROVE_BY_CURRENT_USER,
      TaskPageType.CREATED_BY_CURRENT_USER,
    ].includes(taskTabType);
    const menus = getTaskGroupLabels()?.filter((item) => !!item.groupName);
    const activeTaskLabel = getTaskLabelByType(taskTabType);

    return (
      <CommonTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        titleContent={null}
        operationContent={{
          options: [
            isAll
              ? {
                  type: IOperationOptionType.dropdown,
                  content: (
                    <Button type="primary">
                      {
                        formatMessage({
                          id: 'odc.component.TaskTable.NewWorkOrder',
                        }) /*新建工单*/
                      }

                      <DownOutlined />
                    </Button>
                  ),
                  overlay: (
                    <Menu
                      onClick={({ key }) => {
                        props.onMenuClick(key as TaskPageType);
                      }}
                    >
                      {menus?.map(({ group }, index) => {
                        const tasks = group?.filter((task) => task.enabled);
                        return (
                          <>
                            {tasks?.map((item) => (
                              <Menu.Item key={item.value}>{item.label}</Menu.Item>
                            ))}
                            {index !== menus?.length - 1 && (
                              <Divider
                                style={{
                                  margin: 0,
                                }}
                              />
                            )}
                          </>
                        );
                      })}
                    </Menu>
                  ),
                }
              : {
                  type: IOperationOptionType.button,
                  content: `新建${activeTaskLabel}`,
                  isPrimary: true,
                  onClick: () => {
                    props.onMenuClick(taskTabType);
                  },
                },
          ],
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
                    style={{
                      width: '250px',
                    }}
                    size="small"
                    bordered={false}
                    suffixIcon={null}
                    defaultValue={executeDate}
                    showTime={{
                      format: 'HH:mm:ss',
                    }}
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
          ],
        }}
        onLoad={loadData}
        onChange={handleChange}
        tableProps={{
          className: styles.commonTable,
          rowClassName: styles.tableRrow,
          columns: columns as any,
          dataSource: currentTask?.contents,
          rowKey: 'id',
          loading: loading,
          pagination: {
            current: currentTask?.page?.number,
            total: currentTask?.page?.totalElements,
          },
          scroll: {
            x: 900,
          },
        }}
      />
    );
  }),
);
export default TaskTable;
