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

import { getTaskList } from '@/common/network/task';
import Action from '@/component/Action';
import DisplayTable from '@/component/DisplayTable';
import StatusLabel, { status } from '@/component/Task/component/Status';
import DetailModal from '@/component/Task/DetailModal';
import { TaskDetail, TaskRecord, TaskRecordParameters, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { FilterOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
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

  onOpenDetail: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
}) => {
  const { databaseFilters } = params;
  return [
    {
      dataIndex: 'id',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.TaskNumber',
      }), //任务编号
      ellipsis: true,
      width: 80,
    },

    {
      dataIndex: 'databaseName',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.Library',
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
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.CreationTime',
      }), //创建时间
      ellipsis: true,
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },

    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.TaskStatus',
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
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.Operation',
      }), //操作
      ellipsis: true,
      width: 92,
      render: (_, record) => {
        return (
          <Action.Link
            onClick={async () => {
              params?.onOpenDetail(record, true);
            }}
          >
            {
              formatMessage({
                id: 'odc.component.CommonTaskDetailModal.TaskRecord.View',
              }) /*查看*/
            }
          </Action.Link>
        );
      },
    },
  ];
};

interface IProps {
  task: TaskDetail<TaskRecordParameters>;
}

const SubTaskRecord: React.FC<IProps> = (props) => {
  const { task } = props;
  const [subTasks, setSubTasks] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const databaseFilters = getDatabaseFilters(subTasks);

  const loadData = async () => {
    const res = await getTaskList({
      createdByCurrentUser: false,
      approveByCurrentUser: false,
      parentInstanceId: task.id,
    });

    setSubTasks(
      res?.contents?.map((item) => ({
        ...item,
        databaseName: item?.database?.name,
      })) ?? [],
    );
  };

  const handleDetailVisible = (
    task: TaskRecord<TaskRecordParameters>,
    visible: boolean = false,
  ) => {
    setDetailId(task?.id);
    setDetailVisible(visible);
  };

  const reloadList = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={getConnectionColumns({
          onOpenDetail: handleDetailVisible,
          databaseFilters,
        })}
        dataSource={subTasks}
        disablePagination
        scroll={null}
      />

      <DetailModal
        type={TaskType.ASYNC}
        detailId={detailId}
        visible={detailVisible}
        onDetailVisible={handleDetailVisible}
        onReloadList={reloadList}
      />
    </>
  );
};

export default SubTaskRecord;
