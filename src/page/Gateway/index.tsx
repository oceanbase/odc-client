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

/**
 * ODC 对外能力开放节点，修改记得同步更新文档
 */
import { Layout, Spin, Tag } from 'antd'; // @ts-ignore
import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';

import { decrypt } from '@/common/network/other';
import { UserStore } from '@/store/login';
import { PageStore } from '@/store/page';
import { SettingStore } from '@/store/setting';
import { ReactComponent as Logo } from '@/svgr/LogoOB.svg';
import { isClient } from '@/util/env';
import { useMatch } from '@umijs/max';
import { Base64 } from 'js-base64';
import { inject, observer } from 'mobx-react';
import { action as customConnectAction, ICustomConnectAction } from './customConnect';
import styles from './index.less';
import { action as newCloudConnectionAction, INewCloudConnection } from './newCloudConnection';
import { apply as ssoLoginAction, ISSOLogin } from './ssoLogin';
import { action as taskAction, ITaskAction } from './task';
import { action as tutorialAction, ITutorialAction } from './tutorial';
import { formatMessage } from '@/util/intl';
const { Content } = Layout;

interface IRemoteStartData {
  accountVerifyToken?: string;
}
interface IStartAction {
  action: 'start';
  data?: IRemoteStartData | string;
  encrypt?: boolean;
}
type IRemoteParams =
  | ICustomConnectAction
  | IStartAction
  | ITutorialAction
  | ITaskAction
  | INewCloudConnection
  | ISSOLogin;

interface GatewayProps {
  pageStore?: PageStore;
  userStore?: UserStore;
  settingStore?: SettingStore;
}
const Gateway: React.FC<GatewayProps> = (props: GatewayProps) => {
  const [status, setStatus] = useState<'errorParams' | 'errorAction' | 'loading' | string>(
    'loading',
  );
  const params = useMatch({ path: '/gateway/*' });

  const doActionWithParams = async () => {
    const paramsStr = Object.values(params.params)?.[0];
    let paramsConfig: IRemoteParams;

    try {
      paramsConfig = JSON.parse(Base64.decode(decodeURIComponent(paramsStr)));
    } catch (e) {
      console.error(e);
      paramsConfig = null;
    }

    if (!paramsConfig) {
      setStatus('errorParams');

      return;
    }

    runAction(paramsConfig);
  };
  const startAction = async (data: IRemoteStartData | string, encrypt: boolean) => {
    let jsonData: IRemoteStartData;
    if (encrypt && typeof data === 'string') {
      try {
        jsonData = JSON.parse(await decrypt(data)) as IRemoteStartData;
      } catch (e) {
        console.error(e);
      }
    } else {
      jsonData = data as IRemoteStartData;
    }
    if (jsonData?.accountVerifyToken && !isClient()) {
      const searchParamsObj = new URLSearchParams();
      searchParamsObj.append('accountVerifyToken', jsonData.accountVerifyToken);
      history.replace({
        pathname: '/login',
        search: searchParamsObj.toString(),
      });
      return;
    }
    toIndex();
  };
  const runAction = async (config: IRemoteParams) => {
    switch (config.action) {
      case 'newTempSession': {
        const error = await customConnectAction(config);
        if (error) {
          setStatus(error);
        }
        break;
      }
      case 'newCloudConnection': {
        const error = await newCloudConnectionAction(config);
        if (error) {
          setStatus(error);
        }
        break;
      }

      case 'openTutorial': {
        const error = await tutorialAction(config);
        if (error) {
          setStatus(error);
        }
        break;
      }

      case 'start': {
        if (!config.data) {
          toIndex();
          return;
        }
        startAction(config.data, config.encrypt);
        break;
      }

      case 'openTask': {
        const error = await taskAction(config);
        if (error) {
          setStatus(error);
        }
        break;
      }
      case 'testLogin': {
        ssoLoginAction();
        break;
      }
      default: {
        setStatus('errorAction');
      }
    }
  };
  const toIndex = () => {
    history.push('/');
  };
  const renderStatus = (status) => {
    switch (status) {
      case 'loading': {
        return (
          <Spin
            style={{
              marginTop: 30,
            }}
            size="large"
            tip={formatMessage({
              id: 'odc.page.Gateway.Jumping',
            })}
          />
        );
      }

      case 'errorAction': {
        return (
          <div
            style={{
              marginTop: 30,
              textAlign: 'center',
            }}
          >
            <Tag color="red">
              {formatMessage({
                id: 'odc.page.Gateway.SorryTheActionDoesNot',
              })}
            </Tag>
          </div>
        );
      }

      case 'errorParams': {
        return (
          <div
            style={{
              marginTop: 30,
              textAlign: 'center',
            }}
          >
            <Tag color="magenta">
              {formatMessage({
                id: 'odc.page.Gateway.ConfirmTheFormatOfThe',
              })}
            </Tag>
          </div>
        );
      }
      default: {
        /**
         * 其余情况为自定义错误
         */
        return (
          <div
            style={{
              marginTop: 30,
              textAlign: 'center',
            }}
          >
            <Tag color="magenta">{status}</Tag>
          </div>
        );
      }
    }
  };
  useEffect(() => {
    doActionWithParams();
  }, []);
  return (
    <Layout>
      <Content>
        <div className={styles.logo}>
          <Logo />
          {renderStatus(status)}
        </div>
      </Content>
    </Layout>
  );
};

export default inject('pageStore', 'userStore', 'settingStore')(observer(Gateway));
