import DisplayTable from '@/component/DisplayTable';
import ApprovalModal from '@/component/Task/component/ApprovalModal';
import StatusLabel, { subTaskStatus } from '@/component/Task/component/Status';
import DetailModal from '@/component/Task/DetailModal';
import { IAsyncTaskParams, SubTaskType, TaskRecord, TaskRecordParameters, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { FilterOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import styles from './index.less';
import TaskTools from './TaskTools';

const TaskLabelMap = {
  [TaskType.DATA_ARCHIVE]: {
    [SubTaskType.DATA_ARCHIVE]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataArchiving',
    }), //数据归档
    [SubTaskType.DATA_ARCHIVE_ROLLBACK]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.Rollback',
    }), //回滚
  },
  [TaskType.DATA_DELETE]: {
    [SubTaskType.DATA_DELETE]: formatMessage({
      id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataCleansing',
    }), //数据清理
  },
  [TaskType.SQL_PLAN]: {
    [SubTaskType.ASYNC]: '数据库变更',
  },
};

const statusFilters = Object.keys(subTaskStatus).map((key) => {
  return {
    text: subTaskStatus?.[key].text,
    value: key,
  };
});

const getJobFilter = (taskType: TaskType) => {
  return Object.keys(TaskLabelMap[taskType])?.map((key) => ({
    text: TaskLabelMap[taskType][key],
    value: key,
  }));
};

const getConnectionColumns = (params: {
  taskType: TaskType;
  taskId: number;
  onReloadList: () => void;
  onApprovalVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
}) => {
  const { taskType, taskId, onReloadList, onApprovalVisible, onDetailVisible } = params;
  const jobFilter = getJobFilter(taskType);
  const isSqlPlan = taskType === TaskType.SQL_PLAN;
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
      width: 200,
      filterIcon: <FilterOutlined />,
      filters: jobFilter,
      onFilter: (value: string, record) => {
        return value === record.jobGroup;
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
      width: 92,
      render: (_, record) => {
        return (
          <TaskTools
            taskId={taskId}
            record={record}
            showRollback={record?.jobGroup === SubTaskType.DATA_ARCHIVE}
            onReloadList={onReloadList}
            onApprovalVisible={onApprovalVisible}
            onDetailVisible={onDetailVisible}
          />
        );
      },
    },
  ];
};

interface IProps {
  task: any;
  subTasks: TaskRecord<IAsyncTaskParams>[];
  onReload: () => void;
}

const TaskExecuteRecord: React.FC<IProps> = (props) => {
  const { task, subTasks, onReload } = props;
  const [detailId, setDetailId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(false);
  const taskId = task?.id;

  const handleDetailVisible = (
    task: TaskRecord<TaskRecordParameters>,
    visible: boolean = false,
  ) => {
    setDetailId(task?.id);
    setDetailVisible(visible);
  };

  const handleApprovalVisible = (
    task: TaskRecord<TaskRecordParameters>,
    status: boolean,
    visible: boolean = false,
  ) => {
    setDetailId(task?.id);
    setApprovalVisible(visible);
    setApprovalStatus(status);
  };

  return (
    <>
      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={getConnectionColumns({
          taskType: task?.type,
          taskId,
          onReloadList: onReload,
          onApprovalVisible: handleApprovalVisible,
          onDetailVisible: handleDetailVisible,
        })}
        dataSource={subTasks}
        disablePagination
        scroll={null}
      />

      <DetailModal
        type={TaskType.ASYNC}
        detailId={detailId}
        visible={detailVisible}
        onApprovalVisible={handleApprovalVisible}
        onDetailVisible={handleDetailVisible}
        onReloadList={onReload}
      />

      <ApprovalModal
        type={TaskType.ASYNC}
        id={detailId}
        visible={approvalVisible}
        approvalStatus={approvalStatus}
        onCancel={() => {
          setApprovalVisible(false);
        }}
      />
    </>
  );
};

export default TaskExecuteRecord;
