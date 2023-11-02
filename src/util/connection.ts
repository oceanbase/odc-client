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

import { ConnectionMode, ConnectType } from '@/d.ts';
import { encrypt } from '@/util/utils';

const encryptKeys = ['password', 'sysTenantPassword', 'readonlyPassword', 'sysUserPassword'];

/**
 * 提供租户的连接帐户，格式有两种：“用户名@租户名#集群名”或者“集群名:租户名:用户名”
 */
export function resolveUnionDbUser(
  unionDbUser: string,
): {
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

export function isConnectionModeBeMySQLType(dbMode: ConnectionMode) {
  return [ConnectionMode.MYSQL, ConnectionMode.OB_MYSQL].includes(dbMode);
}
