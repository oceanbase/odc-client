import DisplayTable from '@/component/DisplayTable';
import ApprovalModal from '@/component/Task/component/ApprovalModal';
import StatusLabel, { subTaskStatus } from '@/component/Task/component/Status';
import DetailModal from '@/component/Task/DetailModal';
import { IAsyncTaskParams, TaskRecord, TaskRecordParameters, TaskType } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import { FilterOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import styles from './index.less';
import TaskTools from './TaskTools';

const TaskLabelMap = {
  [TaskType.DATA_ARCHIVE]: '数据归档',
};

const statusFilters = Object.keys(subTaskStatus).map((key) => {
  return {
    text: subTaskStatus?.[key].text,
    value: key,
  };
});

const getConnectionColumns = (params: {
  onReloadList: () => void;
  onApprovalVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
}) => {
  const { onReloadList, onApprovalVisible, onDetailVisible } = params;
  return [
    {
      dataIndex: 'id',
      title: '任务编号',
      ellipsis: true,
      width: 80,
    },

    {
      dataIndex: 'jobGroup',
      title: '任务类型',
      ellipsis: true,
      width: 200,
      filterIcon: <FilterOutlined />,
      filters: [
        {
          text: '数据归档',
          value: TaskType.DATA_ARCHIVE,
        },
      ],
      onFilter: (value: string, record) => {
        return value === record.jobGroup;
      },
      render: (jobGroup) => TaskLabelMap[jobGroup],
    },

    {
      dataIndex: 'createTime',
      title: '创建时间',
      ellipsis: true,
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },

    {
      dataIndex: 'status',
      title: '任务状态',
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
            type={record.jobGroup}
            status={status}
            isSubTask
            progress={Math.floor(record.progressPercentage)}
          />
        );
      },
    },

    {
      dataIndex: 'action',
      title: '操作',
      ellipsis: true,
      width: 92,
      render: (_, record) => {
        return (
          <TaskTools
            task={record}
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
  const { subTasks, onReload } = props;
  const [detailId, setDetailId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(false);

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
