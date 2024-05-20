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
import { TaskTypeMap } from '@/component/Task/component/TaskTable';
import { TaskType } from '@/d.ts';
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
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
      label: TaskTypeMap[TaskType.PARTITION_PLAN],
      value: TaskType.PARTITION_PLAN,
    },
    {
      label: formatMessage({
        id: 'odc.src.page.Secure.RiskLevel.components.AutomaticRunning',
      }), //'自动运行'
      value: TaskType.ALTER_SCHEDULE,
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
      label: TaskTypeMap[TaskType.STRUCTURE_COMPARISON],
      value: TaskType.STRUCTURE_COMPARISON,
    },
    {
      label: TaskTypeMap[TaskType.MULTIPLE_ASYNC],
      value: TaskType.MULTIPLE_ASYNC,
    },
  ];
  return newTaskTypeOptions;
};
export const getSqlCheckResultOptions = () => {
  const sqlCheckResultOptions = [
    {
      label: RiskLevelTextMap[RiskLevelEnum.DEFAULT],
      value: '' + RiskLevelEnum.DEFAULT,
    },
    {
      label: RiskLevelTextMap[RiskLevelEnum.SUGGEST],
      value: '' + RiskLevelEnum.SUGGEST,
    },
    {
      label: RiskLevelTextMap[RiskLevelEnum.MUST],
      value: '' + RiskLevelEnum.MUST,
    },
  ];
  return sqlCheckResultOptions;
};
export const initOptions = async ({
  setEnvironmentMap,
  setEnvironmentOptions,
  setTaskTypeIdMap,
  setTaskTypeOptions,
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
  const taskTypeIdMap = {};
  taskTypeOptions?.forEach(({ label, value }) => (taskTypeIdMap[value] = label));
  setTaskTypeIdMap(taskTypeIdMap);
  setTaskTypeOptions(taskTypeOptions);
  const sqlCheckResultOptions = await getSqlCheckResultOptions();
  const sqlChekcResultMap = {};
  sqlCheckResultOptions?.forEach(({ label, value }) => (sqlChekcResultMap['' + value] = label));
  setSqlCheckResultIdMap(sqlChekcResultMap);
  setSqlCheckResultOptions(sqlCheckResultOptions);
  return envMap;
};
