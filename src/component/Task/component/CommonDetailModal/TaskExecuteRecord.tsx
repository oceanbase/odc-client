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
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { skipPhysicalSqlExecute, stopPhysicalSqlExecute } from '@/common/network/logicalDatabase';
import { getScheduleTaskDetail } from '@/common/network/task';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import StatusLabel, {
  logicDBChangeTaskStatus,
  status,
  subTaskStatus,
} from '@/component/Task/component/Status';
import DetailModal from '@/component/Task/DetailModal';
import {
  IAsyncTaskParams,
  IResponseData,
  SubTaskStatus,
  SubTaskType,
  TaskRecord,
  TaskRecordParameters,
  TaskType,
} from '@/d.ts';
import { ISchemaChangeRecord, SchemaChangeRecordStatus } from '@/d.ts/logicalDatabase';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import Icon, { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Space, Typography, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { isLogicalDbChangeTask } from '../../helper';
import ExcecuteDetailModal from './ExcecuteDetailModal';
import styles from './index.less';
import LogModal from './LogModal';
import TaskProgressModal from './TaskExecuteModal';
import TaskTools from './TaskTools';

const { Link } = Typography;

const TaskLabelMap = {
  [TaskType.DATA_ARCHIVE]: {
    [SubTaskType.DATA_ARCHIVE]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataArchiving',
      defaultMessage: '数据归档',
    }), //数据归档
    [SubTaskType.DATA_ARCHIVE_ROLLBACK]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.Rollback',
      defaultMessage: '回滚',
    }), //回滚
    [SubTaskType.DATA_ARCHIVE_DELETE]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.SourceTableCleanup',
      defaultMessage: '源表清理',
    }), //源表清理
  },
  [TaskType.DATA_DELETE]: {
    [SubTaskType.DATA_DELETE]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataCleansing',
      defaultMessage: '数据清理',
    }), //数据清理
  },
  [TaskType.SQL_PLAN]: {
    [SubTaskType.ASYNC]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DatabaseChanges',
      defaultMessage: '数据库变更',
    }), //数据库变更
  },
};

const getStatusFilters = (isSubTask) => {
  const statusMap = isSubTask ? subTaskStatus : status;
  return Object.keys(statusMap).map((key) => {
    return {
      text: statusMap?.[key].text,
      value: key,
    };
  });
};

const getJobFilter = (taskType: TaskType) => {
  return Object.keys(TaskLabelMap[taskType])?.map((key) => ({
    text: TaskLabelMap[taskType][key],
    value: key,
  }));
};

const getLogicalDatabaseAsyncColumns = (params: {
  handleLogicalDatabaseAsyncModalOpen: (taskId: number) => void;
  handleLogicalDatabaseTaskStop: (taskId: number) => void;
  handleLogicalDatabaseTaskSkip: (taskId: number) => void;
}) => {
  return [
    {
      title: '执行数据库',
      key: 'database',
      dataIndex: 'database',
      ellipsis: {
        showTitle: true,
      },
      filterDropdown: (props) => {
        return <SearchFilter {...props} placeholder="请输入执行数据库名称" />;
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),
      onFilter: (value, record) => {
        return record?.database?.name?.includes(value);
      },
      render: (_, record) => {
        const icon = getDataSourceStyleByConnectType(record?.database?.dataSource?.type);
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

              <div>{record?.database?.name}</div>
            </Space>
          </Space>
        );
      },
    },
    {
      title: '数据源',
      key: 'datasource',
      dataIndex: 'datasource',
      render: (value, record) => {
        return record?.database?.dataSource?.name;
      },
      filterDropdown: (props) => {
        return <SearchFilter {...props} placeholder="请输入数据源名称" />;
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),
      onFilter: (value, record) => {
        return record?.dataSource?.name?.includes(value);
      },
    },
    {
      title: '执行状态',
      key: 'status',
      dataIndex: 'status',
      render: (value, row: ISchemaChangeRecord) => {
        return (
          <Space>
            {logicDBChangeTaskStatus[value]?.icon}
            <Space size={0}>
              {logicDBChangeTaskStatus[value]?.text}({row?.completedSqlCount}/{row?.totalSqlCount})
            </Space>
          </Space>
        );
      },
      onFilter: (value, record) => {
        return value == record?.status;
      },
      filters: Object.entries(SchemaChangeRecordStatus).map(([key, value]) => {
        return {
          text: logicDBChangeTaskStatus[key]?.text,
          value: key,
        };
      }),
    },
    {
      title: '操作',
      key: 'operation',
      render: (value, record: ISchemaChangeRecord) => {
        return (
          <Space>
            <Link onClick={() => params?.handleLogicalDatabaseAsyncModalOpen(record?.id)}>
              查看
            </Link>
            {record?.status === SchemaChangeRecordStatus.RUNNING && (
              <Link onClick={() => params?.handleLogicalDatabaseTaskStop(record?.id)}>终止</Link>
            )}
            {[
              SchemaChangeRecordStatus.FAILED,
              SchemaChangeRecordStatus.TERMINATED,
              SchemaChangeRecordStatus.TERMINATE_FAILED,
            ]?.includes(record?.status) && (
              <Link onClick={() => params?.handleLogicalDatabaseTaskSkip(record?.id)}>跳过</Link>
            )}
          </Space>
        );
      },
    },
  ];
};

const getConnectionColumns = (params: {
  taskType: TaskType;
  taskId: number;
  showLog: boolean;
  onReloadList: () => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onLogVisible: (recordId: number, visible: boolean, status: SubTaskStatus) => void;
  onExcecuteDetailVisible: (recordId: number, visible: boolean) => void;
  handleLogicalDatabaseTaskStop;
  handleLogicalDatabaseTaskSkip;
  handleLogicalDatabaseAsyncModalOpen;
}) => {
  const {
    taskType,
    taskId,
    showLog,
    onReloadList,
    onDetailVisible,
    onLogVisible,
    onExcecuteDetailVisible,
    handleLogicalDatabaseTaskStop,
    handleLogicalDatabaseTaskSkip,
    handleLogicalDatabaseAsyncModalOpen,
  } = params;
  if (isLogicalDbChangeTask(taskType)) {
    return getLogicalDatabaseAsyncColumns({
      handleLogicalDatabaseTaskStop,
      handleLogicalDatabaseTaskSkip,
      handleLogicalDatabaseAsyncModalOpen,
    });
  }
  const jobFilter = getJobFilter(taskType);
  const isSqlPlan = taskType === TaskType.SQL_PLAN;
  const statusFilters = getStatusFilters(!isSqlPlan);
  return [
    {
      dataIndex: 'id',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskExecuteRecord.TaskNumber',
        defaultMessage: '任务编号',
      }), //任务编号
      ellipsis: true,
      width: 80,
    },

    {
      dataIndex: 'jobGroup',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskExecuteRecord.TaskType',
        defaultMessage: '任务类型',
      }), //任务类型
      ellipsis: true,
      filterIcon: <FilterOutlined />,
      filters: jobFilter,
      onFilter: (value: string, record) => {
        return isSqlPlan ? value === SubTaskType.ASYNC : value === record.jobGroup;
      },
      render: (jobGroup) => {
        return TaskLabelMap[taskType][isSqlPlan ? SubTaskType.ASYNC : jobGroup];
      },
    },

    {
      dataIndex: 'createTime',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskExecuteRecord.CreationTime',
        defaultMessage: '创建时间',
      }), //创建时间
      ellipsis: true,
      width: 150,
      render: (createTime) => getFormatDateTime(createTime),
    },

    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskExecuteRecord.TaskStatus',
        defaultMessage: '任务状态',
      }), //任务状态
      ellipsis: true,
      width: 120,
      filters: statusFilters,
      filterIcon: <FilterOutlined />,
      onFilter: (value: string, record) => {
        return value === record.status;
      },
      render: (status, record) => {
        return (
          <StatusLabel
            type={isSqlPlan ? TaskType.ASYNC : record.jobGroup}
            status={status}
            isSubTask={!isSqlPlan}
            progress={Math.floor(record.progressPercentage)}
          />
        );
      },
    },

    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskExecuteRecord.Operation',
        defaultMessage: '操作',
      }), //操作
      ellipsis: true,
      width: 210,
      render: (_, record) => {
        return (
          <TaskTools
            taskId={taskId}
            record={record}
            showRollback={record?.jobGroup === SubTaskType.DATA_ARCHIVE}
            showLog={showLog}
            onReloadList={onReloadList}
            onDetailVisible={onDetailVisible}
            onLogVisible={onLogVisible}
            onExcecuteDetailVisible={onExcecuteDetailVisible}
          />
        );
      },
    },
  ];
};

interface IProps {
  task: any;
  subTasks: IResponseData<TaskRecord<IAsyncTaskParams>>;
  onReload: (args?: ITableLoadOptions) => void;
}

const TaskExecuteRecord: React.FC<IProps> = (props) => {
  const { task, subTasks: flowList, onReload } = props;
  const [subTasks, setSubTasks] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const [status, setStatus] = useState<SubTaskStatus>(null);
  const [excecuteDetailVisible, setExcecuteDetailVisible] = useState<boolean>(false);
  const tableRef = useRef();
  const taskId = task?.id;
  const showLog = [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE]?.includes(task?.type);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleDetailVisible = (
    task: TaskRecord<TaskRecordParameters>,
    visible: boolean = false,
  ) => {
    setDetailId(task?.id);
    setDetailVisible(visible);
  };
  /* 逻辑库变更是永远只有一个flow的调度任务, 逻辑库交互上少了flow列表这一层的话需要自己拿第一个结果的id查 */
  useEffect(() => {
    if (flowList?.contents?.length) {
      const taskId = task?.id;
      const flowId = flowList?.contents?.[0]?.id;
      getSubTasks(taskId, flowId);
    }
  }, [flowList]);

  const getSubTasks = async (taskId: number, jobId: number) => {
    const res = await getScheduleTaskDetail(taskId, jobId);
    setSubTasks(res?.executionDetails);
  };

  const handleLogVisible = (
    recordId: number,
    visible: boolean = false,
    status: SubTaskStatus = null,
  ) => {
    setLogVisible(visible);
    setDetailId(recordId);
    setStatus(status);
  };

  const handleCloseLog = () => {
    handleLogVisible(null);
  };

  const handleExcecuteDetailVisible = (recordId: number, visible: boolean = false) => {
    setExcecuteDetailVisible(visible);
    setDetailId(recordId);
  };
  const handleCloseExcecuteDetail = () => {
    handleExcecuteDetailVisible(null);
  };

  const handleLoad = async (args?: ITableLoadOptions) => {
    onReload(args);
  };

  const handleLogicalDatabaseAsyncModalOpen = (detailId: number) => {
    setModalOpen(true);
    setDetailId(detailId);
  };

  const handleLogicalDatabaseTaskStop = async (detailId: number) => {
    const res = await stopPhysicalSqlExecute(flowList?.contents?.[0]?.id, detailId);
    if (res) {
      message.success('正在尝试终止');
    } else {
      message.warning('正在尝试终止');
    }
    onReload?.();
  };

  const handleLogicalDatabaseTaskSkip = async (detailId: number) => {
    const res = await skipPhysicalSqlExecute(flowList?.contents?.[0]?.id, detailId);
    if (res) {
      message.success('当前任务状态不支持终止');
    } else {
      message.warning('当前任务状态不支持跳过');
    }
    onReload?.();
  };

  return (
    <>
      <CommonTable
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        titleContent={null}
        showToolbar={isLogicalDbChangeTask(task?.type)}
        enabledReload={isLogicalDbChangeTask(task?.type)}
        tableProps={{
          className: styles.subTaskTable,
          columns: getConnectionColumns({
            taskType: task?.type,
            taskId,
            showLog,
            onReloadList: onReload,
            onDetailVisible: handleDetailVisible,
            onLogVisible: handleLogVisible,
            onExcecuteDetailVisible: handleExcecuteDetailVisible,
            handleLogicalDatabaseTaskStop,
            handleLogicalDatabaseTaskSkip,
            handleLogicalDatabaseAsyncModalOpen,
          }),
          dataSource: isLogicalDbChangeTask(task?.type) ? subTasks : flowList?.contents,
          rowKey: 'id',
          scroll: {
            x: 650,
          },
          pagination: !isLogicalDbChangeTask(task?.type)
            ? {
                current: flowList?.page?.number,
                total: flowList?.page?.totalElements,
              }
            : null,
        }}
        onLoad={handleLoad}
        onChange={onReload}
      />

      <DetailModal
        type={TaskType.ASYNC}
        detailId={detailId}
        visible={detailVisible}
        onDetailVisible={handleDetailVisible}
        onReloadList={onReload}
      />

      <LogModal
        visible={logVisible}
        scheduleId={task?.id}
        recordId={detailId}
        onClose={handleCloseLog}
        status={status}
      />

      <ExcecuteDetailModal
        visible={excecuteDetailVisible}
        scheduleId={task?.id}
        recordId={detailId}
        onClose={handleCloseExcecuteDetail}
      />
      <TaskProgressModal
        physicalDatabaseId={detailId}
        scheduleTaskId={flowList?.contents?.[0]?.id}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      />
    </>
  );
};

export default TaskExecuteRecord;
