import Toolbar from '@/component/Toolbar';
import { formatMessage } from '@/util/intl';
import { ReadOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import React from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { generateSessionSid } from '@/common/network/pathUtil';
import { ModalStore } from '@/store/modal';
import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { SettingStore } from '@/store/setting';
import { generateUniqKey } from '@/util/utils';
import { inject, observer } from 'mobx-react';
import { AttachAddon } from './attach';
import styles from './index.less';

const { Text } = Typography;

interface IOBClientProps {
  modalStore?: ModalStore;
  settingStore?: SettingStore;
  params: {
    cid: number;
    dbName: string;
  };
}

interface IOBClientState {
  isClosed: boolean;
}

@inject('modalStore', 'settingStore')
@observer
class OBClient extends React.PureComponent<IOBClientProps, IOBClientState> {
  private xtermRef = React.createRef<HTMLDivElement>();

  private xtermFitAddon;

  private xtermInstance: Terminal;

  private ws: WebSocket;

  private _pingClock: any;

  private theme: string;

  private session: SessionStore;

  state: IOBClientState = {
    isClosed: false,
  };

  componentDidMount() {
    setTimeout(() => {
      this.initTerminal();
    });
    addEventListener('resize', () => {
      this.xtermFitAddon.fit();
    });
  }

  componentDidUpdate(
    prevProps: Readonly<IOBClientProps>,
    prevState: Readonly<IOBClientState>,
    snapshot?: any,
  ): void {
    if (this.props.settingStore.theme?.cmdTheme !== this.theme && this.xtermInstance) {
      this.xtermInstance.options.theme =
        this.props.settingStore.theme?.cmdTheme === 'white'
          ? {
              foreground: 'black', // 字体
              background: '#fff', // 背景色
              cursor: '#888', // 设置光标
              selection: '#87bffd', // 选中区域的背景色
            }
          : {};
      this.theme = this.props.settingStore.theme?.cmdTheme;
    }
  }

  private initTerminal = async () => {
    const { settingStore, params } = this.props;
    const dom = this.xtermRef.current;
    if (!dom) {
      return;
    }
    const session = await sessionManager.createSession(null, params?.cid);
    if (!session) {
      return;
    }
    this.session = session;
    this.theme = settingStore.theme.cmdTheme;
    this.xtermInstance = new Terminal({
      convertEol: true,
      cursorBlink: true,
      cursorStyle: 'bar',
      rendererType: 'canvas',
      theme:
        settingStore.theme.cmdTheme === 'white'
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
    if (this.xtermInstance) {
      this.xtermInstance.dispose();
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  private reconnect = () => {
    if (this.xtermInstance) {
      this.xtermInstance.dispose();
    }
    if (this.ws) {
      this.ws.close();
    }
    clearTimeout(this._pingClock);
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
        <Toolbar.Divider />
        <Toolbar.Button
          isShowText
          icon={<ReadOutlined />}
          style={{ padding: '5px' }}
          text={formatMessage({
            id: 'odc.components.OBClientPage.ScriptManagement',
          })}
          /* 脚本管理 */
          onClick={() => {
            this.props.modalStore.changeScriptManageModalVisible(true);
          }}
        />
      </div>
    );
  }

  readSettingDeps() {
    this.props.settingStore.theme;
  }

  render() {
    this.readSettingDeps();
    return (
      <Card
        size="small"
        title={this.rendertitle()}
        extra={this.renderExtra()}
        className={styles.main}
        bodyStyle={{ paddingBottom: '0px' }}
      >
        <div style={{ height: '100%', width: '100%', position: 'relative' }} ref={this.xtermRef} />
      </Card>
    );
  }
}

export default OBClient;
