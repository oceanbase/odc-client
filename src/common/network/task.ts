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

import { IShadowSyncAnalysisResult } from '@/component/Task/ShadowSyncTask/CreateModal/interface';
import {
  CommonTaskLogType,
  CreateTaskRecord,
  IPartitionTablePreviewConfig,
  CycleTaskDetail,
  IAsyncTaskResultSet,
  ICycleSubTaskRecord,
  ICycleTaskRecord,
  IFunction,
  IPartitionPlan,
  IPartitionPlanTable,
  IPartitionPlanKeyType,
  IResponseData,
  ISubTaskRecords,
  ITaskResult,
  TaskDetail,
  TaskPageType,
  TaskRecord,
  TaskRecordParameters,
  TaskStatus,
  TaskType,
  IDatasourceUser,
  CreateStructureComparisonTaskRecord,
} from '@/d.ts';
import setting from '@/store/setting';
import request from '@/util/request';
import { downloadFile } from '@/util/utils';
import { IProject } from '@/d.ts/project';
import { generateFunctionSid } from './pathUtil';
import { EOperationType, IComparisonResultData, IStructrueComparisonDetail } from '@/d.ts/task';

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
 * 任务：涵盖 导入，导出，异步，模拟数据，权限申请共计 5 种类型
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
  return res?.data?.contents || [];
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
  taskType?: TaskPageType | TaskType;
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
}): Promise<IResponseData<TaskRecord<TaskRecordParameters>>> {
  const res = await request.get('/api/v2/flow/flowInstances/', {
    params,
  });
  return res?.data;
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
 * 查询周期任务详情
 */
export async function getCycleTaskDetail<T>(id: number): Promise<CycleTaskDetail<T>> {
  const res = await request.get(`/api/v2/schedule/scheduleConfigs/${id}`);
  return res?.data;
}

/**
 * 查询任务列表
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
 * 查询周期任务日志
 */
export async function getCycleTaskLog(
  scheduleId: number,
  taskId: number,
  logType: CommonTaskLogType,
): Promise<string> {
  const res = await request.get(`/api/v2/schedule/schedules/${scheduleId}/tasks/${taskId}/log`, {
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
    const res = await request.post('/api/v2/aliyun/specific/Download', {
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
    window.ODCApiHost +
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
  return window.ODCApiHost + '/api/v2/objectstorage/async/files/batchUpload';
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
 * 下载文件（周期任务）
 */
export async function getCycleTaskFile(taskId: number, objectId: string[]): Promise<string[]> {
  const downloadInfo = await request.post(
    `/api/v2/schedule/${taskId}/jobs/async/batchGetDownloadUrl`,
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

/**
 * 查询分区策略详情
 */
export async function getPartitionPlan(taskId: number): Promise<IPartitionPlan> {
  const res = await request.get(
    `/api/v2/flow/flowInstances/${taskId}/tasks/partitionPlans/getDetail`,
    {
      params: {
        id: taskId,
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
  return res?.data?.contents?.[0]?.sqlCheckResult?.results;
}

/**
 * 获取子任务
 */
export async function getDataArchiveSubTask(
  taskId: number,
): Promise<IResponseData<ICycleSubTaskRecord>> {
  const res = await request.get(`/api/v2/schedule/schedules/${taskId}/tasks`);
  return res?.data;
}

/**
 * 更新分区计划
 */
export async function rollbackDataArchiveSubTask(taskId: number, subTaskId): Promise<boolean> {
  const res = await request.put(`/api/v2/schedule/schedules/${taskId}/tasks/${subTaskId}/rollback`);
  return !!res?.data;
}

export async function startDataArchiveSubTask(taskId: number, subTaskId): Promise<boolean> {
  const res = await request.put(`/api/v2/schedule/schedules/${taskId}/tasks/${subTaskId}/start`);
  return !!res?.data;
}

export async function stopDataArchiveSubTask(taskId: number, subTaskId): Promise<boolean> {
  const res = await request.put(
    `/api/v2/schedule/schedules/${taskId}/tasks/${subTaskId}/interrupt`,
  );
  return !!res?.data;
}

/**
 * 查询无锁结构变更的子任务
 */
export async function getSubTask(id: number): Promise<IResponseData<ISubTaskRecords>> {
  const res = await request.get(`/api/v2/flow/flowInstances/${id}/tasks/result`);
  return res?.data;
}

/*
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
  lockDatabaseUserRequired: boolean;
  databaseId: number;
}> {
  const res = await request.get(`/api/v2/osc/lockDatabaseUserRequired/${databaseId}`);
  return res?.data;
}
/*
 * 更新限流配置
 */
export async function updateLimiterConfig(
  taskId: number,
  data: {
    rowLimit?: number;
    dataSizeLimit?: number;
  },
): Promise<boolean> {
  const res = await request.put(`/api/v2/schedule/schedules/${taskId}/dlmRateLimitConfiguration`, {
    data,
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
