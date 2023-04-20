import type { ConnectionFilterStatus } from '@/d.ts';
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
import userStore from '@/store/login';
import {
  clearReviseV2Field,
  getDialectTypeFromConnectType,
  isConnectTypeBeCloudType,
  reviseV2Field,
} from '@/util/connection';
import request from '@/util/request';
import { decrypt, encrypt } from '@/util/utils';
import { generateDatabaseSid, generateSessionSid } from './pathUtil';
import { executeSQL } from './sql';

function generateConnectionParams(formData: IConnectionFormData, isHiden?: boolean) {
  // 创建必须带上 userId
  const userId = userStore?.user?.id;
  const params: Partial<IConnection> = {
    creatorId: userId,
    type: formData.type,
    name: formData.name,
    username: formData.username,
    password: encrypt(formData.password),
    sysTenantUsername: formData.sysTenantUsername,
    sslConfig: formData.sslConfig || { enabled: false },
    /**
     * 逻辑同 pwd
     */
    sysTenantPassword: encrypt(formData.sysTenantPassword),
    queryTimeoutSeconds: formData.queryTimeoutSeconds,
    defaultSchema: formData.defaultSchema,
    properties: formData.properties,
    copyFromId: formData.copyFromSid,
    temp: isHiden,
    passwordSaved: formData.passwordSaved,
    visibleScope: formData.visibleScope,
  };
  const dialectType = getDialectTypeFromConnectType(params.type);

  if (dialectType == ConnectionMode.OB_ORACLE) {
    /**
     * oracle 用户名就是默认数据库
     */
    params.defaultSchema = params.username;
  }

  if (isConnectTypeBeCloudType(formData.type)) {
    /**
     * 共有云
     */
    params.host = formData.host;
    params.port = formData.port;
  } else {
    /**
     * 私有云
     */
    params.clusterName = formData.clusterName;
    params.tenantName = formData.tenantName;
    /**
     * host:port 连接
     */
    params.host = formData.host;
    params.port = formData.port;
  }

  // 取消数据订正，详见clearReviseV2Field
  return clearReviseV2Field(params);
}

/**
 * 创建连接
 */
export async function createConnection(formData: IConnectionFormData, isHiden?: boolean) {
  const params: Partial<IConnection> = generateConnectionParams(formData, isHiden);

  const requestParams = {
    wantCatchError: false,
    holdErrorTip: true,
  };
  const ret = await request.post('/api/v2/connect/connections', {
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
  const ret = await request.put(`/api/v2/connect/connections/${sid}`, {
    data: {
      id: sid,
      ...params,
    },
    params: requestParams,
  });
  return ret && !ret.isError;
}

export async function updateConnectionFromConnection(c: IConnection) {
  const res = await request.put(`/api/v2/connect/connections/${c.id}`, {
    data: { ...c, password: encrypt(c.password) },
  });
  return !!res && !res?.isError;
}

export async function parseConnectionStr(connectStr: string): Promise<Partial<IConnection>> {
  let d = await request.post('/api/v2/connect/help/parseConnectionStr', {
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
  let d = await request.post(`/api/v2/connect/help/generateConnectionStr`, {
    data: { ...generateConnectionParams(formData), password: null },
  });
  return decrypt(d?.data);
}

export async function testConnection(
  formData: IConnectionFormData,
  accountType: AccountType,
  ignoreError?: boolean,
): Promise<{
  data: {
    active: boolean;
    errorCode: IConnectionTestErrorType;
    errorMessage: string;
    type: ConnectType;
  };
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

export async function testExsitConnection(formData: Partial<IConnection>, testSys?: boolean) {
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

export async function batchTest(cids: number[]): Promise<
  {
    active: boolean;
    sid: number;
    sidString?: string;
  }[]
> {
  const res = await request.get('/api/v2/connect/connections/status', {
    params: {
      id: cids,
    },
  });
  return res?.data;
}

/**
 * 获取连接列表
 */
export async function getConnectionList(params: {
  clusterName?: string[];
  tenantName?: string[];
  dialectType?: ConnectionMode | ConnectionMode[];
  type?: ConnectType[] | ConnectType;
  status?: ConnectionFilterStatus;
  permittedAction?: string | string[];
  fuzzySearchKeyword?: string;
  sort?: string;
  page?: number;
  size?: number;
  visibleScope?: IConnectionType;
  minPrivilege?: string;
  sessionLabelId?: string[];
  hostPort?: string;
}): Promise<IResponseData<IConnection>> {
  const { visibleScope = IConnectionType.PRIVATE, minPrivilege = 'readonlyconnect' } = params;
  const results = await request.get('/api/v2/connect/connections', {
    params: {
      ...params,
      visibleScope,
      minPrivilege,
    },
  });

  return results?.data;
}

export async function getConnectionDetail(sid: number): Promise<IConnection> {
  const results = await request.get(`/api/v2/connect/connections/${sid}`);

  return results?.data ? reviseV2Field(results.data) : results.data;
}

export async function getSupportFeatures(
  sessionId: any,
  dbName: string,
): Promise<
  {
    support: boolean;
    supportType: string;
  }[]
> {
  const res = await request.get(
    `/api/v1/version-config/getSupportFeatures/${generateDatabaseSid(dbName, sessionId)}`,
  );

  return res?.data;
}

export async function changeDelimiter(v, sessionId: string, dbName: string): Promise<boolean> {
  const data = await executeSQL(`delimiter ${v}`, sessionId, dbName);
  return data?.[0]?.status === ISqlExecuteResultStatus.SUCCESS;
}

/**
 * 直接建立连接，不需要新建连接
 */
export async function directConnect(sid: number, params: IConnectionFormData) {
  const serverParams = {
    ...generateConnectionParams(params),
    sid: params.id,
    sessionName: params.name,
  };
  const res = await request.put(`/api/v1/session/directConnect/sid:${sid}`, {
    data: serverParams,
  });
  const sessionId = res?.data;
  if (sessionId) {
    return sessionId.substring(4);
  }
}

export async function newSession(
  sid: string,
  password: string,
  /**
   * 存在的时候会忽略password和sid，用于创建子session
   */
  copiedFromSessionId: string,
  cloudParams?: {
    tenantId: any;
    instanceId: any;
  },
  holdErrorTip?: boolean,
) {
  const { data } = await request.post(`/api/v2/connect/sessions?connectType=CONNECT_TYPE_OB`, {
    data: {
      connectionId: sid,
      copiedFromSessionId,
      password: encrypt(password),
      cloudParams,
    },
    params: {
      holdErrorTip,
    },
  });
  if (data) {
    // 不带 sid
    const sessionId = data.substring(4);
    return sessionId;
  }
}

/**
 * 根据connectionID获取连接的详细信息
 */
export async function getConnectionBySessionId(sessionId: string): Promise<IConnection> {
  const connectionId = sessionId.split('-')[0];
  const results = await request.get(`/api/v2/connect/connections/${connectionId}`);
  return results?.data ? reviseV2Field(results.data) : results.data;
}

export async function getTransactionInfo(sessionId?: string): Promise<{
  autocommit: boolean;
  delimiter: string;
  queryLimit: number;
  obVersion: string;
}> {
  const sid = generateSessionSid(sessionId);
  const res = await request.get(`/api/v1/transaction/getTransactionInfo/${sid}`);
  return res?.data;
}

/**
 * 查询事务相关的信息
 */
export async function getSessionStatus(sessionId?: string): Promise<ISessionStatus> {
  const sid = generateSessionSid(sessionId);
  const res = await request.get(`/api/v2/connect/sessions/${sid}/status`);
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
  const infos = await getTransactionInfo(sessionId);
  const res = await request.post(`/api/v1/transaction/setTransactionInfo/${sid}`, {
    data: { ...infos, ...params },
  });
  return res?.data;
}

/**
 * 新建标签
 */
export async function createConnectionLabel(formData: { labelColor: string; labelName: string }) {
  const url = `/api/v1/session-label`;
  const params = {
    ...formData,
  };
  const res = await request.post(url, {
    data: params,
  });
  return res?.data;
}

/**
 * 获取标签列表
 */
export async function getConnectionLabelList(): Promise<IConnection[]> {
  const results = await request.get(`/api/v1/session-label/list`);
  return results?.data;
}

/**
 * 修改标签
 */
export async function updateConnectionLabel(formData: {
  id: number;
  labelColor: string;
  labelName: string;
}) {
  const url = `/api/v1/session-label/${formData.id}`;
  const res = await request.put(url, {
    data: formData,
  });
  return res?.data;
}

export async function setConnectionLabel(cid: any, labelId) {
  const res = await request.post(`/api/v2/connect/connections/${cid}/setLabel`, {
    data: !labelId ? [] : [labelId],
  });
  return res?.data;
}

/**
 * 删除标签
 */
export async function deleteConnectionLabel(id: number) {
  const params = {
    id,
  };
  const res = await request.delete(`/api/v1/session-label/${id}`, {
    data: params,
  });
  return res?.data;
}

/**
 * 置顶连接
 */
export async function setConnectionTop(sid: number) {
  const url = `/api/v2/connect/connections/${sid}/setTop`;
  const res = await request.post(url, {
    data: {
      id: sid,
    },
  });
  return res?.data;
}

/**
 * 取消置顶连接
 */
export async function cancelConnectionTop(sid: number) {
  const url = `/api/v2/connect/connections/${sid}/cancelSetTop`;
  const res = await request.post(url, {
    data: {
      id: sid,
    },
  });
  return res?.data;
}

/**
 * 获取连接名称是否重复
 */
export async function getConnectionExists(params: {
  name: string;
  visibleScope: string;
}): Promise<boolean> {
  const results = await request.get(`/api/v2/connect/connections/exists`, {
    params,
  });
  return results?.data;
}

/**
 * 获取集群 & 租户列表
 */
export async function getClusterAndTenantList(visibleScope: IConnectionType): Promise<{
  tenantName: Record<string, string[]>;
  clusterName: Record<string, string[]>;
}> {
  const results = await request.get('/api/v2/connect/connections/stats', {
    params: {
      visibleScope,
    },
  });
  return results?.data;
}

export async function deleteConnection(cid: string): Promise<boolean> {
  const res = await request.delete(`/api/v2/connect/connections/${cid}`);
  return res?.data;
}

export async function switchSchema(sessionIds: string[], schema: string) {
  const res = await request.post(`/api/v2/connect/sessions/switchSchema`, {
    data: {
      sessionIds,
      schemaName: schema,
    },
  });
  return !res?.isError;
}

/**
 * 批量导入个人连接
 */
export async function batchImportPrivateConnection(data: IConnection[]): Promise<IConnection[]> {
  const result = await request.post('/api/v2/connect/connections/batchCreate', {
    data,
  });
  return result?.data;
}

export async function batchDeleteConnection(ids: (string | number)[]): Promise<boolean> {
  const res = await request.delete(`/api/v2/connect/connections/batchDelete`, {
    data: ids,
  });
  return res?.data;
}
