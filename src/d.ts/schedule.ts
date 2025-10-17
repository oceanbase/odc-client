import { IDatabase } from './database';
import { IProject, ProjectRole } from './project';
import {
  ICycleTaskTriggerConfig,
  IPartitionTableConfig,
  TaskErrorStrategy,
  ShardingStrategy,
  SyncTableStructureEnum,
  TaskOperationType,
  IJoinTableConfigs,
} from '@/d.ts';
export enum ScheduleType {
  /** 数据归档 */
  DATA_ARCHIVE = 'DATA_ARCHIVE',
  /** 数据清理 */
  DATA_DELETE = 'DATA_DELETE',
  /** sql 计划 */
  SQL_PLAN = 'SQL_PLAN',
  /** 分区计划 */
  PARTITION_PLAN = 'PARTITION_PLAN',
}

/**
 * 操作列自定义权限（前端）
 */
export enum IOperationTypeRole {
  /** 项目开发者 */
  PROJECT_DEVELOPER = 'DEVELOPER',
  /** 项目DBA */
  PROJECT_DBA = 'DBA',
  /** 项目Owner */
  PROJECT_OWNER = 'OWNER',
  /** 项目安全管理员 */
  PROJECT_SECURITY_ADMINISTRATOR = 'SECURITY_ADMINISTRATOR',
  /** 项目参与者 */
  PROJECT_PARTICIPANT = 'PARTICIPANT',
  /** 创建人 */
  CREATOR = 'CREATOR',
  /** 可审批人 */
  APPROVER = 'APPROVER',
}

export enum ScheduleViewType {
  /** 调度视角*/
  ScheduleView = 'scheduleView',
  /** 执行视角*/
  ExecutionView = 'executionView',
}

export enum ScheduleDetailType {
  /** 基本信息 */
  INFO = 'INFO',
  /** 执行记录 */
  EXECUTE_RECORD = 'EXECUTE_RECORD',
  /** 操作记录 */
  OPERATION_RECORD = 'OPERATION_RECORD',
}

export enum SchedulePageType {
  ALL = 'ALL_Schedule',
  /** 数据归档 */
  DATA_ARCHIVE = 'DATA_ARCHIVE',
  /** 数据清理 */
  DATA_DELETE = 'DATA_DELETE',
  /** 分区计划 */
  PARTITION_PLAN = 'PARTITION_PLAN',
  /** SQL计划 */
  SQL_PLAN = 'SQL_PLAN',
}

export enum ScheduleStatus {
  /** 创建中 */
  CREATING = 'CREATING',
  /** 已禁用 */
  PAUSE = 'PAUSE',
  /** 已启用 */
  ENABLED = 'ENABLED',
  /** 已终止 */
  TERMINATED = 'TERMINATED',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 执行超时 */
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  /** 已删除 */
  DELETED = 'DELETED',
  /** 已取消 */
  CANCELED = 'CANCELED',
}

export enum ScheduleActionsEnum {
  /** 查看 */
  VIEW = 'VIEW',
  /** 克隆 */
  CLONE = 'CLONE',
  /** 分享 */
  SHARE = 'SHARE',
  /** 终止 */
  STOP = 'STOP',
  /** 禁用 */
  DISABLE = 'DISABLE',
  /** 启用 */
  ENABLE = 'ENABLE',
  /** 编辑 */
  EDIT = 'EDIT',
  /** 删除 */
  DELETE = 'DELETE',
  /** 通过 */
  PASS = 'PASS',
  /** 撤销 */
  REVOKE = 'REVOKE',
  /** 拒绝 */
  REFUSE = 'REFUSE',
}

export interface IScheduleRecord<T> {
  allowConcurrent: boolean;
  createTime: number;
  creator: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };
  candidateApprovers?: {
    id: number;
    name: string;
    accountName: string;
  }[];
  currentUserResourceRoles: ProjectRole[];
  approveByCurrentUser?: boolean;
  approvable?: boolean;
  approveInstanceId?: number;
  description?: string;
  nextFireTimes: number[];
  parameters?: T;
  project?: IProject;
  projectId: number;
  scheduleId: number;
  scheduleName?: string;
  database?: IDatabase;
  status: ScheduleStatus;
  type: ScheduleType;
  updateTime: number;
  triggerConfig: ICycleTaskTriggerConfig;
  misfireStrategy?: string;
  flowInstanceId?: number;
  attributes?: {
    databaseInfo?: IDatabase;
    sourceDataBaseInfo?: IDatabase;
    targetDataBaseInfo?: IDatabase;
  };
  latestChangedLogId?: number;
  operationType?: TaskOperationType;
}
export type ScheduleRecordParameters =
  | IPartitionPlan
  | ISqlPlanParameters
  | IDataClearParameters
  | IDataArchiveParameters;

export type IPartitionPlan = {
  creationTrigger: ICycleTaskTriggerConfig;
  createTriggerNextFireTimes: number[];
  droppingTrigger: ICycleTaskTriggerConfig;
  dropTriggerNextFireTimes: number[];
  databaseId: number;
  databaseInfo: IDatabase;
  enabled: boolean;
  id: number;
  flowInstanceId: number;
  taskId: number;
  // maxErrors: number;
  timeoutMillis: number;
  // partitionTableConfig: IPartitionTableConfig;
  partitionTableConfigs: IPartitionTableConfig[];
  errorStrategy: TaskErrorStrategy;
};

export type ISqlPlanParameters = {
  databaseId: number;
  databaseInfo: IDatabase;
  generateRollbackPlan: string;
  markAsFailedWhenAnyErrorsHappened: boolean;
  modifyTimeoutIfTimeConsumingSqlExists: boolean;
  parentScheduleType: ScheduleType;
  sqlContent: string;
  sqlObjectNames: string[];
  sqlObjectIds: string[];
  timeoutMillis: number;
  errorStrategy: TaskErrorStrategy;
  delimiter: string;
  queryLimit: number;
  retryTimes: number;
  retryIntervalMillis: number;
  riskLevelIndex: number;
  rollbackSqlContent: null;
  rollbackSqlObjectIds: null;
  rollbackSqlObjectNames: null;
};

export type dmlParametersTables = {
  conditionExpression: string;
  tableName: string;
  targetTableName: string;
  joinTableConfigs?: IJoinTableConfigs[];
  partitions?: string[] | string;
  tempTableName: string;
};

export type IDataClearParameters = {
  cpuLimit: number;
  database: IDatabase;
  databaseId: number;
  deleteByUniqueKey: boolean;
  deleteTemporaryTable: boolean;
  dirtyRowAction: string;
  fullDatabase: boolean;
  maxAllowedDirtyRowCount: string;
  needCheckBeforeDelete: boolean;
  needPrintSqlTrace: boolean;
  queryTimeout: number;
  rateLimit: { batchSize: number; dataSizeLimit: number; orderId: number; rowLimit: number };
  readThreadCount: number;
  scanBatchSize: number;
  shardingStrategy: ShardingStrategy;
  tables: dmlParametersTables[];
  targetDatabase?: IDatabase;
  targetDatabaseId: number;
  timeoutMillis: number;
  variables: {
    name: string;
    pattern: string;
  }[];
  writeThreadCount: number;
  scheduleIgnoreTimeoutTask: boolean;
};

export type IDataArchiveParameters = {
  cpuLimit: number;
  createTargetTableIfNotExists: boolean;
  deleteAfterMigration: boolean;
  deleteTemporaryTable: boolean;
  dirtyRowAction: string;
  fullDatabase: boolean;
  maxAllowedDirtyRowCount: string;
  migrationInsertAction: string;
  needPrintSqlTrace: string;
  queryTimeout: number;
  rateLimit: {
    batchSize: number;
    dataSizeLimit: number;
    orderId: number;
    rowLimit: number;
  };
  readThreadCount: number;
  scanBatchSize: number;
  shardingStrategy: string;
  sourceDataSourceName: string;
  sourceDatabase: IDatabase;
  sourceDatabaseId: number;
  sourceDatabaseName: string;
  syncTableStructure: SyncTableStructureEnum[];
  tables: dmlParametersTables[];
  targetDataBaseId: number;
  targetDataSourceName: string;
  targetDatabase: IDatabase;
  targetDatabaseName: string;
  timeoutMillis: number;
  variables: any[];
  writeThreadCount: number;
  scheduleIgnoreTimeoutTask: boolean;
};

export type createScheduleRecord<T> = {
  /** 编辑时传入 */
  id?: number;
  name?: string;
  type?: ScheduleType;
  parameters?: T;
  triggerConfig?: ICycleTaskTriggerConfig;
  description?: string;
  allowConcurrent?: boolean;
};

export type createSchedueleParameters =
  | createPartitionPlanParameters
  | createSqlPlanParameters
  | createDataDeleteParameters
  | createDataArchiveParameters;

export type createPartitionPlanParameters = {
  databaseId: string;
  enabled: boolean;
  partitionTableConfigs: IPartitionTableConfig[];
  creationTrigger: ICycleTaskTriggerConfig;
  droppingTrigger?: ICycleTaskTriggerConfig;
  timeoutMillis: number;
  errorStrategy: TaskErrorStrategy;
  /** 编辑时传入 */
  id?: number;
};

export type createSqlPlanParameters = {
  databaseId: number;
  sqlContent: string;
  sqlObjectNames: string[];
  sqlObjectIds: string[];
  timeoutMillis: number;
  errorStrategy: TaskErrorStrategy;
  queryLimit: number;
  delimiter: string;
  modifyTimeoutIfTimeConsumingSqlExists: boolean;
};

export type createDataDeleteParameters = {
  databaseId: number;
  deleteByUniqueKey?: boolean;
  fullDatabase?: boolean;
  needCheckBeforeDelete: boolean;
  rateLimit?: {
    rowLimit: number;
    dataSizeLimit: number;
  };
  shardingStrategy?: ShardingStrategy;
  targetDatabaseId?: number;
  tables: {
    tableName: string;
    conditionExpression: string;
    targetTableName: string;
  }[];
  timeoutMillis: number;
  triggerConfig: ICycleTaskTriggerConfig;
  variables: {
    name: string;
    pattern: string;
  }[];
  scheduleIgnoreTimeoutTask: boolean;
};

export type createDataArchiveParameters = {
  createTargetTableIfNotExists: boolean;
  deleteAfterMigration: boolean;
  fullDatabase: boolean;
  migrationInsertAction: string;
  rateLimit?: {
    rowLimit: number;
    dataSizeLimit: number;
  };
  shardingStrategy?: ShardingStrategy;
  syncTableStructure?: SyncTableStructureEnum[];
  tables: {
    tableName: string;
    conditionExpression: string;
    targetTableName: string;
  }[];
  targetDataBaseId: number;
  timeoutMillis: number;
  variables: any[];
  sourceDatabaseId: number;
  triggerConfig: ICycleTaskTriggerConfig;
  scheduleIgnoreTimeoutTask: boolean;
};

export type dmlPreCheckResult = {
  error: boolean;
  level: 'ERROR' | 'WARN';
  message: string;
};
