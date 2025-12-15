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

import { TaskPageType, TaskStatus } from '@/d.ts';
import { SchedulePageType, ScheduleStatus } from '@/d.ts/schedule';

// 三方化常量

/** 允许终止的工单状态 */
export const taskStatusThatCanBeTerminate = [
  TaskStatus.CREATING,
  TaskStatus.APPROVING,
  TaskStatus.ENABLED,
  TaskStatus.PAUSE,
  TaskStatus.EXECUTING,
  TaskStatus.WAIT_FOR_EXECUTION,
  TaskStatus.CREATED,
];

/** 允许终止的工单类型 */
export const taskTypeThatCanBeTerminate = Object.keys(TaskPageType)?.filter(
  (item) =>
    ![TaskPageType.ALL, TaskPageType.STRUCTURE_COMPARISON, TaskPageType.MULTIPLE_ASYNC].includes(
      item as TaskPageType,
    ),
);

/** 允许导出的作业状态 */
export const scheduleStatusThatCanBeExport = Object.keys(ScheduleStatus);

/** 允许终止的作业类型 */
export const scheduleThatCanBeExport = [
  SchedulePageType.SQL_PLAN,
  SchedulePageType.DATA_ARCHIVE,
  SchedulePageType.DATA_DELETE,
  SchedulePageType.PARTITION_PLAN,
];

/** 允许终止的作业状态 */
export const SchedulestatusThatCanBeTerminate = [ScheduleStatus.PAUSE, ScheduleStatus.ENABLED];
