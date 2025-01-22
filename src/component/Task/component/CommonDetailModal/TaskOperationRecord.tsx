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
import { TaskOperationType, TaskRecord, TaskRecordParameters, Operation, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { FilterOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import FlowModal from './FlowModal';
import ChangeDetail from './ChangeDetail';
import { isSupportChangeDetail } from '@/component/Task/helper';
import StatusItem from './status';
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
    defaultMessage: '创建任务',
  }), //创建任务
  [TaskOperationType.UPDATE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EditTask',
    defaultMessage: '编辑任务',
  }), //编辑任务
  [TaskOperationType.PAUSE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.DisableATask',
    defaultMessage: '停用任务',
  }), //停用任务
  [TaskOperationType.TERMINATE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.TerminateATask',
    defaultMessage: '终止任务',
  }), //终止任务
  [TaskOperationType.RESUME]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EnableTasks',
    defaultMessage: '启用任务',
  }), //启用任务
};

const getConnectionColumns = (params: {
  onOpenDetail: (task: TaskRecord<TaskRecordParameters> | Operation, visible: boolean) => void;
  onOpenChangeDetail: (task: Operation, visible: boolean) => void;
  taskType: TaskType;
}) => {
  return [
    {
      dataIndex: 'id',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EventOperations',
        defaultMessage: '事件操作',
      }), //事件操作
      ellipsis: true,
      width: 140,
      render: (id, record) => {
        if (isSupportChangeDetail(params.taskType)) {
          return <span>{operationTypeMap?.[record.type]}</span>;
        }
        return <span>{operationTypeMap?.[record.parameters?.operationType]}</span>;
      },
    },

    {
      dataIndex: 'createTime',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.OperationTime',
        defaultMessage: '操作时间',
      }), //操作时间
      ellipsis: true,
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },

    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.ApprovalStatus',
        defaultMessage: '审批状态',
      }), //审批状态
      ellipsis: true,
      width: 140,
      filters: statusFilters,
      filterIcon: <FilterOutlined />,
      onFilter: (value: string, record) => {
        return value === record.status;
      },
      render: (status, record) => {
        if (isSupportChangeDetail(params.taskType)) {
          return <StatusItem status={status} />;
        }
        return <StatusLabel status={status} progress={Math.floor(record.progressPercentage)} />;
      },
    },

    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.Operation',
        defaultMessage: '操作',
      }), //操作
      ellipsis: true,
      width: 92,
      render: (_, record) => {
        return (
          <>
            <Action.Link
              onClick={async () => {
                params?.onOpenDetail(record, true);
              }}
            >
              {formatMessage({
                id: 'src.component.Task.component.CommonDetailModal.3D4F5474',
                defaultMessage: '审批记录',
              })}
            </Action.Link>
            {isSupportChangeDetail(params.taskType) && (
              <Action.Link
                onClick={async () => {
                  params?.onOpenChangeDetail(record, true);
                }}
              >
                {formatMessage({
                  id: 'src.component.Task.component.CommonDetailModal.5C706BA6',
                  defaultMessage: '变更详情',
                })}
              </Action.Link>
            )}
          </>
        );
      },
    },
  ];
};

interface IProps {
  opRecord: Operation[] | TaskRecord<any>[];
  onReload: () => void;
  taskType: TaskType;
}

const TaskOperationRecord: React.FC<IProps> = (props) => {
  const { opRecord, onReload, taskType } = props;
  const [detailId, setDetailId] = useState(null);
  const [subTask, setSubTask] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [changeDetailVisible, setChangeDetailVisible] = useState(false);
  const [task, setTask] = useState<Operation>();
  const { id, parameters } = subTask ?? {};

  const handleDetailVisible = (
    task: Operation | TaskRecord<TaskRecordParameters>,
    visible: boolean = false,
  ) => {
    if (isSupportChangeDetail(taskType)) {
      setDetailId((task as Operation)?.flowInstanceId);
    } else {
      setDetailId(task?.id);
    }
    setDetailVisible(visible);
  };

  const handleChangeDetailVisible = (task: Operation, visible: boolean = false) => {
    setTask(task);
    setChangeDetailVisible(visible);
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
          onOpenChangeDetail: handleChangeDetailVisible,
          taskType: taskType,
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

      <ChangeDetail
        visible={changeDetailVisible}
        scheduleId={task?.scheduleId}
        scheduleChangeLogId={task?.id}
        onClose={() => setChangeDetailVisible(null)}
      />
    </>
  );
};

export default TaskOperationRecord;
