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

import type { ILog } from '@/component/Task/component/Log';
import type {
  CommonTaskLogType,
  IAsyncTaskParams,
  IResponseData,
  ITaskResult,
  TaskDetail,
  TaskRecord,
  TaskRecordParameters,
} from '@/d.ts';
export interface ITaskDetailModalProps {
  visible: boolean;
  taskTools: React.ReactNode;
  isLoading: boolean;
  detailType: TaskDetailType;
  detailId: number;
  task: TaskDetail<TaskRecordParameters>;
  subTasks: IResponseData<TaskRecord<IAsyncTaskParams>>;
  opRecord: TaskRecord<any>[];
  hasFlow: boolean;
  result: ITaskResult;
  log: ILog;
  logType: CommonTaskLogType;
  onDetailTypeChange: (type: TaskDetailType) => void;
  onLogTypeChange: (type: CommonTaskLogType) => void;
  onClose: () => void;
  onReload: () => void;
}

export enum TaskDetailType {
  INFO = 'info',
  FLOW = 'flow',
  RESULT = 'result',
  LOG = 'log',
  RECORD = 'record',
  EXECUTE_RECORD = 'execute_record',
  OPERATION_RECORD = 'operation_record',
  PROGRESS = 'progress',
}
