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

import { TaskExecStrategy, TaskType } from '@/d.ts';
import { DatabasePermissionType } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
export { TaskTypeMap } from '@/component/Task/component/TaskTable/const';
import { TaskConfig, allTaskPageConfig } from '@/common/task';
import { ITaskParam, TaskTab } from './interface';
import {
  TASK_EXECUTE_DATE_KEY,
  TASK_EXECUTE_TIME_KEY,
} from '@/component/Task/component/TaskTable/const';
import dayjs from 'dayjs';

// 423 屏蔽 SysFormItem 配置
export const ENABLED_SYS_FROM_ITEM = false;

export const hasPermission = (taskType: TaskType, permissions: DatabasePermissionType[]) => {
  let _permissions = [];
  switch (taskType) {
    case TaskType.EXPORT:
      return permissions?.length > 0; // 考虑有表没有库权限的情况
    case TaskType.EXPORT_RESULT_SET:
      _permissions = [DatabasePermissionType.EXPORT, DatabasePermissionType.QUERY];
      break;
    default:
      _permissions = [DatabasePermissionType.CHANGE];
  }
  return _permissions.every((item) => permissions?.includes(item));
};

export const isLogicalDbChangeTask = (type: TaskType) => TaskType.LOGICAL_DATABASE_CHANGE === type;
export const isCycleTriggerStrategy = (execStrategy: TaskExecStrategy) => {
  return [
    TaskExecStrategy.CRON,
    TaskExecStrategy.DAY,
    TaskExecStrategy.WEEK,
    TaskExecStrategy.MONTH,
    TaskExecStrategy.TIMER,
  ].includes(execStrategy);
};

export const conditionExpressionColumns = [
  {
    dataIndex: 'tableName',
    key: 'tableName',
    title: formatMessage({ id: 'src.component.Task.2BADF17E', defaultMessage: '关联表' }),
    ellipsis: true,
  },
  {
    dataIndex: 'joinCondition',
    key: 'joinCondition',
    title: formatMessage({ id: 'src.component.Task.96BD5290', defaultMessage: '关联条件' }),
    ellipsis: false,
    render: (value) => {
      return (
        <span style={{ textWrap: 'wrap', wordBreak: 'break-all', maxWidth: 300 }}>{value}</span>
      );
    },
  },
];

export const getFirstEnabledTask = () => {
  return [allTaskPageConfig, ...Object.values(TaskConfig)]?.find((item) => item.enabled());
};

export const getDefaultParam: () => ITaskParam = () => {
  const _defaultParam: ITaskParam = {
    searchValue: undefined,
    searchType: undefined,
    taskTypes: [],
    taskStatus: [],
    projectId: [],
    sort: '',
    tab: TaskTab.all,
    timeRange: 7,
    executeDate: [undefined, undefined],
  };
  _defaultParam.timeRange =
    JSON.parse(localStorage.getItem(TASK_EXECUTE_TIME_KEY)) ?? _defaultParam.timeRange;
  const [start, end] = JSON.parse(localStorage?.getItem(TASK_EXECUTE_DATE_KEY)) ?? [null, null];
  if (!!start && !!end) {
    _defaultParam.executeDate = [dayjs(start), dayjs(end)];
  }
  return _defaultParam;
};

type TimeUnit = 'years' | 'months' | 'days';

const MAX_DATE = '9999-12-31 23:59:59';
const MAX_DATE_LABEL = '9999-12-31';

/**
 * 处理时间单位转换的兼容函数
 * @param value 时间值
 * @param unit 单位
 * @returns [转换后的值, 转换后的单位]
 */
const normalizeTimeUnit = (value: number, unit: TimeUnit): [number, TimeUnit] => {
  if (unit === 'years' && value % 1 !== 0) {
    // 处理年的小数情况，转换为月
    return [value * 12, 'months'];
  }
  return [value, unit];
};

export const getExpireTime = (expireTime, customExpireTime, isCustomExpireTime) => {
  if (isCustomExpireTime) {
    return customExpireTime?.valueOf();
  } else {
    const [offset, unit] = expireTime.split(',') ?? [];
    if (offset === 'never') {
      return dayjs(MAX_DATE)?.valueOf();
    }
    const [normalizedValue, normalizedUnit] = normalizeTimeUnit(Number(offset), unit as TimeUnit);
    return dayjs().add(normalizedValue, normalizedUnit)?.valueOf();
  }
};

export const getExpireTimeLabel = (expireTime) => {
  const label = dayjs(expireTime).format('YYYY-MM-DD');
  return label === MAX_DATE_LABEL
    ? formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.B5C7760D',
        defaultMessage: '永不过期',
      })
    : label;
};
