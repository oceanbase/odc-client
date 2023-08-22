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

import {
  createConnection,
  getConnectionList,
  testExsitConnection,
  updateConnectionFromConnection,
} from '@/common/network/connection';
import { listEnvironments } from '@/common/network/env';
import { decrypt } from '@/common/network/other';
import ShowConnectPassword from '@/component/ConnectPassowrd';
import { ConnectType } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import { SpaceType } from '@/d.ts/_index';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { gotoSQLWorkspace } from '@/util/route';
import { message } from 'antd';
export interface INewCloudConnection {
  action: 'newCloudConnection';
  data: IRemoteNewCloudConnectionData | string;
  encrypt: boolean;
}

interface IRemoteNewCloudConnectionData {
  cluster: string;
  clusterDisplayName: string;
  tenant: string;
  tenantDisplayName: string;
  instanceType: 'tenant' | 'cluster';
  username: string;
  mode: 'Oracle' | 'MySQL';
}

function resolveRemoteData(inputData: IRemoteNewCloudConnectionData): Partial<IDatasource> {
  let data: Partial<IDatasource> = {
    username: inputData.username,
    type: inputData.mode == 'Oracle' ? ConnectType.OB_ORACLE : ConnectType.OB_MYSQL,
  };

  if (inputData.instanceType === 'tenant') {
    data.tenantName = inputData.tenant || '';
    data.clusterName = data.tenantName;
    data.name = `${inputData.tenantDisplayName}_${data.username}`;
  } else {
    data.clusterName = inputData.cluster;
    data.tenantName = inputData.tenant;
    /**
     * 名字生成规则最后面需要加上一个唯一id，以此来保证名字重复的情况下也不会有问题。
     */
    data.name = `${inputData.clusterDisplayName}_${inputData.tenantDisplayName}_${data.username}`;
  }
  return data;
}

export const action = async (config: INewCloudConnection) => {
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
        formatMessage({
          id: 'odc.page.Gateway.customConnect.DecryptionFailed',
        }), //解密失败！
      );
      return;
    }

    try {
      data = JSON.parse(data) as IRemoteNewCloudConnectionData;
    } catch (e) {
      const msg = formatMessage({
        id: 'odc.page.Gateway.customConnect.JsonParsingFailedCheckWhether',
      }); //JSON 解析失败，请确认参数是否正确
      console.error(msg);
      message.error(msg, 0);
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
  const params = resolveRemoteData(data);
  const connectionList = await getConnectionList({
    fuzzySearchKeyword: params.name,
    tenantName: [params.tenantName],
  });
  if (!connectionList) {
    return 'Get Conneciton List Failed';
  }
  let targetConnection = connectionList?.contents?.find((c) => c.tenantName === params.tenantName);
  if (!targetConnection) {
    /**
     * 不存在的话，需要新建一个
     */
    const envs = await listEnvironments();
    targetConnection = await createConnection({
      ...params,
      /**
       * 在这边创建的时候去加上租户id，这样可以让用户老的连接也能继续用，并且可以检查老的连接是否存在租户id的变更。
       * 新的名字一律加上id
       */
      name: params.name + '_' + params.tenantName,
      environmentId: envs?.[0]?.id,
      password: 'defaultPwd',
    });
  }
  if (!targetConnection) {
    /**
     * 新建失败，直接退出
     */
    return 'Create Connection Failed';
  }
  let password;
  let isPasswordError = false;
  let pass = false;
  async function testSource() {
    if (isPasswordError) {
      const v = (await ShowConnectPassword(targetConnection.id.toString())) as {
        password: string;
      };
      if (!v) {
        window.close();
      }
      password = v.password;
    }
    try {
      const res = await testExsitConnection({ ...targetConnection, password });
      const isSuccess = res?.data?.active;
      if (!isSuccess) {
        isPasswordError = true;
        password = null;
        await testSource();
      } else {
        pass = true;
      }
    } catch (e) {
      message.error(e?.message || 'NetError');
    }
  }
  await testSource();
  if (!pass) {
    return 'Connect Failed';
  }
  updateConnectionFromConnection({
    ...targetConnection,
    passwordSaved: true,
    password: password,
  });
  gotoSQLWorkspace(null, targetConnection?.id, null, true);
};
