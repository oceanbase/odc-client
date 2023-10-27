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

import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import {
  IExportResultSetCSVFormat,
  IExportResultSetFileType,
  IMPORT_ENCODING,
  ISQLExecuteDetail,
  ISQLExplain,
  ISQLExplainTreeNode,
  TraceSpan,
} from '@/d.ts';
import setting from '@/store/setting';
import { uploadFileToOSS } from '@/util/aliyun';
import notification from '@/util/notification';
import request from '@/util/request';
import { generateDatabaseSid, generateSessionSid } from '../pathUtil';
import _executeSQL from './executeSQL';

export const executeSQL = _executeSQL;

export async function stopExec(sessionId: string) {
  const sid = generateSessionSid(sessionId);
  const res = await request.put(`/api/v2/datasource/sessions/${sid}/killQuery`);
  return res?.data;
}

export async function uploadTableObject(file: File, sessionId: string) {
  if (setting.isUploadCloudStore) {
    return await uploadCloudTableObject(file, sessionId);
  }
  const url = `/api/v2/datasource/sessions/${generateSessionSid(sessionId)}/upload`;
  const form = new FormData();
  form.append('file', file);
  const res = await request.post(url, {
    body: form,
  });
  return res?.data;
}

export async function uploadCloudTableObject(file: File, sessionId: string) {
  return await uploadFileToOSS(file, 'UploadObjectData', sessionId);
}

export async function getSQLExecuteDetail(
  sql: string,
  tag?: string,
  sessionId?: string,
  dbName?: string,
): Promise<ISQLExecuteDetail> {
  const sid = generateDatabaseSid(dbName, sessionId);
  const result = await request.post(`/api/v1/diagnose/getExecDetail/${sid}`, {
    data: {
      sql,
      tag,
    },
  });
  return result?.data;
}

export async function getSQLExplain(sql: string, sessionId, dbName): Promise<ISQLExplain | null> {
  const sid = generateDatabaseSid(dbName, sessionId);
  const result = await request.post(`/api/v1/diagnose/explain/${sid}`, {
    data: {
      sql,
    },
    params: {
      ignoreError: false,
    },
  });
  const { data } = result;
  if (data && data.expTree) {
    // 需要预处理成标准树形结构
    return {
      tree: [formatSQLExplainTree(JSON.parse(data.expTree))],
      outline: data.outline,
      originalText: data?.originalText,
      showFormatInfo: data?.showFormatInfo,
    };
  }

  return null;
}

function formatSQLExplainTree(data: any): ISQLExplainTreeNode {
  const formatted: ISQLExplainTreeNode = {
    ...data,
    rowCount: Number(data.rowCount),
    cost: Number(data.cost),
  };
  const children: ISQLExplainTreeNode[] = [];

  if (data.children) {
    Object.keys(data.children).forEach((key) => {
      children.push(formatSQLExplainTree(data.children[key]));
    }); // @ts-ignore

    formatted.children = children.length && children;
  }

  return formatted;
}

export async function getSQLExecuteExplain(
  sql: string,
  tag?: string,
  sessionId?: string,
  dbName?: string,
): Promise<ISQLExplain | string | null> {
  const sid = generateDatabaseSid(dbName, sessionId);
  const result = await request.post(`/api/v1/diagnose/getExecExplain/${sid}`, {
    data: {
      sql,
      tag,
    },
    params: {
      ignoreError: true,
    },
  });
  if (result?.data?.expTree) {
    // 需要预处理成标准树形结构
    return {
      tree: [formatSQLExplainTree(JSON.parse(result.data.expTree))],
      outline: result.data.outline,
      originalText: result.data.originalText,
    };
  }

  return result?.errMsg || 'fetch error';
}

export async function getFullLinkTrace(
  sessionId: string,
  dbName: string,
  data?: Partial<{
    sql: string;
    tip: string;
    affectMultiRows: boolean;
    tag: string;
    type: string;
    desc: string;
    queryList: number;
  }>,
): Promise<
  Partial<{
    data: TraceSpan;
  }>
> {
  const sid = generateDatabaseSid(dbName, sessionId);
  const res = request.post(`/api/v1/diagnose/getFullLinkTrace/${sid}`, {
    data,
  });
  return res;
}
export enum IDataFormmater {
  TEXT = 'TXT',
  HEX = 'HEX',
  Stream = 'Stream',
}

export async function fetchResultCache(
  sqlId: string,
  rowNum: number,
  colNum: number,
  format: IDataFormmater,
  sessionId: string,
  maxSizeKB: number = 2048,
  skip: number = 0,
  dbName: string,
) {
  const res = await request.get(
    `/api/v2/datasource/sessions/${generateDatabaseSid(dbName, sessionId)}/sqls/${sqlId}/content`,
    {
      params: {
        row: rowNum,
        col: colNum,
        len: maxSizeKB,
        format,
        skip,
      },
    },
  );
  return res?.data;
}

/**
 * 结果集导出
 */
export async function exportResultSet(
  sql: string,
  fileName: string,
  fileFormat: IExportResultSetFileType,
  fileEncoding: IMPORT_ENCODING,
  tableName: string,
  csvFormat: IExportResultSetCSVFormat,
  sessionId: string,
  saveSql: boolean,
  maxRows: number,
  schemaName: string,
): Promise<{
  stopTask: () => void;
  task: Promise<string>;
}> {
  const res = await request.post(`/api/v2/resultset/export/start`, {
    data: {
      sid: generateDatabaseSid(schemaName, sessionId),
      sql,
      fileFormat,
      fileEncoding,
      tableName,
      csvFormat,
      fileName,
      maxRows,
      saveSql,
    },
  });
  const taskId = res?.data?.taskId;
  if (!taskId) {
    return null;
  }
  let isStop = false;
  let timer;
  async function getDownloadUrl(resolve) {
    if (isStop) {
      resolve(null);
      return;
    }
    const res = await request.get(`/api/v2/resultset/export/query`, {
      params: {
        taskId,
      },
    });
    if (isStop) {
      resolve(null);
      return;
    }
    const status = res?.data?.status;
    if (!status) {
      resolve(null);
      return;
    }
    switch (status) {
      case 'SUCCESS': {
        resolve(res?.data?.downloadUrl);
        return;
      }
      case 'FAILURE': {
        notification.error({
          track: res?.data?.errorMessage,
          requestId: res?.requestId,
        });
        resolve(null);
        return;
      }
    }
    timer = setTimeout(() => {
      getDownloadUrl(resolve);
    }, 2000);
  }
  return {
    stopTask: () => {
      timer && clearTimeout(timer);
      isStop = true;
    },
    task: new Promise((resolve) => {
      getDownloadUrl(resolve);
    }),
  };
}

export async function runSQLLint(
  sessionId: string,
  delimiter: string,
  scriptContent: string,
): Promise<ISQLLintReuslt[]> {
  const res = await request.post(
    `/api/v2/datasource/sessions/${generateSessionSid(sessionId)}/sqlCheck`,
    {
      data: {
        delimiter,
        scriptContent,
      },
    },
  );
  return res?.data?.contents;
}
