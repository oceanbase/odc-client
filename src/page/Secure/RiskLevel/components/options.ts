import { formatMessage } from '@/util/intl';
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

import { listEnvironments } from '@/common/network/env';
import { TaskTypeMap } from '@/component/Task/component/TaskTable/const';
import { TaskType } from '@/d.ts';
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
import { ScheduleType } from '@/d.ts/schedule';
import { ScheduleTextMap } from '@/constant/schedule';
export const getEnvironmentOptions = async () => {
  const rawData = (await listEnvironments()) || [];
  const newEnvOptions = rawData?.map((rd) => {
    return {
      id: rd?.id,
      label: rd?.name,
      value: rd?.originalName || rd?.id,
    };
  });
  return newEnvOptions;
};
export const getTaskTypeOptions = () => {
  const newTaskTypeOptions = [
    {
      label: TaskTypeMap[TaskType.IMPORT],
      value: TaskType.IMPORT,
    },
    {
      label: TaskTypeMap[TaskType.EXPORT],
      value: TaskType.EXPORT,
    },
    {
      label: TaskTypeMap[TaskType.DATAMOCK],
      value: TaskType.DATAMOCK,
    },
    {
      label: TaskTypeMap[TaskType.ASYNC],
      value: TaskType.ASYNC,
    },
    {
      label: TaskTypeMap[TaskType.SHADOW],
      value: TaskType.SHADOW,
    },
    {
      label: TaskTypeMap[TaskType.EXPORT_RESULT_SET],
      value: TaskType.EXPORT_RESULT_SET,
    },
    {
      label: TaskTypeMap[TaskType.APPLY_PROJECT_PERMISSION],
      value: TaskType.APPLY_PROJECT_PERMISSION,
    },
    {
      label: TaskTypeMap[TaskType.APPLY_DATABASE_PERMISSION],
      value: TaskType.APPLY_DATABASE_PERMISSION,
    },
    {
      label: TaskTypeMap[TaskType.APPLY_TABLE_PERMISSION],
      value: TaskType.APPLY_TABLE_PERMISSION,
    },
    {
      label: TaskTypeMap[TaskType.STRUCTURE_COMPARISON],
      value: TaskType.STRUCTURE_COMPARISON,
    },
    {
      label: TaskTypeMap[TaskType.MULTIPLE_ASYNC],
      value: TaskType.MULTIPLE_ASYNC,
    },
    {
      label: TaskTypeMap[TaskType.LOGICAL_DATABASE_CHANGE],
      value: TaskType.LOGICAL_DATABASE_CHANGE,
    },
    {
      label: TaskTypeMap[TaskType.ONLINE_SCHEMA_CHANGE],
      value: TaskType.ONLINE_SCHEMA_CHANGE,
    },
  ];

  return newTaskTypeOptions;
};

const getScheduleTypeOptions = () => {
  const scheduleTypeOptions = [
    {
      label: ScheduleTextMap[ScheduleType.PARTITION_PLAN],
      value: ScheduleType.PARTITION_PLAN,
    },
    {
      label: ScheduleTextMap[ScheduleType.DATA_ARCHIVE],
      value: ScheduleType.DATA_ARCHIVE,
    },
    {
      label: ScheduleTextMap[ScheduleType.DATA_DELETE],
      value: ScheduleType.DATA_DELETE,
    },
    {
      label: ScheduleTextMap[ScheduleType.SQL_PLAN],
      value: ScheduleType.SQL_PLAN,
    },
  ];
  return scheduleTypeOptions;
};

export const getSqlCheckResultOptions = () => {
  const sqlCheckResultOptions = [
    {
      label: RiskLevelTextMap()[RiskLevelEnum.DEFAULT],
      value: '' + RiskLevelEnum.DEFAULT,
    },
    {
      label: RiskLevelTextMap()[RiskLevelEnum.SUGGEST],
      value: '' + RiskLevelEnum.SUGGEST,
    },
    {
      label: RiskLevelTextMap()[RiskLevelEnum.MUST],
      value: '' + RiskLevelEnum.MUST,
    },
  ];

  return sqlCheckResultOptions;
};
export const initOptions = async ({
  setEnvironmentMap,
  setEnvironmentOptions,
  setTaskTypeIdMap,
  setScheduleTypeIdMap,
  setTaskTypeOptions,
  setScheduleTypeOptions,
  setSqlCheckResultIdMap,
  setSqlCheckResultOptions,
}) => {
  const envOptions = await getEnvironmentOptions();
  const envMap = {};
  envOptions?.forEach(({ value, label, id }) => {
    envMap[value] = label;
    envMap[` id:${id}`] = value;
  });
  setEnvironmentMap(envMap);
  setEnvironmentOptions(envOptions);
  const taskTypeOptions = await getTaskTypeOptions();
  const scheduleTypeOptions = getScheduleTypeOptions();
  const taskTypeIdMap = {};
  const scheduleTypeIdMap = {};
  taskTypeOptions?.forEach(({ label, value }) => (taskTypeIdMap[value] = label));
  scheduleTypeOptions?.forEach(({ label, value }) => (scheduleTypeIdMap[value] = label));
  setScheduleTypeIdMap(scheduleTypeIdMap);
  setTaskTypeIdMap(taskTypeIdMap);
  setTaskTypeOptions(taskTypeOptions);
  setScheduleTypeOptions(scheduleTypeOptions);
  const sqlCheckResultOptions = await getSqlCheckResultOptions();
  const sqlChekcResultMap = {};
  sqlCheckResultOptions?.forEach(({ label, value }) => (sqlChekcResultMap['' + value] = label));
  setSqlCheckResultIdMap(sqlChekcResultMap);
  setSqlCheckResultOptions(sqlCheckResultOptions);
  return envMap;
};
