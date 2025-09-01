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

import { IShadowSyncAnalysisResult } from '@/component/Task/modals/ShadowSyncTask/CreateModal/interface';
import {
  AgainTaskRecord,
  CommonTaskLogType,
  CreateStructureComparisonTaskRecord,
  CreateTaskRecord,
  IDatasourceUser,
  IFunction,
  IPartitionPlanKeyType,
  IPartitionPlanTable,
  IPartitionTablePreviewConfig,
  IResponseData,
  UnfinishedTickets,
  ISubTaskRecords,
  ITaskResult,
  Operation,
  TaskDetail,
  TaskPageType,
  TaskRecord,
  TaskRecordParameters,
  TaskStatus,
  TaskType,
  ITaskStatParam,
  ITodos,
  IGetFlowScheduleTodoParams,
  IStat,
  IAsyncTaskResultSet,
  IMultipleAsyncExecuteRecord,
  MultipleAsyncExecuteRecordStats,
  ICycleTaskRecord,
} from '@/d.ts';
import { IProject } from '@/d.ts/project';
import { EOperationType, IComparisonResultData, IStructrueComparisonDetail } from '@/d.ts/task';
import setting from '@/store/setting';
import request from '@/util/request';
import { downloadFile } from '@/util/utils';
import { generateFunctionSid } from './pathUtil';
import { IDatabase } from '@/d.ts/database';
import { FileExportResponse, ScheduleExportListView } from '@/d.ts/migrateTask';
import {
  IBatchTerminateFlowResult,
  IImportScheduleTaskView,
  IImportTaskResult,
  IScheduleTaskImportRequest,
  IScheduleTerminateCmd,
  ITaskTerminateCmd,
  IScheduleTerminateResult,
} from '@/d.ts/importTask';
import odc from '@/plugins/odc';
import { TaskSearchType } from '@/component/Task/interface';
import { ScheduleType } from '@/d.ts/schedule';
import { omit } from 'lodash';

/**
 * 根据函数获取ddl sql
 */
export async function getFunctionCreateSQL(funName: string, func: Partial<IFunction>) {
  const sid = generateFunctionSid(funName);
  const ret = await request.patch(`/api/v1/function/getCreateSql/${sid}`, {
    data: func,
  });
  return ret?.data?.sql;
}

/**
 * 新建任务
 * 任务：涵盖 导入，导出，异步，模拟数据，逻辑库变更，权限申请共计 5 种类型
 */
export async function createTask(data: Partial<CreateTaskRecord>): Promise<number> {
  const res = await request.post(`/api/v2/flow/flowInstances/`, {
    data,
  });
  return res?.data?.contents?.length || 0;
}

/**
 * 预览分区计划 SQL
 */
export async function previewPartitionPlans(
  sessionId: string,
  data: IPartitionTablePreviewConfig,
): Promise<
  IResponseData<{
    partitionName: string;
    sqls: string[];
    tableName: string;
  }>
> {
  const res = await request.post(
    `/api/v2/datasource/sessions/${sessionId}/partitionPlans/latest/preview`,
    {
      data,
    },
  );
  return res?.data || [];
}

/**
 * SQL 预览
 */
export async function previewSqlStatements(data: {
  variables: {
    name: string;
    pattern: string;
  }[];
  tables: {
    tableName: string;
    conditionExpression: string;
  }[];
}): Promise<string[]> {
  const res = await request.post('api/v2/dlm/previewSqlStatements', {
    data,
  });
  return res?.data?.contents;
}

/**
 * 新建结构比对工单
 * @param data
 * @returns boolean
 */
export async function createStructureComparisonTask(
  data: Partial<CreateStructureComparisonTaskRecord>,
) {
  const res = await request.post(`/api/v2/flow/flowInstances/`, {
    data,
  });
  return res?.data?.contents?.length > 0;
}
/**
 * 查询任务列表
 */
export async function getTaskList<T>(params: {
  connection?: number;
  fuzzySearchKeyword?: string;
  status?: string[];
  taskTypes?: TaskPageType[] | TaskType[];
  searchType?: TaskSearchType;
  flowInstanceId?: number;
  startTime?: number;
  endTime?: number;
  createdByCurrentUser?: boolean;
  approveByCurrentUser?: boolean;
  parentInstanceId?: number;
  connectionId?: string;
  schema?: string;
  creator?: string;
  sort?: string;
  page?: number;
  size?: number;
  projectId?: number[] | number;
}): Promise<IResponseData<TaskRecord<T>>> {
  const res = await request.get('/api/v2/flow/flowInstances/', {
    params,
  });
  return res?.data;
}

/**
 * 查询未完成的任务列表
 */
export async function getUnfinishedTickets(projectId: number): Promise<UnfinishedTickets> {
  const res = await request.get(`/api/v2/collaboration/projects/${projectId}/unfinishedTickets`);
  return res.data;
}

/**
 * 查询周期任务列表
 */
export async function getCycleTaskList<T>(params: {
  connectionId?: number[];
  creator?: string;
  databaseName?: string[];
  id?: number;
  status?: TaskStatus[];
  type?: TaskPageType;
  startTime?: number;
  endTime?: number;
  createdByCurrentUser?: boolean;
  approveByCurrentUser?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<IResponseData<ICycleTaskRecord<T>>> {
  const res = await request.get('/api/v2/schedule/scheduleConfigs', {
    params,
  });
  return res?.data;
}

/**
 * 查询工单任务状态
 */
export async function getTaskStat<T>(params: ITaskStatParam): Promise<Record<TaskType, IStat>> {
  const res = await request.get('/api/v2/collaboration/landingPage/flowInstanceStat', {
    params,
  });
  return res?.data;
}

/**
 * 查询工单与作业 TODO 统计信息
 */
export async function getFlowScheduleTodo<T>(params: IGetFlowScheduleTodoParams): Promise<ITodos> {
  const res = await request.get('/api/v2/collaboration/landingPage/flowScheduleTodoStat', {
    params,
  });
  return res?.data;
}

export async function getDatabasesHistories(params: {
  currentOrganizationId: number;
  limit: number;
}): Promise<IDatabase[]> {
  const res = await request.get('/api/v2/database/databaseAccessHistories', {
    params,
  });
  return res?.data?.contents;
}

/**
 * 查询任务实例的状态
 */
export async function getTaskStatus(ids: number[]): Promise<Record<number, TaskStatus>> {
  const res = await request.get('/api/v2/flow/flowInstances/status', {
    params: {
      id: ids,
    },
  });
  return res?.data;
}

/**
 * 查询任务详情
 */
export async function getTaskDetail(
  id: number,
  ignoreError: boolean = false,
): Promise<TaskDetail<TaskRecordParameters>> {
  const res = await request.get(`/api/v2/flow/flowInstances/${id}`, {
    params: {
      ignoreError,
    },
  });
  return res?.data;
}
/**
 * 查询任务运行结果（仅限"异步任务"，即 TaskType === ASYNC）
 */
export async function getTaskResult(id: number): Promise<ITaskResult> {
  const res = await request.get(`/api/v2/flow/flowInstances/${id}/tasks/result`);
  return res?.data?.contents?.[0] ?? null;
}
/**
 * 查询任务日志
 */
export async function getTaskLog(id: number, logType: CommonTaskLogType): Promise<string> {
  const res = await request.get(`/api/v2/flow/flowInstances/${id}/tasks/log`, {
    params: {
      logType,
    },
  });
  return res?.data;
}

/**
 * 回滚任务
 */
export async function rollbackTask(id: number): Promise<boolean> {
  const res = await request.post(`/api/v2/flow/flowInstances/${id}/tasks/rollback`);
  return !!res?.data;
}

/**
 * 审批（拒绝）任务
 */
export async function rejectTask(id: number, comment: string): Promise<boolean> {
  const res = await request.post(`/api/v2/flow/flowInstances/${id}/reject`, {
    data: {
      comment,
    },
  });
  return !!res?.data;
}
/**
 * 审批（通过）任务
 */
export async function approveTask(id: number, comment: string): Promise<boolean> {
  const res = await request.post(`/api/v2/flow/flowInstances/${id}/approve`, {
    data: {
      comment,
    },
  });
  return !!res?.data;
}
/**
 * 终止任务
 */
export async function stopTask(id: number): Promise<boolean> {
  const res = await request.post(`/api/v2/flow/flowInstances/${id}/cancel`);
  return !!res?.data;
}

/**
 * 撤销任务（创建者）
 */
export async function revokeTask(id: number): Promise<boolean> {
  const res = await request.post(`/api/v2/flow/flowInstances/${id}/cancel`);
  return !!res?.data;
}

/**
 * 执行任务
 */
export async function executeTask(id: number): Promise<boolean> {
  const res = await request.post(`/api/v2/flow/flowInstances/${id}/tasks/execute`);
  return !!res?.data;
}

/**
 * todo: 待后端确认
 */
export async function getTaskExist(name: string): Promise<boolean> {
  const res = await request.get(`/api/v1/task/tasks/exist/`, {
    params: {
      name,
      type: TaskType.ASYNC,
    },
  });
  return res?.data;
}

/**
 * 获取任务流程列表
 */
export async function getTaskFlowList(): Promise<any[]> {
  const result = await request.get('/api/v2/flow/flowConfigs/');
  return result?.data?.contents;
}

/**
 * 获取待我审批的任务流程信息
 */
export async function getTaskMetaInfo(): Promise<{
  pendingApprovalInstanceIds: number[];
}> {
  const result = await request.get('/api/v2/flow/flowInstances/getMetaInfo');
  return result?.data;
}

/**
 * 下载任务流程
 */
export async function downloadTaskFlow(id: number, fileName?: string) {
  if (setting.isUploadCloudStore) {
    const res = await request.post('/api/v2/cloud/specific/Download', {
      data: {
        flowInstanceId: id,
        fileName: fileName,
      },
    });
    if (res?.data) {
      downloadFile(res?.data);
    }
    return;
  }
  downloadFile(
    odc.appConfig.network?.baseUrl?.() +
      `/api/v2/flow/flowInstances/${id}/tasks/download` +
      (fileName ? `?fileName=${fileName}` : ''),
  );
}

/**
 * 查询任务执行结果
 */
export async function getAsyncResultSet(id: number): Promise<IAsyncTaskResultSet[]> {
  const res = await request.get(`/api/v2/flow/flowInstances/${id}/tasks/asyncExecuteResult`);
  return res?.data?.contents;
}

export async function postTaskFile(data: {
  file: any;
  usage: 'import' | 'obclient' | 'async';
}): Promise<boolean> {
  const res = await request.post(`/api/v2/file/files`, {
    data,
  });
  return !!res?.data;
}

export function getAsyncTaskUploadUrl() {
  return odc.appConfig.network?.baseUrl?.() + '/api/v2/objectstorage/async/files/batchUpload';
}

/**
 * 下载文件
 */
export async function getTaskFile(taskId: number, objectId: string[]): Promise<string[]> {
  const downloadInfo = await request.post(
    `/api/v2/flow/flowInstances/${taskId}/tasks/async/batchGetDownloadUrl`,
    {
      data: objectId,
    },
  );
  return downloadInfo?.data?.contents ?? [];
}

/**
 * 下载文件（结构比对任务）
 * @param taskId
 * @param objectId
 * @returns
 */
export async function getStructureComparisonTaskFile(
  taskId: number,
  objectId: string[],
): Promise<string[]> {
  const downloadInfo = await request.post(
    `/api/v2/flow/flowInstances/${taskId}/tasks/structure-comparison/batchGetDownloadUrl`,
    {
      data: objectId,
    },
  );
  return downloadInfo?.data?.contents ?? [];
}

/**
 * 查询分区候选表集合
 */
export async function getPartitionPlanTables(
  sessionId: string,
  databaseId: number,
): Promise<IResponseData<IPartitionPlanTable>> {
  const res = await request.get(
    `/api/v2/connect/sessions/${sessionId}/databases/${databaseId}/candidatePartitionPlanTables`,
    {
      params: {
        sessionId,
        databaseId,
      },
    },
  );
  return res?.data;
}

/**
 * 查询分区候选表分区键类型集合
 */
export async function getPartitionPlanKeyDataTypes(
  sessionId: string,
  databaseId: number,
  tableName: string,
): Promise<IResponseData<IPartitionPlanKeyType>> {
  const res = await request.get(
    `/api/v2/connect/sessions/${sessionId}/databases/${databaseId}/candidatePartitionPlanTables/${tableName}/getPartitionKeyDataTypes`,
    {
      params: {
        sessionId,
        databaseId,
        tableName,
      },
    },
  );
  return res?.data;
}

/*
 * 发起结构分析任务
 */
export async function startShadowSyncAnalysis(
  databaseId: number,
  connectionId: number,
  originTableNames: string[],
  destTableNames: string[],
) {
  const result = await request.post('/api/v2/schema-sync/shadowTableSyncs', {
    data: {
      connectionId,
      databaseId,
      originTableNames,
      destTableNames,
    },
  });
  return result?.data;
}
/**
 * 获取结构同步任务的结果
 */
export async function getShadowSyncAnalysisResult(
  taskId: string,
): Promise<IShadowSyncAnalysisResult> {
  const result = await request.get(`/api/v2/schema-sync/shadowTableSyncs/${taskId}`);
  return result?.data;
}

/**
 * 查看某个影子表同步记录详情
 */
export async function getShadowSyncAnalysisRecordResult(
  taskId: string,
  recordId: number,
): Promise<IShadowSyncAnalysisResult['tables'][number]> {
  const result = await request.get(
    `/api/v2/schema-sync/shadowTableSyncs/${taskId}/tables/${recordId}`,
  );
  return result?.data;
}

export async function setShadowSyncRecordStatus(
  taskId: string,
  tableComparingIds: number[],
  skip: boolean,
) {
  const res = await request.post(
    `/api/v2/schema-sync/shadowTableSyncs/${taskId}/tables/batchSetSkipped`,
    {
      data: {
        setSkip: skip,
        tableComparingIds,
      },
    },
  );
  return res?.data?.contents;
}

export async function getFlowSQLLintResult(flowId: number, nodeId: number) {
  const res = await request.get(`/api/v2/flow/flowInstances/${flowId}/tasks/${nodeId}/result`);
  return res?.data?.contents?.[0];
}

/**
 * 查询无锁结构变更的子任务
 */
export async function getSubTask(id: number): Promise<IResponseData<ISubTaskRecords>> {
  const res = await request.get(`/api/v2/flow/flowInstances/${id}/tasks/result`);
  return res?.data;
}

/**
 * 切换表名
 */
export async function swapTableName(taskId: number): Promise<boolean> {
  const res = await request.post(`/api/v2/osc/swapTable/${taskId}`);
  return !!res?.data;
}

/**
 * 获取数据源用户列表
 */
export async function getDatasourceUsers(
  datasourceId: number,
): Promise<IResponseData<IDatasourceUser>> {
  const res = await request.get(`/api/v2/datasource/datasources/${datasourceId}/users`);
  return res?.data;
}

/**
 * 查询项目列表
 */
export async function getProjectList(archived: boolean): Promise<IResponseData<IProject>> {
  const res = await request.get('/api/v2/collaboration/projects/basic', {
    params: {
      archived,
    },
  });
  return res?.data;
}

/**
 * 查询当前数据库是否需要锁表
 */
export async function getLockDatabaseUserRequired(databaseId: number): Promise<{
  lockDatabaseUserRequired: boolean; // 是否只能是锁用户
  isDbEnableLockPriorityFlagSet: boolean; // 是否能锁表
  databaseId: number;
}> {
  const res = await request.get(`/api/v2/osc/lockDatabaseUserRequired/${databaseId}`);
  return res?.data;
}

/**
 * 更新无锁结构变更限流配置
 */
export async function updateThrottleConfig(
  flowInstanceId: number,
  rateLimitConfig: {
    rowLimit?: number;
    dataSizeLimit?: number;
  },
): Promise<boolean> {
  const res = await request.post(`/api/v2/osc/updateRateLimitConfig`, {
    data: {
      flowInstanceId,
      rateLimitConfig,
    },
  });
  return !!res?.data;
}

/**
 * 获取结构比对中涉及的表信息
 * @param taskId 结构比对工单id
 * @param params.operationType 要筛选的任务结果类型
 */
export async function getStructrueComparison(
  taskId: number,
  params?: {
    dbObjectName?: string;
    operationType?: EOperationType;
    page?: number;
    size?: number;
  },
): Promise<IComparisonResultData> {
  const res = await request.get(`/api/v2/schema-sync/structureComparison/${taskId}`, {
    params,
  });
  return res?.data;
}
/**
 * 获取结构比对中表的详情
 * @param taskId
 * @param structureComparisonId
 * @returns
 */
export async function getStructrueComparisonDetail(
  taskId: number,
  structureComparisonId: number,
): Promise<IStructrueComparisonDetail> {
  const res = await request.get(
    `/api/v2/schema-sync/structureComparison/${taskId}/${structureComparisonId}`,
  );
  return res?.data;
}

/**
 * 重试
 * 无锁结构变更 执行异常时发起重试
 */
export async function againTask(data: Partial<AgainTaskRecord>): Promise<number> {
  const res = await request.post(`/api/v2/osc/${data.id}/resume`);

  return res?.successful;
}

/**
 * 无锁结构变更阿里云检查用户OMS资源
 */
export async function queryOmsWorkerInstance(): Promise<{
  successful: boolean;
  data: { hasUnconfiguredProject?: boolean };
}> {
  const res = await request.get(`/api/v2/aliyun/osc/queryOmsWorkerInstance`);

  if (res.successful) {
    return {
      successful: res.successful,
      data: JSON.parse(res.data || {}),
    };
  }
  return res;
}

/** --------- shchedule 导出  -------- **/

/**
 * 提交导出任务
 */
export async function exportSchedulesTask(params: {
  ids: number[];
  scheduleType: TaskType;
}): Promise<string> {
  const res = await request.post(`/api/v2/export/exportSchedule`, {
    data: params,
  });
  return res?.data;
}

/**
 * 获取导出任务详情列表
 */
export async function getExportListView(params: {
  ids: number[];
  scheduleType: ScheduleType;
}): Promise<ScheduleExportListView[]> {
  const res = await request.post(`/api/v2/export/getExportListView`, {
    data: params,
  });
  return res?.data;
}

/**
 * 获取导出任务的结果
 * @returns
 */
export async function getExportSchedulesResult(exportId: number): Promise<FileExportResponse> {
  const res = await request.get(`/api/v2/export/getExportResult?exportId=${exportId}`);
  return res?.data;
}

/**
 * 获取导出任务的日志
 * @returns
 */
export async function getExportTaskLog({ exportId }: { exportId: string }): Promise<string> {
  const res = await request.get(`/api/v2/export/getExportLog?exportId=${exportId}`);
  return res?.data;
}

/**
 * 提交预览导入任务
 */
export async function startSchedulePreviewTask(
  params: IScheduleTaskImportRequest,
): Promise<string> {
  const res = await request.post('/api/v2/import/startSchedulePreviewTask', {
    data: params,
  });
  return res?.data;
}

/**
 * 预览详情
 */
export async function getSchedulePreviewResult(
  previewId: string,
): Promise<IImportScheduleTaskView[] | { errMsg: string; isError: boolean }> {
  const res = await request.get(`/api/v2/import/getSchedulePreviewResult?previewId=${previewId}`, {
    params: { ignoreError: true },
  });
  if (res?.isError) {
    return res;
  }
  return res?.data;
}

/**
 * 发起导入
 */
export async function startScheduleImportTask(params: IScheduleTaskImportRequest): Promise<string> {
  const res = await request.post(`/api/v2/import/startScheduleImportTask`, {
    data: params,
  });
  return res?.data;
}

/**
 * 导入详情
 */
export async function getScheduleImportResult(importTaskId: string): Promise<IImportTaskResult[]> {
  const res = await request.get(
    `/api/v2/import/getScheduleImportResult?importTaskId=${importTaskId}`,
  );
  return res?.data;
}

/**
 * 导入日志
 */
export async function getScheduleImportLog(importTaskId: string): Promise<string> {
  const res = await request.get(`/api/v2/import/getScheduleImportLog?importTaskId=${importTaskId}`);
  return res?.data;
}

/** --------- task 终止  -------- **/

/**
 * 工单任务终止-发起
 */
export async function cancelFlowInstance(data: ITaskTerminateCmd): Promise<string> {
  const res = await request.post(`/api/v2/flow/flowInstances/asyncCancel`, {
    data,
  });
  return res?.data;
}

/**
 * 工单任务终止-查看
 */
export async function getBatchCancelResult(
  terminateId: string,
): Promise<IBatchTerminateFlowResult[]> {
  const res = await request.get(
    `/api/v2/flow/flowInstances/asyncCancelResult?terminateId=${terminateId}`,
  );
  return res?.data;
}

/**
 * 工单任务终止-查看日志
 */
export async function getBatchCancelLog(terminateId: string): Promise<string> {
  const res = await request.get(
    `/api/v2/flow/flowInstances/asyncCancelLog?terminateId=${terminateId}`,
  );
  return res?.data;
}

export interface IResponseDataWithStats<T, S = any> extends IResponseData<T> {
  stats: S;
}

/** 多库变更-执行记录列表 */
export async function getMultipleAsyncExecuteRecordList(params: {
  id: number;
  size: number;
  page: number;
  statuses?: string[];
  keyword?: string;
}): Promise<IResponseDataWithStats<IMultipleAsyncExecuteRecord, MultipleAsyncExecuteRecordStats>> {
  const { id } = params;
  const res = await request.get(`/api/v2/flow/flowInstances/${id}/tasks/multiAsyncResults`, {
    params: omit(params, 'id'),
  });
  return res?.data;
}

export async function downLoadRollbackPlanFile(id: number, databaseId: number): Promise<string> {
  const res = await request.get(`/api/v2/flow/flowInstances/${id}/tasks/rollbackPlan/download`, {
    params: {
      databaseId,
      download: true,
    },
  });
  return res?.data;
}
