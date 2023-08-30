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

import { INlsObject, ITableColumn, LobExt, RSModifyDataType } from '@/d.ts';
import { ITableModel, TableColumn } from '@/page/Workspace/components/CreateTable/interface';
import sessionManager from '@/store/sessionManager';
import setting from '@/store/setting';
import { getNlsValueKey } from '@/util/column';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import request from '@/util/request';
import { downloadFile, encodeObjName, getBlobValueKey } from '@/util/utils';
import { message } from 'antd';
import { Base64 } from 'js-base64';
import { isNil, toInteger } from 'lodash';
import moment from 'moment';
import { generateDatabaseSid, generateTableSid } from '../pathUtil';
import { convertServerTableToTable, convertTableToServerTable } from './helper';

export async function getTableColumnList(
  tableName: string,
  databaseName?: string,
  sessionId?: string,
) {
  if (tableName) {
    const sid = generateTableSid(tableName, databaseName, sessionId);
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
    )}/tables/${encodeObjName(Base64.encode(tableName))}`,
  );

  return convertServerTableToTable(res?.data);
}

export async function queryTableOrViewData(
  dbName: string,
  tableOrViewName: string,
  queryLimit: number,
  addRowID?: boolean,
  sessionId?: string,
) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const res = await request.post(`/api/v2/datasource/sessions/${sid}/queryData`, {
    data: {
      schemaName: dbName,
      tableOrViewName,
      queryLimit,
      addROWID: addRowID,
    },
  });

  return res?.data;
}

export async function queryIdentities(types: string[], sessionId: string, dbName: string) {
  const sid = generateDatabaseSid(dbName, sessionId);
  const res = await request.get(`/api/v2/connect/sessions/${sid}/metadata/identities`, {
    params: {
      type: types?.join(','),
    },
  });

  return res?.data?.contents;
}

export async function generateCreateTableDDL(
  data: ITableModel,
  sessionId: string,
  dbName: string,
): Promise<string> {
  const session = sessionManager.sessionMap.get(sessionId);
  const res = await request.post(
    `/api/v2/connect/sessions/${sessionId}/databases/${encodeObjName(
      dbName,
    )}/tables/generateCreateTableDDL`,
    {
      data: convertTableToServerTable(data, session?.connection?.dialectType),
    },
  );

  return res?.data?.sql;
}

export async function generateUpdateTableDDL(
  newData: Partial<ITableModel>,
  oldData: Partial<ITableModel>,
  sessionId: string,
  dbName: string,
): Promise<string> {
  const session = sessionManager.sessionMap.get(sessionId);
  const res = await request.post(
    `/api/v2/connect/sessions/${sessionId}/databases/${encodeObjName(
      dbName,
    )}/tables/generateUpdateTableDDL`,
    {
      data: {
        previous: convertTableToServerTable(oldData, session?.connection?.dialectType),
        current: convertTableToServerTable(newData, session?.connection?.dialectType),
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

export async function getTableListByDatabaseName(sessionId: string, databaseName?: string) {
  const sid = generateDatabaseSid(databaseName, sessionId);
  const ret = await request.get(`/api/v1/table/list/${sid}`);
  return ret?.data || [];
}

export async function batchGetDataModifySQL(
  schemaName: string,
  tableName: string,
  columns: Partial<ITableColumn>[],
  useUniqueColumnName: boolean = false,
  updateRows: {
    type: 'INSERT' | 'UPDATE' | 'DELETE';
    row: any;
    initialRow: any;
    enableRowId?: boolean;
  }[],
  sessionId: string,
  dbName: string,
  whereColumns: string[],
): Promise<{
  sql: string;
  tip: string;
}> {
  const sid = generateTableSid(tableName, dbName, sessionId);
  const ret = await request.post(`/api/v1/data/batchGetModifySql/${sid}`, {
    data: {
      tableName,
      schemaName,
      whereColumns,
      rows: updateRows.map((updateRow) => {
        const { type, row, initialRow, enableRowId } = updateRow;
        return {
          operate: type,
          units: wrapDataDML(tableName, row, initialRow, columns, useUniqueColumnName, enableRowId),
        };
      }),
    },
  });
  return {
    sql: ret?.data?.sql,
    tip: ret?.data?.tip,
  };
}

function wrapDataDML(
  tableName: string,
  row: any,
  initialRow: any,
  columns: Partial<ITableColumn>[],
  useUniqueColumnName: boolean = false,
  /** 是否支持row id */
  enableRowId: boolean = false,
) {
  if (enableRowId) {
    const exsitRowIdColumn = columns.find((column) => {
      return column.dataType === 'ROWID';
    });
    if (!exsitRowIdColumn) {
      columns = [
        {
          columnName: 'ROWID',
          dataType: 'ROWID',
        } as Partial<ITableColumn>,
      ].concat(columns);
    }
  } else {
    columns = columns.filter((column) => {
      return column.dataType !== 'ROWID';
    });
  }

  function getServerDateformat(nlsObject: INlsObject, columnType: string) {
    let data = null;
    if (isNil(nlsObject?.timestamp)) {
      return null;
    }
    let time = moment(nlsObject.timestamp);
    let nano = (time.millisecond() * 1000000 + (toInteger(nlsObject?.nano) || 0))
      .toString()
      ?.padStart(9, '0');
    /**
     * https://datatracker.ietf.org/doc/html/rfc3339#section-5.8
     * https://momentjs.com/docs/#/manipulating/utc-offset/
     */
    switch (columnType) {
      case 'TIMESTAMP WITH TIME ZONE': {
        let timeZone = nlsObject.timeZoneId;
        if (timeZone) {
          data = time.utcOffset(timeZone).format(`YYYY-MM-DDTHH:mm:ss.${nano}Z`);
        } else {
          data = time.utc().format(`YYYY-MM-DDTHH:mm:ss.${nano}Z`);
        }
        break;
      }
      default: {
        data = time.utc().format(`YYYY-MM-DDTHH:mm:ss.${nano}Z`);
        break;
      }
    }
    return data;
  }

  return columns.map((column, i) => {
    const uniqueColumnName = column?.columnName;
    const blobExt: LobExt = row[getBlobValueKey(uniqueColumnName)];
    const nlsObject: INlsObject = row[getNlsValueKey(uniqueColumnName)];
    const initNlsObject: INlsObject = initialRow?.[getNlsValueKey(uniqueColumnName)];
    let oldData = initialRow ? initialRow[uniqueColumnName] : null;
    let newData = blobExt ? blobExt.info : row[uniqueColumnName];
    if (initNlsObject) {
      oldData = getServerDateformat(initNlsObject, column?.dataType);
    }
    if (nlsObject) {
      newData = getServerDateformat(nlsObject, column?.dataType);
    }
    return {
      tableName,
      columnName: column.columnName,
      columnType: column.dataType,
      newData,
      oldData,
      newDataType: blobExt?.type || RSModifyDataType.RAW,
      useDefault: typeof row[uniqueColumnName] === 'undefined' && column.columnName !== 'ROWID',
      primaryKey: column.primaryKey,
    };
  });
}

export async function downloadDataObject(
  sqlId: string,
  columnIndex: number,
  rowIndex: number,
  sessionId: string,
  dbName: string,
) {
  if (columnIndex < 0 || rowIndex < 0) {
    message.error(`Download Error (column: ${columnIndex}, row: ${rowIndex}, sqlId: ${sqlId})`);
    return;
  }
  const url = await getDataObjectDownloadUrl(sqlId, columnIndex, rowIndex, sessionId, dbName);
  if (url) {
    downloadFile(url);
  }
}

/** 数据上传下载 */
export async function getDataObjectDownloadUrl(
  sqlId: string,
  columnIndex: number,
  rowIndex: number,
  sessionId: string,
  dbName: string,
) {
  if (setting.isUploadCloudStore) {
    const res = await request.post(`/api/v2/aliyun/specific/DownloadObjectData`, {
      data: {
        sqlId,
        row: rowIndex,
        col: columnIndex,
        sid: generateDatabaseSid(dbName, sessionId),
      },
    });
    const donwloadUrl = res?.data;
    console.log('get sql object download url: ', donwloadUrl);
    return donwloadUrl;
  } else {
    return (
      window.ODCApiHost +
      `/api/v2/datasource/sessions/${generateDatabaseSid(
        dbName,
        sessionId,
      )}/sqls/${sqlId}/download?row=${rowIndex}&col=${columnIndex}`
    );
  }
}

export async function getFormatNlsDateString(
  params: Pick<INlsObject, 'nano' | 'timeZoneId' | 'timestamp'> & { dataType: string },
  sessionId: string,
): Promise<string> {
  const res = await request.post(`/api/v2/connects/sessions/${sessionId}/format`, {
    data: params,
  });
  return res?.data;
}
