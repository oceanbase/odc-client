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
import {
  TaskPartitionStrategy,
  TaskErrorStrategy,
  SyncTableStructureEnum,
  SubTaskType,
} from '@/d.ts';

export const ErrorStrategyMap = {
  [TaskErrorStrategy.ABORT]: formatMessage({ id: 'src.component.Task.F0079010' }), //'停止任务'
  [TaskErrorStrategy.CONTINUE]: formatMessage({ id: 'src.component.Task.2DA054B9' }), //'忽略错误继续任务'
};

export const TaskPartitionStrategyMap = {
  [TaskPartitionStrategy.CREATE]: formatMessage({ id: 'src.component.Task.CD347F96' }), //'创建策略'
  [TaskPartitionStrategy.DROP]: formatMessage({ id: 'src.component.Task.9262EB40' }), //'删除策略'
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

export const SubTaskTypeMap = {
  [SubTaskType.MIGRATE]: {
    label: formatMessage({ id: 'src.d.ts.CA81991C', defaultMessage: '归档' }),
  },
  [SubTaskType.CHECK]: {
    label: formatMessage({ id: 'src.d.ts.8977156C', defaultMessage: '数据检查' }),
  },
  [SubTaskType.DELETE]: {
    label: formatMessage({ id: 'src.d.ts.237F5711', defaultMessage: '数据清理' }),
  },
  [SubTaskType.QUICK_DELETE]: {
    label: formatMessage({ id: 'src.d.ts.CD43F08A', defaultMessage: '数据清理' }),
  },
  [SubTaskType.DEIRECT_DELETE]: {
    label: formatMessage({ id: 'src.d.ts.910D42B5', defaultMessage: '数据清理' }),
  },
  [SubTaskType.ROLLBACK]: {
    label: formatMessage({ id: 'src.d.ts.DF449BBC', defaultMessage: '回滚' }),
  },
};

export enum DropPartiotionEnum {
  CLEAN = 'CLEAN',
  DROPPARTITION = 'DROPPARTITION',
}

export const DropPartiotionMap = {
  [DropPartiotionEnum.CLEAN]: {
    value: false,
    label: `清理数据`,
  },
  [DropPartiotionEnum.DROPPARTITION]: {
    value: true,
    label: `删除分区`,
  },
};
export const DropPartiotionOptions = Object.keys(DropPartiotionMap).map(
  (key: DropPartiotionEnum) => {
    return {
      value: DropPartiotionMap[key].value,
      label: DropPartiotionMap[key].label,
    };
  },
);
