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

import { getProjectWithErrorCatch } from '@/common/network/project';
import {
  getCycleTaskDetail,
  getCycleTaskLog,
  getDataArchiveSubTask,
  getTaskDetail,
  getTaskList,
  getOperationList,
  getTaskLog,
  getTaskResult,
  getDownloadUrl,
} from '@/common/network/task';
import type { ITableLoadOptions } from '@/component/CommonTable/interface';
import CommonDetailModal from '@/component/Task/component/CommonDetailModal';
import DataTransferTaskContent from '@/component/Task/component/DataTransferModal';
import type { ILog } from '@/component/Task/component/Log';
import type {
  CycleTaskDetail,
  IAsyncTaskParams,
  ICycleSubTaskRecord,
  IDataArchiveJobParameters,
  IDataClearJobParameters,
  IIPartitionPlanTaskDetail,
  IPartitionPlanParams,
  IResponseData,
  ITaskResult,
  TaskDetail,
  Operation,
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
import { ProjectRole } from '@/d.ts/project';
import userStore from '@/store/login';
import { isNumber } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { getItems as getDDLAlterItems } from './AlterDdlTask';
import { ApplyDatabasePermissionTaskContent } from './ApplyDatabasePermission';
import { ApplyPermissionTaskContent } from './ApplyPermission';
import { ApplyTablePermissionTaskContent } from './ApplyTablePermission';
import { AsyncTaskContent } from './AsyncTask';
import TaskTools from './component/ActionBar';
import ApprovalModal from './component/ApprovalModal';
import { DataArchiveTaskContent } from './DataArchiveTask';
import { DataClearTaskContent } from './DataClearTask';
import { getItems as getDataMockerItems } from './DataMockerTask';
import { isCycleTask, isLogicalDbChangeTask, isSupportChangeDetail } from './helper';
import { TaskDetailType } from './interface';
import { LogicDatabaseAsyncTaskContent } from './LogicDatabaseAsyncTask';
import { MutipleAsyncTaskContent } from './MutipleAsyncTask';
import { PartitionTaskContent } from './PartitionTask';
import { getItems as getResultSetExportTaskContentItems } from './ResultSetExportTask/DetailContent';
import { getItems as getShadowSyncItems } from './ShadowSyncTask';
import { SqlPlanTaskContent } from './SQLPlanTask';
import { StructureComparisonTaskContent } from './StructureComparisonTask';

interface IProps {
  taskOpenRef?: React.RefObject<boolean>;
  type: TaskType;
  detailId: number;
  visible: boolean;
  enabledAction?: boolean;
  theme?: string;
  onReloadList?: () => void;
  onDetailVisible: (task: TaskDetail<TaskRecordParameters>, visible: boolean) => void;
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
  const { type, visible, detailId, enabledAction = true, theme, taskOpenRef } = props;
  const [task, setTask] = useState<
    | TaskDetail<TaskRecordParameters>
    | CycleTaskDetail<IDataArchiveJobParameters | IDataClearJobParameters>
  >(null);
  const [subTasks, setSubTasks] = useState<IResponseData<ICycleSubTaskRecord>>(null);
  const [opRecord, setOpRecord] = useState<TaskRecord<any>[] | Operation[]>(null);
  const [detailType, setDetailType] = useState<TaskDetailType>(TaskDetailType.INFO);
  const [log, setLog] = useState<ILog>(null);
  const [result, setResult] = useState<ITaskResult>(null);
  const [logType, setLogType] = useState<CommonTaskLogType>(CommonTaskLogType.ALL);
  const [loading, setLoading] = useState(false);
  const [disabledSubmit, setDisabledSubmit] = useState(true);
  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>(undefined);
  const hasFlow =
    !!task?.nodeList?.find(
      (node) =>
        node.nodeType === TaskFlowNodeType.APPROVAL_TASK ||
        node.taskType === IFlowTaskType.PRE_CHECK,
    ) || isLogicalDbChangeTask(task?.type);

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
    TaskStatus.ENABLED,
    TaskStatus.PAUSE,
    TaskStatus.CANCELLED,
  ].includes(task?.status);
  const clockRef = useRef(null);
  let taskContent = null;
  let getItems = null;

  const getTask = async function () {
    const data = await getTaskDetail(detailId);
    setLoading(false);
    if (data) {
      setTask(data);
      setDisabledSubmit(false);
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

  const getLog = async function (args?: ITableLoadOptions) {
    if (isLogicalDbChangeTask(task?.type)) {
      let flowId = subTasks?.contents?.[0]?.id;
      if (!flowId) {
        const data = await loadDataArchiveSubTask(args);
        flowId = data?.contents?.[0]?.id;
      }
      if (flowId) {
        const res = await getCycleTaskLog(task?.id, flowId, logType);
        setLog({
          ...log,
          [logType]: res,
        });
        const url = await getDownloadUrl(task?.id, flowId);
        setDownloadUrl(url);
        return;
      }
      return;
    }
    if (hasLog && (isLoop || log?.[logType] === undefined)) {
      const data = await getTaskLog(detailId, logType);
      setLoading(false);
      setLog({
        ...log,
        [logType]: data,
      });
    }
  };

  const loadSubTask = async function (args) {
    const { filters, pagination, pageSize } = args ?? {};
    const { status } = filters ?? {};
    const { current = 1 } = pagination ?? {};
    const data = await getTaskList({
      createdByCurrentUser: false,
      approveByCurrentUser: false,
      parentInstanceId: task?.id,
      taskType: TaskType.ASYNC,
      status,
      page: current,
      size: pageSize,
    });
    setLoading(false);
    setSubTasks(data as any);
  };

  const loadDataArchiveSubTask = async function (args) {
    const { pagination, pageSize } = args ?? {};
    const { current = 1 } = pagination ?? {};
    let data;
    if (isLogicalDbChangeTask(task?.type)) {
      data = await getDataArchiveSubTask(task?.id);
    } else {
      data = await getDataArchiveSubTask(task?.id, { page: current, size: pageSize });
    }
    setLoading(false);
    setSubTasks(data);
    return data;
  };

  const getResult = async function () {
    const data = await getTaskResult(detailId);
    setLoading(false);
    setResult(data as ITaskResult);
  };

  const getExecuteRecord = async function (args?: ITableLoadOptions) {
    if (
      [
        TaskType.DATA_ARCHIVE,
        TaskType.DATA_DELETE,
        TaskType.ALTER_SCHEDULE,
        TaskType.LOGICAL_DATABASE_CHANGE,
      ].includes(task?.type)
    ) {
      loadDataArchiveSubTask(args);
    } else {
      loadSubTask(args);
    }
  };

  const getOperationRecord = async function () {
    let data;
    if (isSupportChangeDetail(task.type)) {
      data = await getOperationList(task?.id);
    } else {
      data = await getTaskList({
        createdByCurrentUser: false,
        approveByCurrentUser: false,
        parentInstanceId: task?.id,
        taskType: TaskType.ALTER_SCHEDULE,
      });
    }
    setLoading(false);
    setOpRecord(data?.contents);
  };

  const loadTaskData = async () => {
    clearTimeout(clockRef.current);
    try {
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
    } catch (err) {}
  };

  const loadCycleTaskData = async (args?: ITableLoadOptions) => {
    clearTimeout(clockRef.current);
    if (!task || isLoop) {
      getCycleTask();
    }
    switch (detailType) {
      case TaskDetailType.LOG: {
        if (isLogicalDbChangeTask(task?.type)) {
          getLog(args);
        } else {
          getLog();
        }
        break;
      }
      case TaskDetailType.EXECUTE_RECORD: {
        getExecuteRecord(args);
        break;
      }
      case TaskDetailType.OPERATION_RECORD: {
        getOperationRecord();
        break;
      }
      default: {
        break;
      }
    }
    if (isLoop) {
      clockRef.current = setTimeout(() => {
        loadCycleTaskData(args);
      }, 5000);
    }
  };

  const loadData = (args?: ITableLoadOptions) => {
    if (isCycleTask(type) || type === TaskType.ALTER_SCHEDULE) {
      loadCycleTaskData(args);
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
  }, [detailId, visible, detailType, logType, task?.status]);

  useEffect(() => {
    if (visible && detailId && !task) {
      setLoading(true);
    }
  }, [task, visible, detailId]);

  const handleDetailTypeChange = (type: TaskDetailType) => {
    setDetailType(type);
  };

  const handleLogTypeChange = (type: CommonTaskLogType) => {
    setLogType(type);
  };

  const onClose = () => {
    setSubTasks(null);
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
  switch (task?.type) {
    case TaskType.IMPORT:
    case TaskType.EXPORT: {
      taskContent = <DataTransferTaskContent task={task} result={result} hasFlow={hasFlow} />;
      break;
    }
    case TaskType.PARTITION_PLAN: {
      taskContent = (
        <PartitionTaskContent
          task={task as IIPartitionPlanTaskDetail<IPartitionPlanParams>}
          result={result}
          hasFlow={hasFlow}
        />
      );
      break;
    }
    case TaskType.ASYNC: {
      taskContent = (
        <AsyncTaskContent
          task={task as TaskDetail<IAsyncTaskParams>}
          result={result}
          hasFlow={hasFlow}
          theme={theme}
        />
      );
      break;
    }
    case TaskType.DATA_ARCHIVE: {
      taskContent = (
        <DataArchiveTaskContent
          task={task as CycleTaskDetail<IDataArchiveJobParameters>}
          hasFlow={hasFlow}
          onReload={handleReloadData}
        />
      );
      break;
    }
    case TaskType.DATA_DELETE: {
      taskContent = (
        <DataClearTaskContent
          task={task as CycleTaskDetail<IDataClearJobParameters>}
          hasFlow={hasFlow}
          onReload={handleReloadData}
        />
      );
      break;
    }
    case TaskType.SQL_PLAN: {
      taskContent = <SqlPlanTaskContent task={task as any} hasFlow={hasFlow} theme={theme} />;
      break;
    }
    case TaskType.APPLY_PROJECT_PERMISSION: {
      taskContent = <ApplyPermissionTaskContent task={task as any} />;
      break;
    }
    case TaskType.APPLY_DATABASE_PERMISSION: {
      taskContent = <ApplyDatabasePermissionTaskContent task={task as any} />;
      break;
    }
    case TaskType.APPLY_TABLE_PERMISSION: {
      taskContent = <ApplyTablePermissionTaskContent task={task as any} />;
      break;
    }
    case TaskType.STRUCTURE_COMPARISON: {
      taskContent = (
        <StructureComparisonTaskContent
          task={task as any}
          visible={visible}
          result={result}
          hasFlow={hasFlow}
          theme={theme}
        />
      );
      break;
    }
    case TaskType.MULTIPLE_ASYNC: {
      taskContent = <MutipleAsyncTaskContent task={task} result={result} hasFlow={hasFlow} />;
      break;
    }
    case TaskType.LOGICAL_DATABASE_CHANGE: {
      taskContent = (
        <LogicDatabaseAsyncTaskContent task={task as any} result={result} hasFlow={hasFlow} />
      );
      break;
    }
    default: {
      getItems = (...args) => taskContentMap[task?.type]?.getItems(...args, handleReloadData);
      break;
    }
  }

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
    taskTools: enabledAction ? (
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
    ) : null,
  };

  return (
    <>
      <CommonDetailModal
        {...modalProps}
        theme={theme}
        // @ts-ignore
        task={task}
        hasFlow={hasFlow}
        onClose={onClose}
        onDetailTypeChange={handleDetailTypeChange}
        onLogTypeChange={handleLogTypeChange}
        onReload={loadData}
        taskContent={taskContent}
        getItems={getItems}
        downloadUrl={downloadUrl}
      />
      <ApprovalModal
        id={
          isCycleTask(type) || type === TaskType.ALTER_SCHEDULE ? task?.approveInstanceId : detailId
        }
        visible={approvalVisible}
        approvalStatus={approvalStatus}
        onReload={handleReloadData}
        onCancel={() => {
          handleApprovalVisible(false);
        }}
      />
    </>
  );
});

export default DetailModal;
