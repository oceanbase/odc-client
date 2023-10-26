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

import type { ConnectionFilterStatus, IDataType } from '@/d.ts';
import {
  AccountType,
  ConnectionMode,
  ConnectType,
  IConnection,
  IConnectionFormData,
  IConnectionTestErrorType,
  IConnectionType,
  IResponseData,
  ISessionStatus,
  ISqlExecuteResultStatus,
} from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { IDatasource } from '@/d.ts/datasource';
import userStore from '@/store/login';
import request from '@/util/request';
import { decrypt, encrypt } from '@/util/utils';
import { generateSessionSid } from './pathUtil';
import { executeSQL } from './sql';
import { getDataSourceModeConfig } from '../datasource';

function generateConnectionParams(formData: Partial<IConnectionFormData>, isHiden?: boolean) {
  // 创建必须带上 userId
  const userId = userStore?.user?.id;
  const params: Partial<IConnection> = {
    creatorId: userId,
    type: formData.type,
    name: formData.name,
    username: formData.username,
    password: encrypt(formData.password),
    sysTenantUsername: formData?.useSys ? formData.sysTenantUsername : null,
    sslConfig: formData.sslConfig || { enabled: false },
    /**
     * 逻辑同 pwd
     */
    sysTenantPassword: formData?.useSys ? encrypt(formData.sysTenantPassword) : null,
    queryTimeoutSeconds: formData.queryTimeoutSeconds,
    properties: formData.properties,
    passwordSaved: formData.passwordSaved,
    environmentId: formData.environmentId,
    jdbcUrlParameters: formData.jdbcUrlParameters || {},
    temp: isHiden,
    sessionInitScript: formData.sessionInitScript,
  };
  const config = getDataSourceModeConfig(formData.type)?.connection;
  config?.address?.items?.forEach((item) => {
    switch (item) {
      case 'cluster': {
        params.clusterName = formData.clusterName;
        break;
      }
      case 'ip': {
        params.host = formData.host;
        break;
      }
      case 'port': {
        params.port = formData.port;
        break;
      }
      case 'tenant': {
        params.tenantName = formData.tenantName;
        break;
      }
    }
  });

  // 取消数据订正，详见clearReviseV2Field
  return params;
}

/**
 * 创建连接
 */
export async function createConnection(formData: Partial<IDatasource>, isHiden?: boolean) {
  const params: Partial<IConnection> = generateConnectionParams(formData, isHiden);

  const requestParams = {
    wantCatchError: false,
    holdErrorTip: true,
  };
  const ret = await request.post('/api/v2/datasource/datasources', {
    data: params,
    params: requestParams,
  });
  return !ret || ret?.isError ? null : ret.data;
}

export async function updateConnection(formData: IConnectionFormData) {
  const sid = formData.id;
  const params = generateConnectionParams(formData);
  const requestParams = {
    wantCatchError: true,
  };
  const ret = await request.put(`/api/v2/datasource/datasources/${sid}`, {
    data: {
      id: sid,
      ...params,
    },
    params: requestParams,
  });
  return ret && !ret.isError;
}

export async function updateConnectionFromConnection(c: IConnection) {
  const res = await request.put(`/api/v2/datasource/datasources/${c.id}`, {
    data: { ...c, password: encrypt(c.password) },
  });
  return !!res && !res?.isError;
}

export async function parseConnectionStr(connectStr: string): Promise<Partial<IConnection>> {
  let d = await request.post('/api/v2/datasource/help/parseConnectionStr', {
    data: {
      connStr: encrypt(connectStr),
    },
  });
  const data = d?.data;
  if (data) {
    data.password = decrypt(data.password);
    data.readonlyPassword = decrypt(data.readonlyPassword);
    data.sysTenantPassword = decrypt(data.sysTenantPassword);
  }
  return d?.data;
}

export async function generateConnectionStr(formData: IConnectionFormData): Promise<string> {
  let d = await request.post(`/api/v2/datasource/help/generateConnectionStr`, {
    data: { ...generateConnectionParams(formData), password: null },
  });
  return decrypt(d?.data);
}

export async function testConnection(
  formData: Partial<IDatasource>,
  accountType: AccountType,
  ignoreError?: boolean,
): Promise<{
  data: {
    active: boolean;
    errorCode: IConnectionTestErrorType;
    errorMessage: string;
    type: ConnectType;
  };
  errMsg?: string;
}> {
  const sid = formData?.id;
  const params = generateConnectionParams(formData);
  let res;
  res = await request.post(`/api/v2/connect/test`, {
    data: {
      id: sid,
      accountType,
      ...params,
    },
    params: {
      ignoreError,
    },
  });
  return res;
}

export async function testExsitConnection(
  formData: Partial<IConnection>,
  testSys?: boolean,
): Promise<{
  data: {
    active: boolean;
    errorCode: string;
    errorMessage: string;
    type: string;
  };
}> {
  const cloneFormData = { ...formData };
  cloneFormData.password = encrypt(cloneFormData.password);
  const ret = await request.post(`/api/v2/connect/test`, {
    data: {
      ...cloneFormData,
      accountType: testSys ? AccountType.SYS_READ : AccountType.MAIN,
    },
    params: {
      ignoreError: true,
    },
  });

  return ret;
}

export async function batchTest(
  cids: number[],
): Promise<
  Record<
    number,
    {
      errorCode: string;
      errorMessage: string;
      status: any;
      type: any;
    }
  >
> {
  const res = await request.post('/api/v2/datasource/datasources/status', {
    data: cids,
  });
  return res?.data;
}

/**
 * 获取连接列表
 */
export async function getConnectionList(params: {
  clusterName?: string[];
  tenantName?: string[];
  projectId?: number;
  userId?: number;
  dialectType?: ConnectionMode | ConnectionMode[];
  type?: ConnectType[] | ConnectType;
  status?: ConnectionFilterStatus;
  fuzzySearchKeyword?: string;
  sort?: string;
  page?: number;
  size?: number;
  minPrivilege?: string;
  sessionLabelId?: string[];
  hostPort?: string;
  name?: string;
}): Promise<IResponseData<IDatasource>> {
  const results = await request.get('/api/v2/datasource/datasources', {
    params: {
      ...params,
    },
  });

  return results?.data;
}

export async function getConnectionDetail(sid: number): Promise<IDatasource> {
  const results = await request.get(`/api/v2/datasource/datasources/${sid}`);

  return results?.data;
}

export async function getConnectionDetailResponse(
  sid: number,
): Promise<{ data?: IDatasource; errCode: string; errMsg: string }> {
  const results = await request.get(`/api/v2/datasource/datasources/${sid}`, {
    params: {
      ignoreError: true,
    },
  });

  return results;
}

export async function changeDelimiter(v, sessionId: string, dbName: string): Promise<boolean> {
  const data = await executeSQL(`delimiter ${v}`, sessionId, dbName);
  return data?.executeResult?.[0]?.status === ISqlExecuteResultStatus.SUCCESS;
}

export async function newSessionByDataBase(
  databaseId: number,
  holdErrorTip?: boolean,
): Promise<{
  sessionId: string;
  dataTypeUnits: IDataType[];
  charsets: string[];
  collations: string[];
  supports: {
    support: boolean;
    supportType: string;
  }[];
}> {
  const { data } = await request.post(`/api/v2/datasource/databases/${databaseId}/sessions`, {
    params: {
      holdErrorTip,
    },
  });
  return data;
}

export async function newSessionByDataSource(
  dataSourceId: number,
  holdErrorTip?: boolean,
): Promise<{
  sessionId: string;
  dataTypeUnits: IDataType[];
  supports: {
    support: boolean;
    supportType: string;
  }[];
}> {
  const { data } = await request.post(`/api/v2/datasource/datasources/${dataSourceId}/sessions`, {
    params: {
      holdErrorTip,
    },
  });
  return data;
}

export async function getSessionStatus(
  sessionId?: string,
): Promise<{
  settings: {
    autocommit: boolean;
    delimiter: string;
    queryLimit: number;
    obVersion: string;
  };
  session: ISessionStatus;
}> {
  const sid = generateSessionSid(sessionId);
  const res = await request.get(`/api/v2/datasource/sessions/${sessionId}/status`);
  return res?.data;
}

/**
 * 设置事务相关的信息
 */
export async function setTransactionInfo(
  params: {
    autocommit?: boolean;
    delimiter?: string;
    queryLimit?: number;
  },
  sessionId?: string,
): Promise<boolean> {
  const sid = generateSessionSid(sessionId);
  const infos = await getSessionStatus(sessionId);
  const res = await request.post(`/api/v1/transaction/setTransactionInfo/${sid}`, {
    data: { ...infos?.settings, ...params },
  });
  return res?.data;
}

/**
 * 获取连接名称是否重复
 */
export async function getConnectionExists(params: { name: string }): Promise<boolean> {
  const results = await request.get(`/api/v2/datasource/datasources/exists`, {
    params,
  });
  return results?.data;
}

/**
 * 获取集群 & 租户列表
 */
export async function getClusterAndTenantList(
  visibleScope: IConnectionType,
): Promise<{
  tenantName: Record<string, string[]>;
  clusterName: Record<string, string[]>;
}> {
  const results = await request.get('/api/v2/datasource/datasources/stats', {
    params: {
      visibleScope,
    },
  });
  return results?.data;
}

export async function deleteConnection(cid: string): Promise<boolean> {
  const res = await request.delete(`/api/v2/datasource/datasources/${cid}`);
  return res?.data;
}

/**
 * 批量导入个人连接
 */
export async function batchImportPrivateConnection(data: IConnection[]): Promise<IConnection[]> {
  const result = await request.post('/api/v2/datasource/datasources/batchCreate', {
    data,
  });
  return result?.data;
}

export async function batchDeleteConnection(ids: (string | number)[]): Promise<boolean> {
  const res = await request.delete(`/api/v2/datasource/datasources/batchDelete`, {
    data: ids,
  });
  return res?.data;
}
export async function syncDatasource(dsId: number): Promise<boolean> {
  const res = await request.post(`/api/v2/datasource/datasources/${dsId}/sync`);
  return !!res?.data;
}
export async function getDataSourceManageDatabase(
  datasourceId: number,
  name?: string,
): Promise<IResponseData<IDatabase>> {
  const res = await request.get(`/api/v2/datasource/datasources/${datasourceId}/databases`, {
    params: {
      name,
    },
  });
  return res?.data;
}

export async function getDataSourceGroupByProject(
  containsUnassigned: boolean = false,
): Promise<IResponseData<IDatasource>> {
  const res = await request.get(`/api/v2/collaboration/projects/databases/stats`, {
    params: {
      containsUnassigned,
    },
  });
  return res?.data;
}
