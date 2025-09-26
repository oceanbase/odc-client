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
  SyncTableStructureEnum,
  TaskErrorStrategy,
  TaskExecStrategy,
  TaskPartitionStrategy,
  TaskStatus,
  TaskType,
} from '@/d.ts';
import { TaskActionsEnum } from '@/d.ts/task';
import { formatMessage } from '@/util/intl';

export const ErrorStrategyMap = {
  [TaskErrorStrategy.ABORT]: formatMessage({
    id: 'src.component.Task.F0079010',
    defaultMessage: '停止任务',
  }), //'停止任务'
  [TaskErrorStrategy.CONTINUE]: formatMessage({
    id: 'src.component.Task.2DA054B9',
    defaultMessage: '忽略错误继续任务',
  }), //'忽略错误继续任务'
};

export const TaskPartitionStrategyMap = {
  [TaskPartitionStrategy.CREATE]: formatMessage({
    id: 'src.component.Task.CD347F96',
    defaultMessage: '创建策略',
  }), //'创建策略'
  [TaskPartitionStrategy.DROP]: formatMessage({
    id: 'src.component.Task.9262EB40',
    defaultMessage: '删除策略',
  }), //'删除策略'
};

export const SyncTableStructureConfig = {
  [SyncTableStructureEnum.COLUMN]: {
    label: formatMessage({ id: 'src.d.ts.6CBA506D', defaultMessage: '表结构' }),
  },
  [SyncTableStructureEnum.CONSTRAINT]: {
    label: formatMessage({ id: 'src.d.ts.90979FA9', defaultMessage: '唯一性约束' }),
  },
  [SyncTableStructureEnum.INDEX]: {
    label: formatMessage({ id: 'src.d.ts.071AA07B', defaultMessage: '索引' }),
  },
  [SyncTableStructureEnum.PARTITION]: {
    label: formatMessage({ id: 'src.d.ts.40DBAF05', defaultMessage: '分区' }),
  },
};
export const SyncTableStructureOptions = [
  {
    value: SyncTableStructureEnum.COLUMN,
    label: SyncTableStructureConfig[SyncTableStructureEnum.COLUMN].label,
    disabled: true,
  },
  {
    value: SyncTableStructureEnum.CONSTRAINT,
    label: SyncTableStructureConfig[SyncTableStructureEnum.CONSTRAINT].label,
    disabled: true,
  },
  {
    value: SyncTableStructureEnum.PARTITION,
    label: SyncTableStructureConfig[SyncTableStructureEnum.PARTITION].label,
  },
  {
    value: SyncTableStructureEnum.INDEX,
    label: SyncTableStructureConfig[SyncTableStructureEnum.INDEX].label,
  },
];

export const OscMinRowLimit = 1;
export const OscMaxRowLimit = 10000;
export const OscMaxDataSizeLimit = 1000;

export const getTaskExecStrategyMap = (type: TaskType) => {
  switch (type) {
    // case TaskType.STRUCTURE_COMPARISON:
    // case TaskType.MULTIPLE_ASYNC: {
    //   return {
    //     [TaskExecStrategy.AUTO]: formatMessage({
    //       id: 'src.component.Task.9B79BD20',
    //       defaultMessage: '自动执行',
    //     }), //'自动执行'
    //     [TaskExecStrategy.MANUAL]: formatMessage({
    //       id: 'src.component.Task.0B2B1D60',
    //       defaultMessage: '手动执行',
    //     }), //'手动执行'
    //     [TaskExecStrategy.TIMER]: formatMessage({
    //       id: 'odc.components.TaskManagePage.ScheduledExecution',
    //       defaultMessage: '定时执行',
    //     }), //定时执行
    //   };
    // }
    default:
      return {
        [TaskExecStrategy.AUTO]: formatMessage({
          id: 'odc.components.TaskManagePage.ExecuteNow',
          defaultMessage: '立即执行',
        }),
        //立即执行
        [TaskExecStrategy.MANUAL]: formatMessage({
          id: 'odc.components.TaskManagePage.ManualExecution',
          defaultMessage: '手动执行',
        }),
        //手动执行
        [TaskExecStrategy.TIMER]: formatMessage({
          id: 'odc.components.TaskManagePage.ScheduledExecution',
          defaultMessage: '定时执行',
        }), //定时执行
      };
  }
};
export const getTaskExecStrategyTextMap = {
  [TaskExecStrategy.TIMER]: formatMessage({
    id: 'odc.src.component.Task.CycleExecution',
    defaultMessage: '周期执行',
  }), //'周期执行'
  [TaskExecStrategy.CRON]: formatMessage({
    id: 'odc.src.component.Task.CycleExecution.1',
    defaultMessage: '周期执行',
  }), //'周期执行'
  [TaskExecStrategy.DAY]: formatMessage({
    id: 'odc.src.component.Task.CycleExecution.2',
    defaultMessage: '周期执行',
  }), //'周期执行'
  [TaskExecStrategy.MONTH]: formatMessage({
    id: 'odc.src.component.Task.CycleExecution.3',
    defaultMessage: '周期执行',
  }), //'周期执行'
  [TaskExecStrategy.WEEK]: formatMessage({
    id: 'odc.src.component.Task.CycleExecution.4',
    defaultMessage: '周期执行',
  }), //'周期执行'
  [TaskExecStrategy.START_NOW]: formatMessage({
    id: 'odc.src.component.Task.ExecuteImmediately',
    defaultMessage: '立即执行',
  }), //'立即执行'
  [TaskExecStrategy.START_AT]: formatMessage({
    id: 'odc.src.component.Task.TimedExecution',
    defaultMessage: '定时执行',
  }), //'定时执行'
  [TaskExecStrategy.AUTO]: formatMessage({
    id: 'src.component.Task.9B79BD20',
    defaultMessage: '自动执行',
  }), //'自动执行'
  [TaskExecStrategy.MANUAL]: formatMessage({
    id: 'src.component.Task.0B2B1D60',
    defaultMessage: '手动执行',
  }), //'手动执行'
};

const _commonActions = [TaskActionsEnum.SHARE, TaskActionsEnum.VIEW, TaskActionsEnum.CLONE];

const _AsyncTaskActions = [TaskActionsEnum.DOWNLOAD_VIEW_RESULT, TaskActionsEnum.VIEW_RESULT];

export const TaskStatus2Actions: Partial<Record<TaskStatus, TaskActionsEnum[]>> = {
  [TaskStatus.REJECTED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.APPROVAL_EXPIRED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.WAIT_FOR_EXECUTION_EXPIRED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.EXECUTION_EXPIRED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.CREATED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.EXECUTION_FAILED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.ROLLBACK_FAILED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.ROLLBACK_SUCCEEDED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.CANCELLED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.PRE_CHECK_FAILED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.COMPLETED]: [..._commonActions, ..._AsyncTaskActions],
  [TaskStatus.EXECUTING]: [
    ..._commonActions,
    ..._AsyncTaskActions,
    TaskActionsEnum.DOWNLOAD_SQL,
    TaskActionsEnum.STRUCTURE_COMPARISON,
    TaskActionsEnum.STOP,
  ],
  [TaskStatus.EXECUTION_SUCCEEDED]: [
    ..._commonActions,
    ..._AsyncTaskActions,
    TaskActionsEnum.OPEN_LOCAL_FOLDER,
    TaskActionsEnum.DOWNLOAD,
    TaskActionsEnum.ROLLBACK,
    TaskActionsEnum.DOWNLOAD_SQL,
    TaskActionsEnum.STRUCTURE_COMPARISON,
  ],
  [TaskStatus.EXECUTION_SUCCEEDED_WITH_ERRORS]: [
    ..._commonActions,
    ..._AsyncTaskActions,
    TaskActionsEnum.OPEN_LOCAL_FOLDER,
    TaskActionsEnum.DOWNLOAD,
    TaskActionsEnum.ROLLBACK,
    TaskActionsEnum.DOWNLOAD_SQL,
    TaskActionsEnum.STRUCTURE_COMPARISON,
  ],
  [TaskStatus.WAIT_FOR_CONFIRM]: [
    ..._commonActions,
    ..._AsyncTaskActions,
    TaskActionsEnum.PASS,
    TaskActionsEnum.REJECT,
    TaskActionsEnum.STOP,
  ],
  [TaskStatus.APPROVING]: [
    ..._commonActions,
    ..._AsyncTaskActions,
    TaskActionsEnum.PASS,
    TaskActionsEnum.REJECT,
    TaskActionsEnum.REVOKE,
  ],
  [TaskStatus.WAIT_FOR_EXECUTION]: [
    ..._commonActions,
    ..._AsyncTaskActions,
    TaskActionsEnum.EXECUTE,
    TaskActionsEnum.STOP,
  ],
  [TaskStatus.EXECUTION_ABNORMAL]: [
    ..._commonActions,
    ..._AsyncTaskActions,
    TaskActionsEnum.STOP,
    TaskActionsEnum.AGAIN,
  ],
};
