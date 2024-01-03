/*
 * Copyright 2024 OceanBase
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

import { getTaskDetail } from '@/common/network/task';
import Action from '@/component/Action';
import DisplayTable from '@/component/DisplayTable';
import StatusLabel, { status } from '@/component/Task/component/Status';
import { TaskOperationType, TaskRecord, TaskRecordParameters } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { FilterOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import FlowModal from './FlowModal';
import styles from './index.less';

const statusFilters = Object.keys(status).map((key) => {
  return {
    text: status?.[key].text,
    value: key,
  };
});

export const operationTypeMap = {
  [TaskOperationType.CREATE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.CreateATask',
  }), //创建任务
  [TaskOperationType.UPDATE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EditTask',
  }), //编辑任务
  [TaskOperationType.PAUSE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.DisableATask',
  }), //停用任务
  [TaskOperationType.TERMINATION]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.TerminateATask',
  }), //终止任务
  [TaskOperationType.RESUME]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EnableTasks',
  }), //启用任务
};

const getConnectionColumns = (params: {
  onOpenDetail: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
}) => {
  return [
    {
      dataIndex: 'id',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EventOperations',
      }), //事件操作
      ellipsis: true,
      width: 280,
      render: (id, _) => {
        return <span>{operationTypeMap?.[_.parameters?.operationType]}</span>;
      },
    },

    {
      dataIndex: 'createTime',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.OperationTime',
      }), //操作时间
      ellipsis: true,
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },

    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.ApprovalStatus',
      }), //审批状态
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
        id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.Operation',
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
                id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.ViewApprovalRecords',
              }) /*查看审批记录*/
            }
          </Action.Link>
        );
      },
    },
  ];
};

interface IProps {
  opRecord: TaskRecord<any>[];
  onReload: () => void;
}

const TaskOperationRecord: React.FC<IProps> = (props) => {
  const { opRecord, onReload } = props;
  const [detailId, setDetailId] = useState(null);
  const [subTask, setSubTask] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const { id, parameters } = subTask ?? {};

  const handleDetailVisible = (
    task: TaskRecord<TaskRecordParameters>,
    visible: boolean = false,
  ) => {
    setDetailId(task?.id);
    setDetailVisible(visible);
  };

  const loadData = async () => {
    const data = await getTaskDetail(detailId);
    setSubTask(data);
  };

  useEffect(() => {
    if (detailId) {
      loadData();
    }
  }, [detailId]);

  return (
    <>
      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={getConnectionColumns({
          onOpenDetail: handleDetailVisible,
        })}
        dataSource={opRecord}
        disablePagination
        scroll={null}
      />

      <FlowModal
        visible={detailVisible}
        id={id}
        operationType={parameters?.operationType}
        onClose={() => {
          handleDetailVisible(null);
          onReload();
        }}
      />
    </>
  );
};

export default TaskOperationRecord;
