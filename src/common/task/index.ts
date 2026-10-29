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

import { formatMessage } from '@/util/intl';
import { TaskPageType, TaskType } from '@/d.ts';
import { TaskActionsEnum, TaskGroup } from '@/d.ts/task';
import { isClient } from '@/util/env';
import login from '@/store/login';
import { TaskPageTextMap } from '@/constant/task';
import settingStore from '@/store/setting';

export interface ITaskConfig {
  pageType: TaskPageType;
  label: string;
  groupBy: TaskGroup;
  enabled: () => boolean;
  allowActions?: TaskActionsEnum[];
}
export type PartialTaskConfig = { [K in TaskType]?: ITaskConfig };

export const allTaskPageConfig: Omit<ITaskConfig, 'allowActions'> = {
  pageType: TaskPageType.ALL,
  label: TaskPageTextMap[TaskPageType.ALL],
  groupBy: TaskGroup.Other,
  enabled: () => {
    return !isClient();
  },
};

export const TaskConfig: PartialTaskConfig = {
  [TaskType.EXPORT]: {
    pageType: TaskPageType.EXPORT,
    label: TaskPageTextMap[TaskPageType.EXPORT],
    groupBy: TaskGroup.DataExport,
    enabled: () => {
      return settingStore?.enableDBExport;
    },
    // allowActions: [
    //   TaskActionsEnum.ROLLBACK,
    //   TaskActionsEnum.STOP,
    //   TaskActionsEnum.EXECUTE,
    //   TaskActionsEnum.PASS,
    //   TaskActionsEnum.REJECT,
    //   TaskActionsEnum.AGAIN,
    //   TaskActionsEnum.DOWNLOAD,
    //   TaskActionsEnum.DOWNLOAD_SQL,
    //   TaskActionsEnum.STRUCTURE_COMPARISON,
    //   TaskActionsEnum.OPEN_LOCAL_FOLDER,
    //   TaskActionsEnum.DOWNLOAD_VIEW_RESULT,
    //   TaskActionsEnum.VIEW_RESULT,
    //   TaskActionsEnum.CLONE,
    //   TaskActionsEnum.VIEW,
    //   TaskActionsEnum.SHARE,
    // ],
  },
  [TaskType.EXPORT_RESULT_SET]: {
    pageType: TaskPageType.EXPORT_RESULT_SET,
    label: TaskPageTextMap[TaskPageType.EXPORT_RESULT_SET],
    groupBy: TaskGroup.DataExport,
    enabled: () => {
      return settingStore?.enableDBExport;
    },
  },
  [TaskType.IMPORT]: {
    pageType: TaskPageType.IMPORT,
    label: TaskPageTextMap[TaskPageType.IMPORT],
    groupBy: TaskGroup.DataChanges,
    enabled: () => {
      return settingStore?.enableDBImport;
    },
  },
  [TaskType.DATAMOCK]: {
    pageType: TaskPageType.DATAMOCK,
    label: TaskPageTextMap[TaskPageType.DATAMOCK],
    groupBy: TaskGroup.DataChanges,
    enabled: () => {
      return settingStore?.enableMockdata;
    },
  },
  [TaskType.ASYNC]: {
    pageType: TaskPageType.ASYNC,
    label: TaskPageTextMap[TaskPageType.ASYNC],
    groupBy: TaskGroup.DataChanges,
    enabled: () => {
      return settingStore?.enableAsyncTask;
    },
  },
  [TaskType.MULTIPLE_ASYNC]: {
    pageType: TaskPageType.MULTIPLE_ASYNC,
    label: TaskPageTextMap[TaskPageType.MULTIPLE_ASYNC],
    groupBy: TaskGroup.DataChanges,
    enabled: () => {
      return settingStore?.enableMultipleAsyncTask;
    },
  },
  [TaskType.LOGICAL_DATABASE_CHANGE]: {
    pageType: TaskPageType.LOGICAL_DATABASE_CHANGE,
    label: TaskPageTextMap[TaskPageType.LOGICAL_DATABASE_CHANGE],
    groupBy: TaskGroup.DataChanges,
    enabled: () => {
      return !login?.isPrivateSpace?.() && settingStore?.enableLogicaldatabase;
    },
  },
  [TaskType.SHADOW]: {
    pageType: TaskPageType.SHADOW,
    label: TaskPageTextMap[TaskPageType.SHADOW],
    groupBy: TaskGroup.DataChanges,
    enabled: () => {
      return settingStore?.enableShadowTableSync;
    },
  },
  [TaskType.STRUCTURE_COMPARISON]: {
    pageType: TaskPageType.STRUCTURE_COMPARISON,
    label: TaskPageTextMap[TaskPageType.STRUCTURE_COMPARISON],
    groupBy: TaskGroup.DataChanges,
    enabled: () => {
      return settingStore?.enableStructureCompare;
    },
  },
  [TaskType.ONLINE_SCHEMA_CHANGE]: {
    pageType: TaskPageType.ONLINE_SCHEMA_CHANGE,
    label: TaskPageTextMap[TaskPageType.ONLINE_SCHEMA_CHANGE],
    groupBy: TaskGroup.DataChanges,
    enabled: () => {
      return settingStore?.enableOSC;
    },
  },
  [TaskType.APPLY_PROJECT_PERMISSION]: {
    pageType: TaskPageType.APPLY_PROJECT_PERMISSION,
    label: TaskPageTextMap[TaskPageType.APPLY_PROJECT_PERMISSION],
    groupBy: TaskGroup.AccessRequest,
    enabled: () => {
      return settingStore?.enableApplyDBAuth;
    },
  },
  [TaskType.APPLY_DATABASE_PERMISSION]: {
    pageType: TaskPageType.APPLY_DATABASE_PERMISSION,
    label: TaskPageTextMap[TaskPageType.APPLY_DATABASE_PERMISSION],
    groupBy: TaskGroup.AccessRequest,
    enabled: () => {
      return settingStore?.enableApplyProjectAuth;
    },
  },
  [TaskType.APPLY_TABLE_PERMISSION]: {
    pageType: TaskPageType.APPLY_TABLE_PERMISSION,
    label: TaskPageTextMap[TaskPageType.APPLY_TABLE_PERMISSION],
    groupBy: TaskGroup.AccessRequest,
    enabled: () => {
      return settingStore?.enableApplyTableAuth;
    },
  },
};
