import { IConnectionProperty, IDatabaseSession } from '@/d.ts';
import { ConnectionPropertyType } from '@/d.ts/datasource';
import request from '@/util/request';
import { generateVarSid } from './pathUtil';

/**
 * 根据函数获取ddl sql
 */
export async function getVariableUpdateDML(
  newData: IConnectionProperty,
  type: ConnectionPropertyType,
  sessionId?: string,
) {
  const sid = generateVarSid(type, sessionId);
  const { key, value } = newData;
  const url = `/api/v1/variables/getUpdateSql/${sid}`;

  const result = await request.patch(url, {
    data: {
      changed: true,
      key,
      value,
    },
  });

  return result?.data?.sql;
}

export async function executeVariableUpdateDML(
  sql: string,
  type: ConnectionPropertyType,
  sessionId: string,
) {
  const sid = generateVarSid(type, sessionId);
  const url = `/api/v1/variables/execute/${sid}`;

  const result = await request.patch(url, {
    params: {
      wantCatchError: true,
    },
    data: {
      sid,
      sql,
    },
  });

  return result?.data?.status;
}

export async function fetchVariableList(type: ConnectionPropertyType, sessionId: string) {
  const sid = generateVarSid(type, sessionId);
  const res = await request.get(`/api/v1/variables/list/${sid}`);
  return (
    res?.data?.map((p: IConnectionProperty) => {
      return {
        ...p,
        initialValue: p.value,
        modified: false,
      };
    }) || []
  );
}

export async function getDatabaseSessionList(sessionId: string): Promise<IDatabaseSession[]> {
  const res = await request.get(
    `/api/v1/dbsession/list/${generateVarSid(ConnectionPropertyType.GLOBAL, sessionId)}`,
  );
  return res?.data || [];
}

export async function killSessions(
  sessionIds: string[],
  datasourceId: number,
  killType: 'session' | 'query',
): Promise<
  {
    sessionId: number;
    killed: boolean;
    errorMessage?: string;
  }[]
> {
  const res = await request.post(`/api/v2/datasource/sessions/killSession`, {
    data: {
      sessionIds,
      datasourceId,
      killType,
    },
  });
  return res?.data;
}
