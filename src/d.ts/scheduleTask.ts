import { ScheduleType } from './schedule';
import { IDatabase } from './database';
import { IProject, ProjectRole } from './project';
import { SubTaskExecuteType } from '.';

export enum ScheduleTaskStatus {
  /** 待调度 */
  PREPARING = 'PREPARING',
  /** 执行中 */
  RUNNING = 'RUNNING',
  // task not work, but can be recovered
  /** 执行异常 */
  ABNORMAL = 'ABNORMAL',
  // pausing or paused or resuming only support for task who implement restart logic
  // that means task must save checkpoint for it's recovery
  /** 暂停中 */
  PAUSING = 'PAUSING',
  /** 已暂停 */
  PAUSED = 'PAUSED',
  /** 恢复中 */
  RESUMING = 'RESUMING',
  // task is canceling, that will transfer to CANCELED status
  /** 终止中 */
  CANCELING = 'CANCELING',
  // the following is terminate states
  /** 执行失败 */
  FAILED = 'FAILED',
  /** 执行超时 */
  EXEC_TIMEOUT = 'EXEC_TIMEOUT',
  /** 已终止 */
  CANCELED = 'CANCELED',
  /** 执行成功 */
  DONE = 'DONE',
  /** 执行成功（告警） */
  DONE_WITH_FAILED = 'DONE_WITH_FAILED',
}

export enum ScheduleTaskActionsEnum {
  /** 查看 */
  VIEW = 'VIEW',
  /** 分享 */
  SHARE = 'SHARE',
  /** 终止 */
  STOP = 'STOP',
  /** 执行 */
  EXECUTE = 'EXECUTE',
  /**暂停(数据归档、数据清理)*/
  PAUSE = 'PAUSE',
  /** 恢复(数据归档、数据清理)*/
  RESTORE = 'RESTORE',
  /** 重试(数据归档、数据清理)*/
  RETRY = 'RETRY',
  /** 回滚(数据归档)*/
  ROLLBACK = 'ROLLBACK',
}

export type IScheduleTaskExecutionDetail =
  | IDataArchiveSubTaskExecutionDetails
  | IDataDeleteSubTaskExecutionDetails
  | IPartitionPlanSubTaskExecutionDetails
  | ISqlPlanSubTaskExecutionDetails;
export type IDataArchiveSubTaskExecutionDetails = {
  endTime?: number;
  processedRowCount?: number;
  processedRowsPerSecond?: number;
  readRowCount?: number;
  readRowsPerSecond?: number;
  startTime?: number;
  status?: string;
  tableName?: string;
  type?: SubTaskExecuteType;
  userCondition?: string;
}[];
export type IDataDeleteSubTaskExecutionDetails = {
  endTime?: number;
  processedRowCount?: number;
  processedRowsPerSecond?: number;
  readRowCount?: number;
  readRowsPerSecond?: number;
  startTime?: number;
  status?: string;
  tableName?: string;
  type?: SubTaskExecuteType;
  userCondition?: string;
}[];
export type IPartitionPlanSubTaskExecutionDetails = {
  cloudProvider?: string;
  csvResultSetZipDownloadUrl?: string;
  errorRecordsFileDownloadUrl?: string;
  failedRecord?: string[];
  failedStatements?: number;
  finishedStatements?: number;
  region?: string;
  sqlExecuteJsonFileDownloadUrl?: string;
  succeedStatements?: number;
  totalStatements?: number;
};
export type ISqlPlanSubTaskExecutionDetails = {
  cloudProvider?: string;
  csvResultSetZipDownloadUrl?: string;
  errorRecordsFileDownloadUrl?: string;
  failedRecord?: string[];
  failedStatements?: number;
  finishedStatements?: number;
  region?: string;
  sqlExecuteJsonFileDownloadUrl?: string;
  succeedStatements?: number;
  totalStatements?: number;
};

export type SubTaskParameters =
  | IPartitionPlanSubTaskParameters
  | ISqlPlanParametersSubTaskParameters
  | IDataClearParametersSubTaskParameters
  | IDataArchiveParametersSubTaskParameters;

export type IPartitionPlanSubTaskParameters = {
  delimiter?: string;
  errorStrategy?: string;
  queryLimit?: number;
  retryIntervalMillis?: number;
  retryTimes?: number;
  sessionTimeZone?: string;
  sqlContent?: string;
  timeoutMillis?: number;
};
export type ISqlPlanParametersSubTaskParameters = {
  databaseId?: number;
  databaseInfo?: IDatabase;
  delimiter?: string;
  errorStrategy?: string;
  generateRollbackPlan?: string;
  markAsFailedWhenAnyErrorsHappened?: boolean;
  modifyTimeoutIfTimeConsumingSqlExists?: boolean;
  parentScheduleType?: string;
  queryLimit?: number;
  retryIntervalMillis?: number;
  retryTimes?: number;
  riskLevelIndex?: number;
  rollbackSqlContent?: string;
  rollbackSqlObjectIds?: string[];
  rollbackSqlObjectNames?: string[];
  sqlContent?: string;
  sqlObjectIds?: string[];
  sqlObjectNames?: string[];
  timeoutMillis?: number;
};
export type IDataClearParametersSubTaskParameters = Record<string, any>;
export type IDataArchiveParametersSubTaskParameters = Record<string, any>;

export interface scheduleTask<T, K> {
  createTime: number;
  id: number;
  jobGroup: SubTaskType;
  status: ScheduleTaskStatus;
  type: SubTaskType;
  updateTime: number;
  executionDetails?: K;
  project: IProject;
  currentUserResourceRoles?: ProjectRole[];
  scheduleId?: number;
  scheduleName?: string;
  lastExecutionTime?: number;
  jobName?: string;
  parameters: T;
  creator?: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };
  attributes?: {
    sourceDataBaseInfo?: IDatabase;
    targetDataBaseInfo?: IDatabase;
    databaseInfo?: IDatabase;
  };
}

export enum SubTaskType {
  /** 数据归档 */
  DATA_ARCHIVE = 'DATA_ARCHIVE',
  /** 数据清理 */
  DATA_DELETE = 'DATA_DELETE',
  /** 分区计划 */
  PARTITION_PLAN = 'PARTITION_PLAN',
  /** SQL计划 */
  SQL_PLAN = 'SQL_PLAN',
  /** 回滚 */
  DATA_ARCHIVE_ROLLBACK = 'DATA_ARCHIVE_ROLLBACK',
  /** 源表清理 */
  DATA_ARCHIVE_DELETE = 'DATA_ARCHIVE_DELETE',
}

export interface IScheduleTaskRecord<T> {
  createTime: number;
  executionDetails: string;
  fireTime: number;
  id: number;
  parameters: T;
  status: ScheduleTaskStatus;
  type: SubTaskType;
  updateTime: number;
}

export enum ScheduleTaskDetailType {
  /** 基本信息 */
  INFO = 'INFO',
  /** 执行结果 */
  EXECUTE_RESULT = 'EXECUTE_RESULT',
  /** 操作记录 */
  OPERATION_RECORD = 'OPERATION_RECORD',
  /** 任务日志 */
  LOG = 'LOG',
}
