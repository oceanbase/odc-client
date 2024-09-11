import { IResponse, IResponseData } from '@/d.ts';
import {
  ILogicalDatabase,
  IPreviewSql,
  ISchemaChangeRecord,
  ITopology,
  ILogicalTable,
} from '@/d.ts/logicalDatabase';
import request from '@/util/request';
import { PreviewLogicalTableTopologiesErrorEnum } from '@/d.ts/database';

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
): Promise<ITopology[] | false> {
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
  if (
    [
      PreviewLogicalTableTopologiesErrorEnum.LogicalTableBadExpressionSyntax,
      PreviewLogicalTableTopologiesErrorEnum.LogicalTableExpressionNotEvenlyDivided,
      PreviewLogicalTableTopologiesErrorEnum.LogicalTableExpressionNotPositiveStep,
      PreviewLogicalTableTopologiesErrorEnum.LogicalTableExpressionNotPositiveStep,
      PreviewLogicalTableTopologiesErrorEnum.LogicalTableExpressionRangeStartGreaterThanEnd,
    ].includes(res.errCode)
  ) {
    return false;
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
/* schedule->task(仅有一个task)->physicalDatabases(逻辑库特殊的资源) */
export async function getPhysicalExecuteDetails(
  scheduleTaskId: number,
  physicalDatabaseId: number,
): Promise<ISchemaChangeRecord> {
  const res = await request.get(
    `/api/v2/logicaldatabase/scheduleTasks/${scheduleTaskId}/physicalDatabases/${physicalDatabaseId}`,
  );
  return res?.data;
}

/* 终止某个物理库 SQL 执行 */
export async function stopPhysicalSqlExecute(
  scheduleTaskId: number,
  physicalDatabaseId: number,
): Promise<boolean> {
  const res = await request.post(
    `/api/v2/logicaldatabase/scheduleTasks/${scheduleTaskId}/physicalDatabases/${physicalDatabaseId}/terminateCurrentStatement`,
  );
  return res?.data;
}

/* 跳过某个物理库 SQL 执行 */
export async function skipPhysicalSqlExecute(
  scheduleTaskId: number,
  physicalDatabaseId: number,
): Promise<boolean> {
  const res = await request.post(
    `/api/v2/logicaldatabase/scheduleTasks/${scheduleTaskId}/physicalDatabases/${physicalDatabaseId}/skipCurrentStatement`,
  );
  return res?.data;
}
