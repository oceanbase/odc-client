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
  ITaskResult,
  TaskDetail,
  TaskRecord,
  TaskRecordParameters,
  IResponseData,
  Operation,
  TaskStatus,
  TaskType,
} from '@/d.ts';
import type { Dayjs } from 'dayjs';

export enum TaskPageMode {
  COMMON = 'COMMON',
  PROJECT = 'PROJECT',
  MULTI_PAGE = 'MULTI_PAGE',
}

export interface ITaskDetailModalProps {
  visible: boolean;
  taskTools: React.ReactNode;
  isLoading: boolean;
  detailType: TaskDetailType;
  detailId: number;
  task: TaskDetail<TaskRecordParameters>;
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
  /** 任务信息 */
  INFO = 'info',
  /** 任务流程 */
  FLOW = 'flow',
  /** 执行结果 */
  RESULT = 'result',
  /** 任务日志 */
  LOG = 'log',
  /** 回滚工单 */
  RECORD = 'record',
  /** 执行记录(无锁结构变更、多库变更) */
  PROGRESS = 'progress',
}

export interface IState {
  detailId: number;
  detailType: TaskType;
  detailVisible: boolean;
  status: TaskStatus;
  tasks: IResponseData<TaskRecord<TaskRecordParameters>>;
  taskDetailType?: TaskDetailType;
}

export enum TaskSearchType {
  ID = 'ID',
  DESCRIPTION = 'DESCRIPTION',
  CREATOR = 'CREATOR_NAME',
  DATABASE = 'DATABASE_NAME',
  DATASOURCE = 'DATASOURCE_NAME',
  CLUSTER = 'CLUSTER_NAME',
  TENANT = 'TENANT_NAME',
}

export enum TaskTab {
  all = ' all',
  executionByCurrentUser = 'executionByCurrentUser',
  approveByCurrentUser = 'approveByCurrentUser',
}

export interface ITaskParam {
  searchValue: string;
  searchType: TaskSearchType;
  taskTypes: string[];
  taskStatus: string[];
  projectId: string[];
  sort: string;
  timeRange: number | string;
  executeDate?: [Dayjs, Dayjs];
  tab?: TaskTab;
}

export interface IPagination {
  current: number;
  pageSize: number;
}
