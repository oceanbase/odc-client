import { ISensitiveColumn } from '@/d.ts/sensitiveColumn';
import request from '@/util/request';

export async function updateSensitiveColumn(
  id: number,
  sensitiveColumn: ISensitiveColumn,
): Promise<boolean> {
  const ret = await request.put(`/api/v2/sensitive/columns/${id}`, {
    data: sensitiveColumn,
  });
  return ret?.successful;
}

export async function startScanning(
  projectId: number,
  params: {
    connectionId: number;
    allDatabases: boolean;
    databaseIds: number[];
    allSensitiveRules: boolean;
    sensitiveRuleIds: number[];
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
  queryParams?: Partial<{
    fuzzyTableColumn: string;
    datasource: number[];
    database: number[];
    table: string[];
    column: string[];
    maskingAlgorithm: number[];
    enabled: boolean[];
  }>,
): Promise<ISensitiveColumn[]> {
  const ret = await request.get(`/api/v2/collaboration/projects/${projectId}/sensitiveColumns/`, {
    params: queryParams,
  });
  return ret?.data?.contents;
}

export enum ScannResultType {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
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
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/getScanningResults?taskId=${taskId}`,
  );
  return ret?.data;
}

export async function detailSensitiveColumn(
  projectId: number,
  id: number,
): Promise<ISensitiveColumn> {
  const ret = await request.get(
    `/api/v2/collaboration/projects/${projectId}/sensitiveColumns/${id}`,
  );
  return ret?.data?.contents;
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
