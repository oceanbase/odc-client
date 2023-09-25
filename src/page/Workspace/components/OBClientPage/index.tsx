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

import { formatMessage } from '@/util/intl';
import { Button, Card, Typography } from 'antd';
import React from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { generateSessionSid } from '@/common/network/pathUtil';
import { ModalStore } from '@/store/modal';
import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { generateUniqKey } from '@/util/utils';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { AttachAddon } from './attach';
import styles from './index.less';

const { Text } = Typography;

interface IOBClientProps {
  modalStore?: ModalStore;
  datasourceId: number;
  databaseId?: number;
  theme?: string;
  /**
   * 适配工作台之外的样式
   */
  simpleHeader?: boolean;
}

interface IOBClientState {
  isClosed: boolean;
}

@inject('modalStore')
@observer
class OBClient extends React.PureComponent<IOBClientProps, IOBClientState> {
  private xtermRef = React.createRef<HTMLDivElement>();

  private xtermFitAddon;

  private xtermInstance: Terminal;

  private ws: WebSocket;

  private _pingClock: any;

  private session: SessionStore;

  state: IOBClientState = {
    isClosed: false,
  };

  componentDidMount() {
    setTimeout(() => {
      this.initTerminal();
    });
    addEventListener('resize', this.resize);
  }

  public resize = () => {
    this.xtermFitAddon?.fit();
  };

  componentDidUpdate(
    prevProps: Readonly<IOBClientProps>,
    prevState: Readonly<IOBClientState>,
    snapshot?: any,
  ): void {
    if (prevProps.theme !== this.props.theme && this.xtermInstance) {
      this.xtermInstance.options.theme =
        this.props.theme === 'white'
          ? {
              foreground: 'black', // 字体
              background: '#fff', // 背景色
              cursor: '#888', // 设置光标
              selection: '#87bffd', // 选中区域的背景色
            }
          : {};
    }
  }

  private disposeSession() {
    if (this.session) {
      sessionManager.destorySession(this.session?.sessionId);
    }
  }

  private initTerminal = async () => {
    const { datasourceId, theme, databaseId } = this.props;
    const dom = this.xtermRef.current;
    if (!dom) {
      return;
    }
    const session = await sessionManager.createSession(datasourceId, databaseId);
    if (session === 'NotFound') {
      return;
    }
    if (!session) {
      return;
    }
    this.session = session;
    this.xtermInstance = new Terminal({
      convertEol: true,
      cursorBlink: true,
      cursorStyle: 'bar',
      rendererType: 'canvas',
      theme:
        theme === 'white'
          ? {
              foreground: 'black', // 字体
              background: '#fff', // 背景色
              cursor: '#888', // 设置光标
              selection: '#87bffd', // 选中区域的背景色
            }
          : {},
    });
    this.xtermInstance.attachCustomKeyEventHandler((e) => {
      if (e.key === 'v' && e.ctrlKey) {
        return false;
      }
      if (e.key === 'c' && e.ctrlKey) {
        return false;
      }
    });

    let url = new URL(
      `/api/v1/webSocket/obclient/${generateSessionSid(session?.sessionId)}`,
      window.ODCApiHost || window.location.href,
    );
    url.protocol = url.protocol.replace('http', 'ws');
    console.log(url);
    this.ws = new WebSocket(url.href);
    this.ws.onerror = (e) => {
      this.xtermInstance.write(
        `${
          formatMessage({
            id: 'odc.components.OBClientPage.NetworkException',
          }) + // 网络异常:
          e.type
        }` + '\r\n',
      );

      console.log(e);
    };
    this.xtermInstance.write(
      `${formatMessage({
        id: 'odc.components.OBClientPage.EstablishingConnection',
      })}\r\n`, // 建立连接中....
    );
    this.ws.onclose = (e) => {
      console.log(e);
      this.xtermInstance.write(
        `${formatMessage({
          id: 'odc.components.OBClientPage.ConnectionFailed',
        })}\r\n`, //* **连接失败***
      );
    };
    this.ws.onopen = (e) => {
      this.xtermInstance.write(
        `${formatMessage({
          id: 'odc.components.OBClientPage.ConnectionEstablished',
        })}\r\n`, // 建立连接成功....
      );
      console.log('ws opened!');
      const warnMsg = [
        formatMessage({
          id: 'odc.components.OBClientPage.ToAvoidGarbledCodesKeep',
        }), // 为避免乱码问题，请保持数据库客户端编码和操作系统编码一致。
        formatMessage({
          id: 'odc.components.OBClientPage.GenerallyTheLinuxOperatingSystem',
        }), // （一般情况linux操作系统为UTF8，windows操作系统为GBK，具体以实际情况为准）
      ];

      const prefixLength = Math.max(...warnMsg.map((i) => i.length)) + 5;
      this.xtermInstance.write(`${new Array(prefixLength).fill('*').join('')}\r\n`);
      warnMsg.forEach((m) => {
        this.xtermInstance.write(`${m}\r\n`);
      });
      this.xtermInstance.write(`${new Array(prefixLength).fill('*').join('')}\r\n`);
      this.startPingLoop();
      this.ws.onclose = (e) => {
        console.log(e);
        this.xtermInstance.write(
          `${formatMessage({
            id: 'odc.components.OBClientPage.TheConnectionHasBeenDisconnected',
          })}\r\n`, //* **连接已断开***
        );
        clearTimeout(this._pingClock);
        this.setState({
          isClosed: true,
        });
      };
    };
    this.xtermFitAddon = new FitAddon();
    this.xtermInstance.loadAddon(new AttachAddon(this.ws));
    this.xtermInstance.loadAddon(this.xtermFitAddon);
    this.xtermInstance.open(dom);
    this.xtermFitAddon.fit();
    this.xtermInstance.focus();
    this.setState({
      isClosed: false,
    });
  };

  private startPingLoop = () => {
    if (this.ws) {
      this.ws.send(
        JSON.stringify({
          id: generateUniqKey(),
          method: 'ping',
        }),
      );

      this._pingClock = setTimeout(() => {
        this.startPingLoop();
      }, 3000);
    }
  };

  componentWillUnmount() {
    clearTimeout(this._pingClock);
    this.disposeSession();
    if (this.xtermInstance) {
      this.xtermInstance.dispose();
    }
    if (this.ws) {
      this.ws.close();
    }
    removeEventListener('resize', this.resize);
  }

  private reconnect = () => {
    if (this.xtermInstance) {
      this.xtermInstance.dispose();
    }
    if (this.ws) {
      this.ws.close();
    }
    clearTimeout(this._pingClock);
    this.disposeSession();
    this.initTerminal();
  };

  public rendertitle() {
    return (
      <Text type="secondary" style={{ fontWeight: 'normal' }}>
        {
          formatMessage({
            id: 'odc.components.OBClientPage.NoteToReferenceAScript',
          })
          /* 提示：如需引用脚本，可在脚本管理中上传脚本后引用 */
        }
      </Text>
    );
  }

  public renderExtra() {
    const { isClosed } = this.state;
    if (this.props.simpleHeader) {
      return (
        <Button onClick={this.reconnect} disabled={!isClosed}>
          {formatMessage({ id: 'odc.components.OBClientPage.Reconnect' }) /*重新连接*/}
        </Button>
      );
    }
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {isClosed ? (
          <a onClick={this.reconnect}>
            {
              formatMessage({
                id: 'odc.components.OBClientPage.Reconnect',
              })
              /* 重新连接 */
            }
          </a>
        ) : null}
      </div>
    );
  }

  render() {
    return (
      <Card
        bordered={false}
        size="small"
        title={!this.props.simpleHeader ? this.rendertitle() : this.renderExtra()}
        extra={!this.props.simpleHeader ? this.renderExtra() : null}
        className={classNames(styles.main, {
          [styles.simpleHeader]: this.props.simpleHeader,
        })}
        bodyStyle={{ paddingBottom: '0px' }}
      >
        <div style={{ height: '100%', width: '100%', position: 'relative' }} ref={this.xtermRef} />
      </Card>
    );
  }
}

export default OBClient;
