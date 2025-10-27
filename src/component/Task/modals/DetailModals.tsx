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
import { getTaskDetail, getTaskLog, getTaskResult } from '@/common/network/task';
import type { ITableLoadOptions } from '@/component/CommonTable/interface';
import TaskDetailModal from '@/component/Task/component/TaskDetailModal';
import DataTransferTaskContent from '@/component/Task/component/DataTransferModal';
import type { ILog } from '@/component/Task/component/Log';
import type {
  IAsyncTaskParams,
  ILogicalDatabaseAsyncTaskParams,
  ITaskResult,
  TaskDetail,
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
import { ApplyDatabasePermissionTaskContent } from './ApplyDatabasePermission';
import { ApplyPermissionTaskContent } from './ApplyPermission';
import { ApplyTablePermissionTaskContent } from './ApplyTablePermission';
import { AsyncTaskContent } from './AsyncTask';
import { getItems as getDataMockerItems } from './DataMockerTask';
import { LogicDatabaseAsyncTaskContent } from './LogicDatabaseAsyncTask';
import { MutipleAsyncTaskContent } from './MutipleAsyncTask';
import { getItems as getResultSetExportTaskContentItems } from './ResultSetExportTask/DetailContent';
import { getItems as getShadowSyncItems } from './ShadowSyncTask';
import { StructureComparisonTaskContent } from './StructureComparisonTask';
import { TaskDetailType } from '../interface';
import TaskActions from '../component/TaskActions';

interface IProps {
  taskOpenRef?: React.RefObject<boolean>;
  type: TaskType;
  detailId: number;
  visible: boolean;
  enabledAction?: boolean;
  theme?: string;
  onReloadList?: () => void;
  taskDetailType?: TaskDetailType;
  onDetailVisible: (task: TaskDetail<TaskRecordParameters>, visible: boolean) => void;
  onApprovalVisible?: (status: boolean, id: number) => void;
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
  const {
    type,
    visible,
    detailId,
    enabledAction = true,
    theme,
    onApprovalVisible,
    taskDetailType = TaskDetailType.INFO,
  } = props;
  const [task, setTask] = useState<TaskDetail<TaskRecordParameters>>(null);
  const [detailType, setDetailType] = useState<TaskDetailType>(TaskDetailType.INFO);
  const [log, setLog] = useState<ILog>(null);
  const [result, setResult] = useState<ITaskResult>(null);
  const [logType, setLogType] = useState<CommonTaskLogType>(CommonTaskLogType.ALL);
  const [loading, setLoading] = useState(false);
  const [disabledSubmit, setDisabledSubmit] = useState(true);
  const hasFlow = !!task?.nodeList?.find(
    (node) =>
      node.nodeType === TaskFlowNodeType.APPROVAL_TASK || node.taskType === IFlowTaskType.PRE_CHECK,
  );

  const taskRef = useRef<TaskDetail<TaskRecordParameters>>(task);
  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  const hasLog = true;
  const hasResult =
    ![
      TaskType.ALTER_SCHEDULE,
      TaskType.ONLINE_SCHEMA_CHANGE,
      TaskType.LOGICAL_DATABASE_CHANGE,
      TaskType.MULTIPLE_ASYNC,
    ].includes(type) && detailType !== TaskDetailType.FLOW;
  const shouldLoop = (task?: TaskDetail<TaskRecordParameters>) => {
    return [
      TaskStatus.PRE_CHECK_EXECUTING,
      TaskStatus.WAIT_FOR_SCHEDULE_EXECUTION,
      TaskStatus.WAIT_FOR_EXECUTION_EXPIRED,
      TaskStatus.APPROVING,
      TaskStatus.WAIT_FOR_EXECUTION,
      TaskStatus.EXECUTING,
      TaskStatus.CREATED,
      TaskStatus.APPROVED,
      TaskStatus.ENABLED,
      TaskStatus.PAUSE,
      TaskStatus.CANCELLED,
    ].includes(task?.status);
  };
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

  const getLog = async function (args?: ITableLoadOptions) {
    if (hasLog && (shouldLoop(taskRef?.current) || log?.[logType] === undefined)) {
      const data = await getTaskLog(detailId, logType);
      setLoading(false);
      setLog({
        ...log,
        [logType]: data,
      });
    }
  };

  const getResult = async function () {
    const data = await getTaskResult(detailId);
    setLoading(false);
    setResult(data as ITaskResult);
  };

  const loadData = async () => {
    clearTimeout(clockRef.current);
    const shouldRequest = !taskRef?.current || shouldLoop(taskRef?.current);
    try {
      if (shouldRequest) {
        getTask();
      }
      if (detailType === TaskDetailType.LOG) {
        getLog();
      } else if (hasResult && shouldRequest) {
        getResult();
      }

      if (shouldRequest) {
        clockRef.current = setTimeout(() => {
          loadData();
        }, 5000);
      }
    } catch (err) {}
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
    getTask();
  };

  switch (task?.type) {
    case TaskType.IMPORT:
    case TaskType.EXPORT: {
      taskContent = <DataTransferTaskContent task={task} result={result} hasFlow={hasFlow} />;
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
    case TaskType.APPLY_PROJECT_PERMISSION: {
      taskContent = <ApplyPermissionTaskContent task={task as any} />;
      break;
    }
    case TaskType.APPLY_DATABASE_PERMISSION: {
      taskContent = <ApplyDatabasePermissionTaskContent task={task as any} hasFlow={hasFlow} />;
      break;
    }
    case TaskType.APPLY_TABLE_PERMISSION: {
      taskContent = <ApplyTablePermissionTaskContent task={task as any} hasFlow={hasFlow} />;
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
        <LogicDatabaseAsyncTaskContent
          task={task as TaskDetail<ILogicalDatabaseAsyncTaskParams>}
          result={result}
          hasFlow={hasFlow}
        />
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
    visible,
    detailId,
    detailType,
    logType,
    isLoading: loading,
    isSplit: ![TaskType.ASYNC, TaskType.EXPORT_RESULT_SET].includes(task?.type),
    taskTools: enabledAction ? (
      <TaskActions
        isDetailModal
        disabledSubmit={disabledSubmit}
        task={task}
        result={result}
        onReloadList={props.onReloadList}
        onReload={handleReloadData}
        onApprovalVisible={onApprovalVisible}
        onDetailVisible={props.onDetailVisible}
        onClose={onClose}
      />
    ) : null,
  };

  useEffect(() => {
    setDetailType(taskDetailType);
  }, [taskDetailType]);

  return (
    <TaskDetailModal
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
    />
  );
});

export default DetailModal;
