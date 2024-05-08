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
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import StatusLabel, { status, subTaskStatus } from '@/component/Task/component/Status';
import DetailModal from '@/component/Task/DetailModal';
import {
  IAsyncTaskParams,
  IResponseData,
  SubTaskType,
  TaskRecord,
  TaskRecordParameters,
  TaskType,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { FilterOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import styles from './index.less';
import LogModal from './LogModal';
import TaskTools from './TaskTools';

const TaskLabelMap = {
  [TaskType.DATA_ARCHIVE]: {
    [SubTaskType.DATA_ARCHIVE]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataArchiving',
    }), //数据归档
    [SubTaskType.DATA_ARCHIVE_ROLLBACK]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.Rollback',
    }), //回滚
    [SubTaskType.DATA_ARCHIVE_DELETE]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.SourceTableCleanup',
    }), //源表清理
  },
  [TaskType.DATA_DELETE]: {
    [SubTaskType.DATA_DELETE]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataCleansing',
    }), //数据清理
  },
  [TaskType.SQL_PLAN]: {
    [SubTaskType.ASYNC]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DatabaseChanges',
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

const getConnectionColumns = (params: {
  taskType: TaskType;
  taskId: number;
  showLog: boolean;
  onReloadList: () => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onLogVisible: (recordId: number, visible: boolean) => void;
}) => {
  const { taskType, taskId, showLog, onReloadList, onDetailVisible, onLogVisible } = params;
  const jobFilter = getJobFilter(taskType);
  const isSqlPlan = taskType === TaskType.SQL_PLAN;
  const statusFilters = getStatusFilters(!isSqlPlan);
  return [
    {
      dataIndex: 'id',
      title: formatMessage({ id: 'odc.component.CommonDetailModal.TaskExecuteRecord.TaskNumber' }), //任务编号
      ellipsis: true,
      width: 80,
    },

    {
      dataIndex: 'jobGroup',
      title: formatMessage({ id: 'odc.component.CommonDetailModal.TaskExecuteRecord.TaskType' }), //任务类型
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
      }), //创建时间
      ellipsis: true,
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },

    {
      dataIndex: 'status',
      title: formatMessage({ id: 'odc.component.CommonDetailModal.TaskExecuteRecord.TaskStatus' }), //任务状态
      ellipsis: true,
      width: 140,
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
      title: formatMessage({ id: 'odc.component.CommonDetailModal.TaskExecuteRecord.Operation' }), //操作
      ellipsis: true,
      width: 140,
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
  const { task, subTasks, onReload } = props;
  const [detailId, setDetailId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [logVisible, setLogVisible] = useState(false);
  const tableRef = useRef();
  const taskId = task?.id;
  const showLog = [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE]?.includes(task?.type);

  const handleDetailVisible = (
    task: TaskRecord<TaskRecordParameters>,
    visible: boolean = false,
  ) => {
    setDetailId(task?.id);
    setDetailVisible(visible);
  };

  const handleLogVisible = (recordId: number, visible: boolean = false) => {
    setLogVisible(visible);
    setDetailId(recordId);
  };

  const handleCloseLog = () => {
    handleLogVisible(null);
  };

  const handleLoad = async (args?: ITableLoadOptions) => {
    onReload(args);
  };

  return (
    <>
      <CommonTable
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        showToolbar={false}
        titleContent={null}
        tableProps={{
          className: styles.subTaskTable,
          columns: getConnectionColumns({
            taskType: task?.type,
            taskId,
            showLog,
            onReloadList: onReload,
            onDetailVisible: handleDetailVisible,
            onLogVisible: handleLogVisible,
          }),
          dataSource: subTasks?.contents,
          rowKey: 'id',
          pagination: {
            current: subTasks?.page?.number,
            total: subTasks?.page?.totalElements,
          },
          scroll: {
            x: 650,
          },
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
      />
    </>
  );
};

export default TaskExecuteRecord;
