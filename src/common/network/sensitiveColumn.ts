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

import { IDataType, IResponseData } from '@/d.ts';
import { ISensitiveColumn } from '@/d.ts/sensitiveColumn';
import { IServerTableColumn } from '@/d.ts/table';
import request from '@/util/request';
import { DatabaseColumn } from '@/page/Project/Sensitive/components/SensitiveColumn/components/interface';

export async function startScanning(
  projectId: number,
  params: {
    connectionId: number;
    allDatabases: boolean;
    databaseIds: number[];
    allSensitiveRules: boolean;
    sensitiveRuleIds: number[];
    scanningMode?: string;
  },
): Promise<string> {
  const ret = await request.post(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/startScanning`,
    {
      data: {
        ...params,
      },
    },
  );
  return ret?.data?.taskId;
}

// 新增单表扫描API
export async function scanSingleTableAsync(
  projectId: number,
  params: {
    databaseId: number;
    tableName: string;
    scanningMode?: string;
  },
): Promise<string> {
  // 导入login store来检查organizationId
  const login = require('@/store/login').default;
  console.log('发起单表扫描请求:', { projectId, params });
  console.log('当前organizationId:', login?.organizationId);
  console.log('当前用户信息:', login?.user);

  try {
    const ret = await request.post(
      `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/scanSingleTableAsync`,
      {
        data: {
          ...params,
        },
        params: {
          currentOrganizationId: login?.organizationId,
        },
      },
    );
    console.log('单表扫描请求响应:', ret);
    // 后端直接返回taskId在data字段中，而不是data.taskId
    const taskId = ret?.data?.taskId || ret?.data;
    if (!taskId) {
      console.error('单表扫描请求返回的taskId为空:', ret);
    }
    return taskId;
  } catch (error) {
    console.error('单表扫描请求失败:', error);
    throw error;
  }
}

// 获取单表扫描结果
export async function getSingleTableScanResult(projectId: number, taskId: string): Promise<any> {
  // 导入login store来检查organizationId
  const login = require('@/store/login').default;
  console.log('获取单表扫描结果:', { projectId, taskId });
  console.log('当前organizationId:', login?.organizationId);

  try {
    const ret = await request.get(
      `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/singleTableScan/${taskId}/result`,
      {
        params: {
          currentOrganizationId: login?.organizationId,
        },
      },
    );
    console.log('单表扫描结果响应:', ret);
    return ret?.data;
  } catch (error) {
    console.error('获取单表扫描结果失败:', error);
    throw error;
  }
}

export async function setEnabled(
  projectId: number,
  id: number,
  enabled: boolean,
): Promise<boolean> {
  const ret = await request.post(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/${id}/setEnabled`,
    {
      data: { enabled },
    },
  );
  return ret?.successful;
}

export async function listSensitiveColumns(
  projectId: number,
  params?: Partial<{
    fuzzyTableColumn: string;
    datasource: number[];
    database: number[];
    table: string[];
    column: string[];
    maskingAlgorithm: number[];
    enabled: boolean[];
  }>,
): Promise<IResponseData<ISensitiveColumn>> {
  const ret = await request.get(`/api/v2/collaboration/projects/${projectId}/sensitiveColumns/`, {
    params,
  });
  return ret?.data;
}

export async function listColumns(
  projectId: number,
  database: number[],
): Promise<{
  contents: DatabaseColumn[];
}> {
  const result = await request.get(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/listColumns`,
    {
      params: {
        database,
      },
    },
  );
  return result?.data || {};
}

export enum ScannResultType {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
export interface IScannResult {
  taskId: string;
  status: ScannResultType;
  sensitiveColumns: ISensitiveColumn[];
  allTableCount: number;
  finishedTableCount: number;
  createTime: number;
  completeTime: number;
  errorCode: {};
  errorMsg: string;
}

export async function getScanningResults(projectId: number, taskId: string): Promise<IScannResult> {
  const ret = await request.get(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/getScanningResults`,
    {
      params: { taskId },
    },
  );
  return ret?.data;
}

export async function stopScanning(projectId: number, taskId: string): Promise<boolean> {
  const ret = await request.post(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/stopScanning`,
    {
      params: { taskId },
    },
  );
  return ret?.data;
}

export async function batchUpdateSensitiveColumn(
  projectId: number,
  params?: Partial<{
    sensitiveColumnIds: number[];
    maskingAlgorithmId: number;
  }>,
): Promise<boolean> {
  const ret = await request.put(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/batchUpdate`,
    {
      data: {
        ...params,
      },
    },
  );
  return ret?.successful;
}

export async function batchDeleteSensitiveColumns(
  projectId: number,
  params?: number[],
): Promise<boolean> {
  const ret = await request.delete(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/batchDelete`,
    { data: params },
  );
  return ret?.successful;
}

export async function batchCreateSensitiveColumns(
  projectId: number,
  params: ISensitiveColumn[],
): Promise<boolean> {
  const ret = await request.post(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/batchCreate`,
    { data: params },
  );
  return ret?.successful;
}

export async function statsSensitiveColumns(projectId: number) {
  const res = await request.get(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/stats`,
  );
  return (
    res?.data || {
      datasource: { distinct: [] },
      database: { distinct: [] },
      maskingAlgorithmId: { distinct: [] },
    }
  );
}
