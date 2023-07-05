import { getConnectionList } from '@/common/network/connection';
import { decrypt } from '@/common/network/other';
import { ConnectType, IConnectionFormData } from '@/d.ts';
import { formatMessage } from '@/util/intl';
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

function resolveRemoteData(inputData: IRemoteNewCloudConnectionData): IConnectionFormData {
  let data: IConnectionFormData = {
    username: inputData.username,
    passwordSaved: false,
    queryTimeoutSeconds: 600,
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

  const params = resolveRemoteData(data);
  const connectionList = await getConnectionList({
    fuzzySearchKeyword: params.name,
    tenantName: [params.tenantName],
  });
  if (!connectionList) {
    return 'Get Conneciton List Failed';
  }
  return '';
  // let targetConnection = connectionList?.contents?.find((c) => c.tenantName === params.tenantName);
  // if (!targetConnection) {
  //   /**
  //    * 不存在的话，需要新建一个
  //    */
  //   targetConnection = await createConnection({
  //     ...params,
  //     /**
  //      * 在这边创建的时候去加上租户id，这样可以让用户老的连接也能继续用，并且可以检查老的连接是否存在租户id的变更。
  //      * 新的名字一律加上id
  //      */
  //     name: params.name + '_' + params.tenantName,
  //   });
  // }
  // if (!targetConnection) {
  //   /**
  //    * 新建失败，直接退出
  //    */
  //   return 'Create Connection Failed';
  // }
  // let password;
  // let sessionId;
  // let isPasswordError = false;
  // let savePassword = false;
  // async function createSession() {
  //   if (!targetConnection.passwordSaved || isPasswordError) {
  //     const v = (await ShowConnectPassword(targetConnection.id.toString(), true)) as {
  //       password: string;
  //       isSaved: boolean;
  //     };
  //     if (!v) {
  //       window.close();
  //     }
  //     password = v.password;
  //     savePassword = v.isSaved;
  //   }
  //   try {
  //     sessionId = await connectionStore.connect(
  //       targetConnection.id.toString(),
  //       password,
  //       null,
  //       true,
  //     );
  //   } catch (e) {
  //     message.error(e?.message || 'NetError');
  //   }
  //   if (!sessionId) {
  //     /**
  //      * 在第一次连接失败之后，当前已保存密码不正确需要手动输入修改
  //      */
  //     isPasswordError = true;
  //     password = null;
  //     await createSession();
  //   }
  // }
  // await createSession();

  // if (sessionId) {
  //   const isSuccess = await connectionStore.get(sessionId);

  //   if (isSuccess) {
  //     if (savePassword) {
  //       updateConnectionFromConnection({
  //         ...targetConnection,
  //         passwordSaved: true,
  //         password: password,
  //       });
  //     }
  //     if (connectionStore.connection.defaultDBName) {
  //       schema.database = {
  //         name: connectionStore.connection.defaultDBName,
  //       };
  //     }
  //     commonStore.updateTabKey(true);
  //     history.push(pageStore.generatePagePath());
  //     return;
  //   }
  // } else {
  //   return 'Create Session Failed';
  // }
};
