import { ConnectionMode, SchemaComparingResult, TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export interface IShaodwSyncData {
  schemaName: string;
  syncAll: boolean;
  prefix: boolean;
  name: string;
  originTableNames?: Set<string>;
  shadowAnalysisData?: IShadowSyncAnalysisResult;
  executionStrategy?: TaskExecStrategy;
  executionTime?: number;
  errorStrategy?: ErrorStrategy;
  description?: string;
  databaseId?: number;
}

export interface IShadowSyncAnalysisResult {
  id: string;
  allDDL?: string;
  tables: {
    id: number;
    originTableName: string;
    destTableName: string;
    comparingResult?: SchemaComparingResult;
    originTableDDL?: string;
    destTableDDL?: string;
    comparingDDL?: string;
  }[];

  completed?: boolean;
  progressPercentage?: number;
}

export interface IContentProps {
  schemaName: string;
  sessionId: string;
  connectionId: number;
  projectId: number;
  data: IShaodwSyncData;
  connectionMode: ConnectionMode;
  isReadonlyPublicConn?: boolean;
  setData: (v: IShaodwSyncData) => void;
}

export enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}

export interface ShadowTableSyncTaskResult {
  shadowTableComparingId: string;
  tables: SchemaSyncExecutingRecord[];
}

export interface SchemaSyncExecutingRecord {
  id: number;
  originTableName: string;
  destTableName: string;
  status: SchemaSyncExecuteStatus;
}

export enum SchemaSyncExecuteStatus {
  /**
   * 执行成功
   */
  SUCCESS = 'SUCCESS',

  /**
   * 执行失败
   */
  FAILED = 'FAILED',

  /**
   * 等待执行
   */
  WAITING = 'WAITING',

  /**
   * 执行中
   */
  EXECUTING = 'EXECUTING',

  /**
   * 跳过执行
   */
  SKIP = 'SKIP',
}

export const SchemaSyncExecuteStatusText = {
  [SchemaSyncExecuteStatus.SUCCESS]: formatMessage({
    id: 'odc.components.CreateShadowSyncModal.interface.SuccessfulExecution',
  }), //执行成功
  [SchemaSyncExecuteStatus.FAILED]: formatMessage({
    id: 'odc.components.CreateShadowSyncModal.interface.ExecutionFailed',
  }), //执行失败
  [SchemaSyncExecuteStatus.WAITING]: formatMessage({
    id: 'odc.components.CreateShadowSyncModal.interface.PendingExecution',
  }), //待执行
  [SchemaSyncExecuteStatus.EXECUTING]: formatMessage({
    id: 'odc.components.CreateShadowSyncModal.interface.Running',
  }), //执行中
  [SchemaSyncExecuteStatus.SKIP]: formatMessage({
    id: 'odc.components.CreateShadowSyncModal.interface.SkipExecution',
  }), //跳过执行
};
