import { ITableModel, TableColumn } from '@/page/Workspace/components/CreateTable/interface';
import connection from '@/store/connection';
import schema from '@/store/schema';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import request from '@/util/request';
import { encodeObjName } from '@/util/utils';
import { generateDatabaseSid, generateTableSid } from '../pathUtil';
import { convertServerTableToTable, convertTableToServerTable } from './helper';

export async function getTableColumnList(tableName: string, databaseName?: string) {
  if (tableName) {
    const sid = generateTableSid(tableName, databaseName);
    const r = await request.get(`/api/v1/column/list/${sid}`);
    return ((r && r.data) || []).map((c) => ({
      ...c,
      name: c.columnName,
      type: c.dataType,
    }));
  }
  return [];
}

export async function tableModify(sql: string, tableName: string) {
  const sid = generateDatabaseSid();
  const res = await request.post(`/api/v1/schema/tableModify/${sid}`, {
    data: {
      sid,
      sql,
      tag: tableName || '',
    },
  });

  return res?.data;
}

export async function getTableInfo(
  tableName: string,
  databaseName: string,
  sessionId: string,
): Promise<Partial<ITableModel>> {
  const res = await request.get(
    `/api/v2/connect/sessions/${sessionId}/databases/${encodeObjName(
      databaseName,
    )}/tables/${encodeObjName(tableName)}`,
  );

  return convertServerTableToTable(res?.data);
}

export async function queryTableOrViewData(
  dbName: string,
  tableOrViewName: string,
  queryLimit: number,
  addRowID?: boolean,
) {
  const sid = generateDatabaseSid();
  const res = await request.post(`/api/v2/connect/sessions/${sid}/queryData`, {
    data: {
      schemaName: dbName,
      tableOrViewName,
      queryLimit,
      addROWID: addRowID,
    },
  });

  return res?.data;
}

export async function queryIdentities(types: string[]) {
  const sid = generateDatabaseSid();
  const res = await request.get(`/api/v2/connect/sessions/${sid}/metadata/identities`, {
    params: {
      type: types?.join(','),
    },
  });

  return res?.data?.contents;
}

export async function generateCreateTableDDL(data: ITableModel): Promise<string> {
  const res = await request.post(
    `/api/v2/connect/sessions/${connection.sessionId}/databases/${encodeObjName(
      schema.database?.name,
    )}/tables/generateCreateTableDDL`,
    {
      data: convertTableToServerTable(data),
    },
  );

  return res?.data?.sql;
}

export async function dropTable(tableName: string) {
  const res = await request.delete(
    `/api/v2/connect/sessions/${connection.sessionId}/databases/${encodeObjName(
      schema.database.name,
    )}/tables/${encodeObjName(tableName)}`,
  );

  return !res?.isError;
}

export async function generateUpdateTableDDL(
  newData: Partial<ITableModel>,
  oldData: Partial<ITableModel>,
): Promise<string> {
  const res = await request.post(
    `/api/v2/connect/sessions/${connection.sessionId}/databases/${encodeObjName(
      schema.database?.name,
    )}/tables/generateUpdateTableDDL`,
    {
      data: {
        previous: convertTableToServerTable(oldData),
        current: convertTableToServerTable(newData),
      },
    },
  );

  if (!res?.data?.sql) {
    notification.error({
      track: formatMessage({ id: 'odc.network.table.CurrentlyNoSqlCanBe' }), //当前无 SQL 可提交
    });
  }
  return res?.data?.sql;
}

export async function getTableUpdateSQL(
  tableName: string,
  sessionId: string,
  dbName: string,
  options: {
    table: Partial<ITableModel>;
    columnList?: Array<Partial<TableColumn>>;
  },
): Promise<string> {
  const { table, columnList } = options;
  const sid = generateTableSid(tableName, dbName, sessionId);
  const ret = await request.patch(`/api/v1/table/getUpdateSql/${sid}`, {
    data: {
      table,
      columnList,
    },
  });
  return ret?.data?.sql;
}
