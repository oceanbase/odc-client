import { Revise_Field_Map_V1_To_V2 } from '@/constant';
import { ConnectionMode, ConnectType, IConnection } from '@/d.ts';
import { encrypt } from '@/util/utils';

const encryptKeys = ['password', 'sysTenantPassword', 'readonlyPassword', 'sysUserPassword'];

/**
 * 提供租户的连接帐户，格式有两种：“用户名@租户名#集群名”或者“集群名:租户名:用户名”
 */
export function resolveUnionDbUser(unionDbUser: string): {
  dbUser: string;
  tenant: string;
  cluster: string;
} {
  let dbUser: string, tenant: string, cluster: string;

  const [a, b, c] = unionDbUser.split(':');
  if (a && b && c) {
    cluster = a;
    tenant = b;
    dbUser = c;
  } else {
    const [user, tenantAndCluster] = unionDbUser.split('@');
    dbUser = user;
    if (tenantAndCluster) {
      tenant = tenantAndCluster.split('#')[0];
      cluster = tenantAndCluster.split('#')[1] || '';
    }
  }

  return {
    dbUser,
    tenant,
    cluster,
  };
}

/**
 * v1升级v2版本，数据订正（纯前端消费）
 */
export const reviseV2Field = (data: Partial<IConnection>) => {
  const d = { ...data };
  Revise_Field_Map_V1_To_V2.forEach((v2_key, v1_key) => {
    d[v1_key] = d[v2_key];
  });
  return d;
};

/**
 * v1升级v2版本，清空订正的数据（订正后的数据不参与 后端交互）
 */
export const clearReviseV2Field = (data: Partial<IConnection>) => {
  const d = { ...data };
  Revise_Field_Map_V1_To_V2.forEach((v2_key, v1_key) => {
    d[v1_key] = undefined;
  });
  return d;
};

export function getDialectTypeFromConnectType(connectType: ConnectType): ConnectionMode {
  const oracleList = [ConnectType.CLOUD_OB_ORACLE, ConnectType.OB_ORACLE];
  return oracleList.includes(connectType) ? ConnectionMode.OB_ORACLE : ConnectionMode.OB_MYSQL;
}

export function isConnectTypeBeCloudType(connectType: ConnectType): boolean {
  const cloudList = [ConnectType.CLOUD_OB_MYSQL, ConnectType.CLOUD_OB_ORACLE];
  return cloudList.includes(connectType);
}

export function isConnectTypeBeShardingType(connectType: ConnectType): boolean {
  const cloudList = [ConnectType.ODP_SHARDING_OB_MYSQL];
  return cloudList.includes(connectType);
}

export function encryptConnection<T>(connection: T) {
  const res = {};
  Object.keys(connection)?.forEach((key) => {
    if (encryptKeys?.includes(key)) {
      res[key] = encrypt(connection[key]);
    } else {
      res[key] = connection[key];
    }
  });
  return res as T;
}
