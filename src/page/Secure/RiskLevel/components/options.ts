import { listEnvironments } from "@/common/network/env";
import { TaskType } from "@/d.ts";
import { RiskLevelTextMap, RiskLevelEnum } from "../../interface";

export const getEnvironmentOptions = async () => {
  const rawData = (await listEnvironments()) || [];
  const newEnvOptions = rawData?.map((rd) => {
    return {
      label: rd.name,
      value: '' + rd.id,
    };
  });
  return newEnvOptions;
};
export const getTaskTypeOptions = () => {
  const newTaskTypeOptions = [
    {
      label: TaskType.IMPORT,
      value: TaskType.IMPORT,
    },
    {
      label: TaskType.EXPORT,
      value: TaskType.EXPORT,
    },
    {
      label: TaskType.DATAMOCK,
      value: TaskType.DATAMOCK,
    },
    {
      label: TaskType.ASYNC,
      value: TaskType.ASYNC,
    },
    {
      label: TaskType.PARTITION_PLAN,
      value: TaskType.PARTITION_PLAN,
    },
    {
      label: TaskType.SQL_PLAN,
      value: TaskType.SQL_PLAN,
    },
    {
      label: TaskType.ALTER_SCHEDULE,
      value: TaskType.ALTER_SCHEDULE,
    },
    {
      label: TaskType.SHADOW,
      value: TaskType.SHADOW,
    },
    {
      label: TaskType.DATA_SAVE,
      value: TaskType.DATA_SAVE,
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
