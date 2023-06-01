import DisplayTable from '@/component/DisplayTable';
import TaskTools from '@/component/Task/component/ActionBar';
import ApprovalModal from '@/component/Task/component/ApprovalModal';
import StatusLabel, { status } from '@/component/Task/component/Status';
import DetailModal from '@/component/Task/DetailModal';
import { IAsyncTaskParams, TaskRecord, TaskRecordParameters, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { FilterOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import styles from './index.less';

const statusFilters = Object.keys(status).map((key) => {
  return {
    text: status?.[key].text,
    value: key,
  };
});

function getDatabaseFilters(databases: { databaseName: string }[]) {
  const databaseFilters: {
    text: string;
    value: string;
  }[] = [];

  databases?.forEach((item) => {
    const isInclude = databaseFilters.some((filter) => filter.value === item.databaseName);
    if (!isInclude) {
      databaseFilters.push({
        text: item.databaseName,
        value: item.databaseName,
      });
    }
  });
  return databaseFilters;
}

const getConnectionColumns = (params: {
  databaseFilters: {
    text: string;
    value: string;
  }[];

  onReloadList: () => void;
  onApprovalVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
}) => {
  const { databaseFilters, onReloadList, onApprovalVisible, onDetailVisible } = params;
  return [
    {
      dataIndex: 'id',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskExecuteRecord.TaskNumber',
      }), //任务编号
      ellipsis: true,
      width: 80,
    },

    {
      dataIndex: 'databaseName',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskExecuteRecord.Library',
      }), //所属库
      ellipsis: true,
      width: 200,
      filterIcon: <FilterOutlined />,
      filters: databaseFilters,
      onFilter: (value: string, record) => {
        return value === record.databaseName;
      },
    },

    {
      dataIndex: 'createTime',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskExecuteRecord.CreationTime',
      }), //创建时间
      ellipsis: true,
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },

    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskExecuteRecord.TaskStatus',
      }), //任务状态
      ellipsis: true,
      width: 140,
      filters: statusFilters,
      filterIcon: <FilterOutlined />,
      onFilter: (value: string, record) => {
        return value === record.status;
      },
      render: (status, record) => {
        return <StatusLabel status={status} progress={Math.floor(record.progressPercentage)} />;
      },
    },

    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskExecuteRecord.Operation',
      }), //操作
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
  subTasks: TaskRecord<IAsyncTaskParams>[];
  onReload: () => void;
}

const TaskExecuteRecord: React.FC<IProps> = (props) => {
  const { subTasks, onReload } = props;
  const [detailId, setDetailId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(false);
  const databaseFilters = getDatabaseFilters(subTasks);

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
          databaseFilters,
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
