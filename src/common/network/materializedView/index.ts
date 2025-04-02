import request from '@/util/request';
import { encodeObjName } from '@/util/utils';
import { Base64 } from 'js-base64';
import sessionManager from '@/store/sessionManager';
import { convertMaterializedViewToTable, convertCreateMaterializedViewData } from './helper';
import { IMaterializedView, MaterializedViewRecord, SyncMethods } from '@/d.ts';
import notification from '@/util/notification';
import { formatMessage } from '@/util/intl';

export async function getMaterializedView(params: {
  materializedViewName: string;
  sessionId: string;
  dbName: string;
}): Promise<IMaterializedView> {
  const { materializedViewName, sessionId, dbName } = params;
  const res = await request.get(
    `/api/v2/connect/sessions/${sessionId}/databases/${dbName}/materializedViews/${encodeObjName(
      Base64.encode(materializedViewName),
    )}`,
  );
  const session = sessionManager.sessionMap.get(sessionId);
  return convertMaterializedViewToTable(res?.data, session?.connection?.dialectType);
}

export async function generateCreateMaterializedViewSql(params: {
  data: any;
  sessionId: string;
  materializedViewName: string;
  dbName: string;
}): Promise<string> {
  const { materializedViewName, sessionId, dbName, data } = params;
  const session = sessionManager.sessionMap.get(sessionId);
  const res = await request.post(
    `/api/v2/connect/sessions/${sessionId}/databases/${dbName}/materializedViews/${materializedViewName}/generateCreateDDL`,
    {
      data: convertCreateMaterializedViewData(data, session?.connection?.dialectType),
    },
  );
  return res?.data;
}

export async function syncMaterializedView(params: {
  dbName: string;
  sessionId: string;
  materializedViewName: string;
  method: SyncMethods;
  parallelismDegree: number;
}): Promise<boolean> {
  const { materializedViewName: mvName, dbName, method, sessionId, parallelismDegree } = params;
  const res = await request.post(
    `/api/v2/connect/sessions/${sessionId}/databases/${dbName}/materializedViews/${mvName}/refresh`,
    {
      data: {
        databaseName: dbName,
        mvName,
        method,
        parallelismDegree,
      },
    },
  );
  return res?.data;
}

export async function getRefreshRecords(params: {
  dbName: string;
  sessionId: string;
  materializedViewName: string;
  queryLimit: number;
}): Promise<MaterializedViewRecord[]> {
  const { materializedViewName, sessionId, dbName, queryLimit } = params;
  const res = await request.get(
    `/api/v2/connect/sessions/${sessionId}/databases/${dbName}/materializedViews/${materializedViewName}/refreshRecords`,
    {
      params: { queryLimit },
    },
  );
  return res?.data?.contents;
}

export async function generateUpdateMaterializedViewDDL(params: {
  newData: Partial<IMaterializedView>;
  oldData: Partial<IMaterializedView>;
  sessionId: string;
  dbName: string;
}): Promise<{ sql: string; tip: string }> {
  const { newData, oldData, sessionId, dbName } = params;
  const session = sessionManager.sessionMap.get(sessionId);
  const res = await request.post(
    `/api/v2/connect/sessions/${sessionId}/databases/${encodeObjName(
      dbName,
    )}/tables/generateUpdateTableDDL`,
    {
      data: {
        previous: convertCreateMaterializedViewData(oldData, session?.connection?.dialectType),
        current: convertCreateMaterializedViewData(newData, session?.connection?.dialectType),
      },
    },
  );
  if (!res?.data?.sql) {
    notification.error({
      track: formatMessage({
        id: 'odc.network.table.CurrentlyNoSqlCanBe',
        defaultMessage: '当前无 SQL 可提交',
      }), //当前无 SQL 可提交
    });
  }
  return res?.data || { sql: '', tip: '' };
}
