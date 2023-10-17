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

import { decrypt } from '@/common/network/other';
import { IRemoteCustomConnectionData } from '@/d.ts';
import { resolveUnionDbUser } from '@/util/connection';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { generateUniqKey } from '@/util/utils';
import { message } from 'antd';
import { Base64 } from 'js-base64';
import moment from 'moment';
import { history } from '@umijs/max';
import login from '@/store/login';
import { SpaceType } from '@/d.ts/_index';
import { IDatasource } from '@/d.ts/datasource';
import { listEnvironments } from '@/common/network/env';
import { createConnection } from '@/common/network/connection';
import { gotoSQLWorkspace } from '@/util/route';
import { listDatabases } from '@/common/network/database';

async function getDefaultSchema(dsId: number, userName: string) {
  const res = await listDatabases(null, dsId, 1, 999);
  const databases = res?.contents;
  const informationSchema = databases.find((d) => d.name === 'information_schema');
  const sameName = databases.find((d) => d.name?.toLowerCase() === userName?.toLowerCase());
  return informationSchema?.id || sameName?.id || databases?.[0]?.id;
}

async function newConnection(params: Partial<IDatasource>): Promise<IDatasource | null> {
  const envs = await listEnvironments();
  const targetConnection = await createConnection(
    {
      ...params,
      /**
       * 在这边创建的时候去加上租户id，这样可以让用户老的连接也能继续用，并且可以检查老的连接是否存在租户id的变更。
       * 新的名字一律加上id
       */
      name: params.name + '_' + params.tenantName,
      environmentId: envs?.[0]?.id,
    },
    true,
  );
  return targetConnection;
}
export interface ICustomConnectAction {
  action: 'newTempSession';
  data: IRemoteCustomConnectionData | string;
  encrypt: boolean;
}

function resolveRemoteData(data: IRemoteCustomConnectionData) {
  data = { ...data, passwordSaved: true };

  if (data.unionDbUser) {
    const obj = resolveUnionDbUser(data.unionDbUser);
    data.clusterName = obj.cluster;
    data.username = obj.dbUser;
    data.tenantName = obj.tenant;
  }

  data.clusterName = data.clusterName || '';
  data.sysTenantUsername = data.sysTenantUsername || '';
  data.sysTenantPassword = data.sysTenantPassword || '';

  if (data.interceptData) {
    data.properties = data.interceptData;
  }

  const sessionName = `${data.username}@${data.tenantName}#${data.clusterName}-${data.host}:${
    data.port
  }_${moment().format('MMDDHHmmss')}-${generateUniqKey()}`;
  data.name = sessionName;
  return data;
}

function wrapDataToString(data: IRemoteCustomConnectionData, encrypt) {
  return Base64.encode(
    JSON.stringify({
      encrypt,
      data,
      action: 'newTempSession',
    }),
  );
}

export const action = async (config: ICustomConnectAction) => {
  let { data, encrypt } = config;

  if (typeof data === 'string') {
    if (!encrypt) {
      message.error(
        formatMessage({
          id: 'odc.page.Gateway.customConnect.EncryptOrDataParameterError',
        }), //encrypt 或 data 参数错误
      );
      return;
    }

    data = await decrypt(data);

    if (!data) {
      message.error(
        formatMessage({ id: 'odc.page.Gateway.customConnect.DecryptionFailed' }), //解密失败！
      );
      return;
    }

    try {
      data = JSON.parse(data) as IRemoteCustomConnectionData;
    } catch (e) {
      const msg = formatMessage({
        id: 'odc.page.Gateway.customConnect.JsonParsingFailedCheckWhether',
      }); //JSON 解析失败，请确认参数是否正确
      console.error(msg);
      message.error(msg, 0);
      return;
    }
  }
  if (data) {
    /**
     * 判断是否携带登录信息
     */
    const accountVerifyToken = data.accountVerifyToken;
    if (accountVerifyToken && !isClient()) {
      const searchParamsObj = new URLSearchParams();
      searchParamsObj.append('accountVerifyToken', accountVerifyToken);
      searchParamsObj.append(
        'redirectTo',
        '/gateway/' + wrapDataToString({ ...data, accountVerifyToken: null }, false),
      );
      history.replace({
        pathname: '/login',
        search: searchParamsObj.toString(),
      });

      return;
    }
  }

  await login.getOrganizations();
  if (!login.organizations?.length) {
    return 'Get User Failed';
  }
  const personalOrganization = login.organizations?.find((item) => item.type === SpaceType.PRIVATE);
  if (!personalOrganization) {
    return formatMessage({ id: 'odc.page.Gateway.newCloudConnection.PersonalSpaceDoesNotExist' }); //个人空间不存在！
  }
  const isSuccess = await login.switchCurrentOrganization(personalOrganization?.id);
  if (!isSuccess) {
    return 'Switch Organization Failed';
  }

  const params = resolveRemoteData({
    ...(data as IRemoteCustomConnectionData),
  });
  const createResult = await newConnection(params);

  if (createResult) {
    gotoSQLWorkspace(
      null,
      createResult?.id,
      await getDefaultSchema(createResult?.id, createResult?.username),
      true,
      generateUniqKey(),
    );
  } else {
    return 'create connection failed';
  }
};
