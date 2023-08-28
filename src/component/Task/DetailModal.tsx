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

import {
  getCycleTaskDetail,
  getDataArchiveSubTask,
  getTaskDetail,
  getTaskList,
  getTaskLog,
  getTaskResult,
} from '@/common/network/task';
import CommonDetailModal from '@/component/Task/component/CommonDetailModal';
import DataTransferTaskContent from '@/component/Task/component/DataTransferModal';
import type { ILog } from '@/component/Task/component/Log';
import type {
  CycleTaskDetail,
  IAsyncTaskParams,
  IConnectionPartitionPlan,
  ICycleSubTaskRecord,
  IDataArchiveJobParameters,
  IDataClearJobParameters,
  IPartitionPlanParams,
  IPartitionPlanRecord,
  ITaskResult,
  TaskDetail,
  TaskRecord,
} from '@/d.ts';
import {
  CommonTaskLogType,
  IFlowTaskType,
  TaskFlowNodeType,
  TaskRecordParameters,
  TaskStatus,
  TaskType,
} from '@/d.ts';
import React, { useEffect, useRef, useState } from 'react';
import { getItems as getDDLAlterItems } from './AlterDdlTask';
import { AsyncTaskContent } from './AsyncTask';
import TaskTools from './component/ActionBar';
import ApprovalModal from './component/ApprovalModal';
import { DataArchiveTaskContent } from './DataArchiveTask';
import { DataClearTaskContent } from './DataClearTask';
import { getItems as getDataMockerItems } from './DataMockerTask';
import { isCycleTask } from './helper';
import { TaskDetailType } from './interface';
import { PartitionTaskContent } from './PartitionTask';
import { getItems as getResultSetExportTaskContentItems } from './ResultSetExportTask/DetailContent';
import { getItems as getShadowSyncItems } from './ShadowSyncTask';
import { SqlPlanTaskContent } from './SQLPlanTask';

interface IProps {
  type: TaskType;
  detailId: number;
  visible: boolean;
  partitionPlan?: IConnectionPartitionPlan;
  onReloadList: () => void;
  onDetailVisible: (task: TaskDetail<TaskRecordParameters>, visible: boolean) => void;
  onPartitionPlanChange?: (value: IConnectionPartitionPlan) => void;
}

const taskContentMap = {
  [TaskType.DATAMOCK]: {
    getItems: getDataMockerItems,
  },

  [TaskType.SHADOW]: {
    getItems: getShadowSyncItems,
  },

  [TaskType.ONLINE_SCHEMA_CHANGE]: {
    getItems: getDDLAlterItems,
  },

  [TaskType.EXPORT_RESULT_SET]: {
    getItems: getResultSetExportTaskContentItems,
  },
};

const DetailModal: React.FC<IProps> = React.memo((props) => {
  const { type, visible, detailId, partitionPlan } = props;
  const [task, setTask] = useState<
    TaskDetail<TaskRecordParameters> | CycleTaskDetail<IDataArchiveJobParameters>
  >(null);
  const [subTasks, setSubTasks] = useState<ICycleSubTaskRecord[]>(null);
  const [opRecord, setOpRecord] = useState<TaskRecord<any>[]>(null);
  const [detailType, setDetailType] = useState<TaskDetailType>(TaskDetailType.INFO);
  const [log, setLog] = useState<ILog>(null);
  const [result, setResult] = useState<ITaskResult>(null);
  const [logType, setLogType] = useState<CommonTaskLogType>(CommonTaskLogType.ALL);
  const [loading, setLoading] = useState(false);
  const [disabledSubmit, setDisabledSubmit] = useState(true);
  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(false);
  const hasFlow = !!task?.nodeList?.find(
    (node) =>
      node.nodeType === TaskFlowNodeType.APPROVAL_TASK || node.taskType === IFlowTaskType.PRE_CHECK,
  );
  const hasLog = true;
  const hasResult =
    ![TaskType.ALTER_SCHEDULE, TaskType.ONLINE_SCHEMA_CHANGE].includes(type) &&
    detailType !== TaskDetailType.FLOW;
  const isLoop = [
    TaskStatus.APPROVING,
    TaskStatus.WAIT_FOR_EXECUTION,
    TaskStatus.EXECUTING,
    TaskStatus.WAIT_FOR_CONFIRM,
    TaskStatus.CREATED,
    TaskStatus.APPROVED,
  ].includes(task?.status);
  const clockRef = useRef(null);
  let taskContent = null;
  let getItems = null;

  const handlePartitionPlansChange = (values: IPartitionPlanRecord[]) => {
    props.onPartitionPlanChange({
      ...partitionPlan,
      tablePartitionPlans: values,
    });
  };

  if ([TaskType.IMPORT, TaskType.EXPORT].includes(task?.type)) {
    taskContent = <DataTransferTaskContent task={task} result={result} hasFlow={hasFlow} />;
  } else if (task?.type === TaskType.PARTITION_PLAN) {
    taskContent = (
      <PartitionTaskContent
        task={task as TaskDetail<IPartitionPlanParams>}
        result={result}
        hasFlow={hasFlow}
        partitionPlans={partitionPlan?.tablePartitionPlans}
        onPartitionPlansChange={handlePartitionPlansChange}
      />
    );
  } else if (task?.type === TaskType.ASYNC) {
    taskContent = (
      <AsyncTaskContent
        task={task as TaskDetail<IAsyncTaskParams>}
        result={result}
        hasFlow={hasFlow}
      />
    );
  } else if (task?.type === TaskType.DATA_ARCHIVE) {
    taskContent = (
      <DataArchiveTaskContent
        task={task as CycleTaskDetail<IDataArchiveJobParameters>}
        hasFlow={hasFlow}
      />
    );
  } else if (task?.type === TaskType.DATA_DELETE) {
    taskContent = (
      <DataClearTaskContent
        task={task as CycleTaskDetail<IDataClearJobParameters>}
        hasFlow={hasFlow}
      />
    );
  } else if (task?.type === TaskType.SQL_PLAN) {
    taskContent = <SqlPlanTaskContent task={task as any} hasFlow={hasFlow} />;
  } else {
    getItems = taskContentMap[task?.type]?.getItems;
  }

  const getTask = async function () {
    const data = await getTaskDetail(detailId);
    setLoading(false);
    if (data) {
      setTask(data);
      if (data.type === TaskType.PARTITION_PLAN) {
        const connectionPartitionPlan = (data?.parameters as IPartitionPlanParams)
          ?.connectionPartitionPlan;
        props.onPartitionPlanChange({
          ...connectionPartitionPlan,
          tablePartitionPlans: connectionPartitionPlan.tablePartitionPlans?.map((item, index) => ({
            ...item,
            id: index,
          })),
        });
      } else {
        setDisabledSubmit(false);
      }
    }
  };

  const getCycleTask = async function () {
    const data = await getCycleTaskDetail(detailId);
    setLoading(false);
    if (data) {
      setTask(data as any);
      setDisabledSubmit(false);
    }
  };

  const getLog = async function () {
    if (hasLog && (isLoop || log?.[logType] === undefined)) {
      const data = await getTaskLog(detailId, logType);
      setLoading(false);
      setLog({
        ...log,
        [logType]: data,
      });
    }
  };

  const loadSubTask = async function () {
    const data = await getTaskList({
      createdByCurrentUser: false,
      approveByCurrentUser: false,
      parentInstanceId: task?.id,
      taskType: TaskType.ASYNC,
    });
    setLoading(false);
    setSubTasks(data?.contents as any[]);
  };

  const loadDataArchiveSubTask = async function () {
    const data = await getDataArchiveSubTask(task?.id);
    setLoading(false);
    setSubTasks(data?.contents as any[]);
  };

  const getResult = async function () {
    const data = await getTaskResult(detailId);
    setLoading(false);
    setResult(data as ITaskResult);
  };

  const getExecuteRecord = async function () {
    if (
      [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE, TaskType.ALTER_SCHEDULE].includes(task?.type)
    ) {
      loadDataArchiveSubTask();
    } else {
      loadSubTask();
    }
  };

  const getOperationRecord = async function () {
    const data = await getTaskList({
      createdByCurrentUser: false,
      approveByCurrentUser: false,
      parentInstanceId: task?.id,
      taskType: TaskType.ALTER_SCHEDULE,
    });
    setLoading(false);
    setOpRecord(data?.contents);
  };

  const loadTaskData = async () => {
    clearTimeout(clockRef.current);
    if (!task || isLoop) {
      getTask();
    }
    if (detailType === TaskDetailType.LOG) {
      getLog();
    } else if (hasResult) {
      getResult();
    }

    if (detailType === TaskDetailType.EXECUTE_RECORD) {
      getExecuteRecord();
    }
    if (isLoop) {
      clockRef.current = setTimeout(() => {
        loadTaskData();
      }, 5000);
    }
  };

  const loadCycleTaskData = async () => {
    clearTimeout(clockRef.current);
    if (!task || isLoop) {
      getCycleTask();
    }

    if (detailType === TaskDetailType.LOG) {
      getLog();
    }

    if (detailType === TaskDetailType.EXECUTE_RECORD) {
      getExecuteRecord();
    }

    if (detailType === TaskDetailType.OPERATION_RECORD) {
      getOperationRecord();
    }

    if (isLoop) {
      clockRef.current = setTimeout(() => {
        loadCycleTaskData();
      }, 5000);
    }
  };

  const loadData = () => {
    if (isCycleTask(type) || type === TaskType.ALTER_SCHEDULE) {
      loadCycleTaskData();
    } else {
      loadTaskData();
    }
  };

  const resetModal = () => {
    setDetailType(TaskDetailType.INFO);
    setTask(null);
    setLog(null);
    setResult(null);
    clearTimeout(clockRef.current);
  };

  useEffect(() => {
    if (visible && detailId) {
      loadData();
    } else {
      resetModal();
    }
    return () => {
      clearTimeout(clockRef.current);
    };
  }, [detailId, visible, detailType, logType]);

  useEffect(() => {
    if (visible && detailId && !task) {
      setLoading(true);
    }
  }, [task, visible, detailId]);

  useEffect(() => {
    if (partitionPlan) {
      const disabledSubmit = partitionPlan?.tablePartitionPlans?.some((item) => !item.detail);
      setDisabledSubmit(disabledSubmit);
    }
  }, [partitionPlan]);

  const handleDetailTypeChange = (type: TaskDetailType) => {
    setDetailType(type);
  };

  const handleLogTypeChange = (type: CommonTaskLogType) => {
    setLogType(type);
  };

  const onClose = () => {
    props.onDetailVisible(null, false);
  };

  const handleReloadData = () => {
    if (isCycleTask(type) || type === TaskType.ALTER_SCHEDULE) {
      getCycleTask();
      if (detailType === TaskDetailType.OPERATION_RECORD) {
        getOperationRecord();
      }
    } else {
      getTask();
    }
  };

  const handleApprovalVisible = (approvalStatus: boolean = false, visible: boolean = false) => {
    setApprovalVisible(visible);
    setApprovalStatus(approvalStatus);
  };

  const modalProps = {
    result,
    log,
    subTasks,
    opRecord,
    visible,
    detailId,
    detailType,
    logType,
    isLoading: loading,
    isSplit: ![TaskType.ASYNC, TaskType.EXPORT_RESULT_SET].includes(task?.type),
    taskTools: (
      <TaskTools
        isDetailModal
        disabledSubmit={disabledSubmit}
        task={task}
        result={result}
        onReloadList={props.onReloadList}
        onReload={handleReloadData}
        onApprovalVisible={handleApprovalVisible}
        onDetailVisible={props.onDetailVisible}
        onClose={onClose}
      />
    ),
  };

  return (
    <>
      <CommonDetailModal
        {...modalProps}
        // @ts-ignore
        task={task}
        hasFlow={hasFlow}
        onClose={onClose}
        onDetailTypeChange={handleDetailTypeChange}
        onLogTypeChange={handleLogTypeChange}
        onReload={loadData}
        taskContent={taskContent}
        getItems={getItems}
      />
      <ApprovalModal
        type={type}
        id={isCycleTask(type) ? task?.approveInstanceId : detailId}
        visible={approvalVisible}
        status={task?.status}
        approvalStatus={approvalStatus}
        partitionPlan={partitionPlan}
        onReload={handleReloadData}
        onCancel={() => {
          handleApprovalVisible(false);
        }}
      />
    </>
  );
});

export default DetailModal;
