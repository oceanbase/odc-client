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

import {
  ILogicDatabaseChangeExecuteRecord,
  IResponse,
  IResponseData,
  ISqlExecuteResultStatus,
  LogicDatabaseChangeExecuteRecordStats,
} from '@/d.ts';
import { PreviewLogicalTableTopologiesErrorEnum } from '@/d.ts/database';
import {
  ILogicalDatabase,
  ILogicalTable,
  IPreviewSql,
  ISchemaChangeRecord,
  ITopology,
} from '@/d.ts/logicalDatabase';
import request from '@/util/request';
import { omit } from 'lodash';
import type { IResponseDataWithStats } from '@/common/network/task';

export async function extractLogicalTables(logicalDatabaseId: number) {
  const res = await request.post(
    `/api/v2/connect/logicaldatabase/logicalDatabases/${logicalDatabaseId}/logicalTables/extract`,
  );
  return res?.data;
}

export async function logicalDatabaseDetail(
  logicalDatabaseId?: number,
): Promise<IResponse<ILogicalDatabase>> {
  const res = await request.get(
    `/api/v2/connect/logicaldatabase/logicalDatabases/${logicalDatabaseId}`,
  );
  return res;
}

export async function deleteLogicalTable(
  logicalDatabaseId: number,
  logicalTableId: number,
): Promise<IResponseData<boolean>> {
  const res = await request.delete(
    `/api/v2/connect/logicaldatabase/logicalDatabases/${logicalDatabaseId}/logicalTables/${logicalTableId}`,
  );
  return res?.data;
}

export async function deleteLogicalDatabse(
  logicalDatabaseId: number,
): Promise<IResponseData<boolean>> {
  const res = await request.delete(
    `/api/v2/connect/logicaldatabase/logicalDatabases/${logicalDatabaseId}`,
  );
  return res?.data;
}

export async function createLogicalDatabase(data: {
  projectId: number;
  name: string;
  alias: string;
  physicalDatabaseIds: number[];
}): Promise<ILogicalDatabase> {
  const res = await request.post('/api/v2/connect/logicaldatabase/logicalDatabases', {
    data,
  });
  return res?.data;
}

export async function checkLogicalTable(
  logicalDatabaseId: number,
  logicalTableId: number,
): Promise<IResponseData<boolean>> {
  const res = await request.post(
    `/api/v2/connect/logicaldatabase/logicalDatabases/${logicalDatabaseId}/logicalTables/${logicalTableId}/checkStructureConsistency`,
  );
  return res?.data;
}

export async function getLogicalTable(
  logicalDatabaseId: number,
  logicalTableId: number,
): Promise<ITopology[]> {
  const res = await request.get(
    `/api/v2/connect/logicaldatabase/logicalDatabases/${logicalDatabaseId}/logicalTables/${logicalTableId}/topologies`,
  );
  return res?.data?.contents;
}

export async function getLogicalTableDetail(
  logicalDatabaseId: number,
  logicalTableId: number,
): Promise<ILogicalTable> {
  const res = await request.get(
    `/api/v2/connect/logicaldatabase/logicalDatabases/${logicalDatabaseId}/logicalTables/${logicalTableId}`,
  );
  return res?.data;
}

export async function previewLogicalTableTopologies(
  logicalDatabaseId: number,
  expression: string,
): Promise<ITopology[] | string> {
  const res = await request.post(
    `/api/v2/connect/logicaldatabase/logicalDatabases/${logicalDatabaseId}/previewLogicalTableTopologies?expression=${encodeURIComponent(
      expression,
    )}`,
    {
      params: {
        ignoreError: true,
      },
    },
  );
  if (res.errCode) {
    return res?.errMsg;
  }
  return res?.data?.contents;
}

/* 预览 SQL */
export async function previewSqls(
  logicalDatabaseId: number,
  data: { sql: string; delimiter: string },
): Promise<IPreviewSql[]> {
  const res = await request.post(
    `/api/v2/connect/logicaldatabase/logicaldatabases/${logicalDatabaseId}/previewSqls`,
    {
      data,
    },
  );
  return res?.data?.contents;
}

/* 查看某个物理库sql执行详情 */
export async function getPhysicalExecuteDetails(
  flowInstanceId: number,
  physicalDatabaseId: number,
  statuses?: ISqlExecuteResultStatus[],
): Promise<ISchemaChangeRecord> {
  const res = await request.get(
    `/api/v2/logicaldatabase/flowTasks/${flowInstanceId}/physicalDatabases/${physicalDatabaseId}`,
    {
      params: { statuses },
    },
  );
  return res?.data;
}

/* 终止某个物理库 SQL 执行 */
export async function stopPhysicalSqlExecute(
  flowInstanceId: number,
  physicalDatabaseId: number,
): Promise<boolean> {
  const res = await request.post(
    `/api/v2/logicaldatabase/flowTasks/${flowInstanceId}/physicalDatabases/${physicalDatabaseId}/terminateCurrentStatement`,
  );
  return res?.data;
}

/* 跳过某个物理库 SQL 执行 */
export async function skipPhysicalSqlExecute(
  flowInstanceId: number,
  physicalDatabaseId: number,
): Promise<boolean> {
  const res = await request.post(
    `/api/v2/logicaldatabase/flowTasks/${flowInstanceId}/physicalDatabases/${physicalDatabaseId}/skipCurrentStatement`,
  );
  return res?.data;
}

export async function getLogicDatabaseChangeExecuteRecordList(params: {
  id: number;
  size: number;
  page: number;
  statuses?: string[];
  databaseKeyword?: string;
  datasourceKeyword?: string;
}): Promise<
  IResponseDataWithStats<ILogicDatabaseChangeExecuteRecord, LogicDatabaseChangeExecuteRecordStats>
> {
  const { id } = params;
  const res = await request.get(`api/v2/logicaldatabase/${id}`, {
    params: omit(params, 'id'),
  });
  return res?.data;
}
