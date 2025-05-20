import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import DisplayTable from '@/component/DisplayTable';
import { formatMessage } from '@/util/intl';
import { TaskTypeMap } from '@/component/Task/component/TaskTable/const';
import StatusLabel from '@/component/Task/component/Status';

interface TaskListProps {
  dataSource: any[];
}

const TaskList: React.FC<TaskListProps> = (props) => {
  const { dataSource } = props;

  const columns = [
    {
      dataIndex: 'id',
      key: 'id',
      title: formatMessage({
        id: 'odc.component.TaskTable.No',
        defaultMessage: '编号',
      }),
      width: 100,
    },
    {
      dataIndex: 'type',
      key: 'type',
      title: formatMessage({
        id: 'odc.component.TaskTable.Type',
        defaultMessage: '类型',
      }),
      //类型
      ellipsis: true,
      width: 140,
      render: (type, record) => {
        return TaskTypeMap[type];
      },
    },
    {
      dataIndex: 'status',
      key: 'status',
      title: formatMessage({
        id: 'odc.component.TaskTable.Status',
        defaultMessage: '状态',
      }),
      width: 120,
      render: (status, record) => (
        <StatusLabel
          status={status}
          type={record?.type}
          progress={Math.floor(record.progressPercentage)}
        />
      ),
    },
  ];

  return (
    <DisplayTable
      className={styles.TaskList}
      rowKey="id"
      dataSource={dataSource}
      columns={columns}
      disablePagination
      scroll={{ y: '240px' }}
    />
  );
};

export default TaskList;
