import { getConnectionBySessionId, newSession } from '@/common/network/connection';
import { changeCloseMsg } from '@/page/Workspace';
import commonStore from '@/store/common';
import connection from '@/store/connection';
import pageStore from '@/store/page';
import schemaStore from '@/store/schema';
import sqlStore from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { Button, message, Modal, Space } from 'antd';
import { history } from 'umi';
import ShowConnectPassword from '../ConnectPassowrd';
import styles from './index.less';

function getPathFromParams(params: { sessionId: string; tabKey: string; databaseName?: string }) {
  return `/workspace/session/${params.tabKey}/sid:${params.sessionId}:d:${
    params.databaseName || ''
  }`;
}

let isOpened: boolean = false;
/**
 * 设置了之后，这个sid不再弹出报错
 */
let notOpenSid: string;
export async function reconnect() {
  const oldSessionId = connection.lastSessionId;

  if (!oldSessionId) {
    throw new Error('fail');
  }

  const dbSessionId = oldSessionId.split('-')[0];

  await createSession(dbSessionId, true, true);
}

export async function createSession(
  sid: string,
  keepStatus: boolean,
  currentWindow: boolean = false,
) {
  if (!sid) {
    return;
  }

  const connectionInfo = await getConnectionBySessionId(sid);
  if (!connectionInfo) {
    return;
  }
  let password;
  if (!connectionInfo?.passwordSaved) {
    password = await ShowConnectPassword(connectionInfo?.id?.toString());
    if (password == null) {
      return;
    }
  }

  const sessionId = await newSession(sid, password, null, {
    tenantId: connectionInfo?.tenantName,
    instanceId: connectionInfo?.clusterName,
  });

  if (sessionId) {
    const path = keepStatus
      ? getPathFromParams({
          tabKey: commonStore.tabKey,
          sessionId,
          databaseName: schemaStore?.database?.name,
        })
      : getPathFromParams({
          tabKey: commonStore.generateNewTabKey(),
          sessionId,
          databaseName: connectionInfo.defaultSchema,
        });
    if (currentWindow) {
      history.push(path);
      changeCloseMsg(undefined);
      location.reload();
    } else {
      window.open(`#${path}`);
    }
    return;
  }

  throw new Error('fail');
}
export default function showReConnectModal(
  errorMsg: string = formatMessage({
    id: 'request.connection.expired',
  }),
) {
  if (
    isOpened ||
    history.location?.hash?.indexOf('/login') > -1 ||
    (notOpenSid && notOpenSid === connection.sessionId)
  ) {
    return;
  }

  isOpened = true;
  const onOk = async () => {
    try {
      await reconnect();
    } catch (e) {
      message.error(
        formatMessage({ id: 'odc.component.ReconnectModal.FailedToReconnect' }), // 重新连接失败
      );
      throw e;
    }
  };

  const onClose = (modal: { destroy: () => void }) => {
    isOpened = false;
    modal.destroy();
  };

  const onCancel = (modal: { destroy: () => void }) => {
    history.push(`/connections`);
    pageStore.clear();
    schemaStore.clear();
    sqlStore.clearExecuteRecords();
    onClose(modal);
  };

  const modal = Modal.confirm({
    zIndex: 1003,
    className: styles.reconnectionModal,
    title: formatMessage({
      id: 'odc.component.ReconnectModal.TheConnectionIsDisconnected',
    }),

    centered: true,
    content: (
      <div>
        <div className={styles.content}>{errorMsg}</div>
        <div className={styles.footer}>
          <Space>
            <Button
              onClick={() => {
                notOpenSid = connection.sessionId;
                return onClose(modal);
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.ReconnectModal.NotConnected',
                }) /* 暂不连接 */
              }
            </Button>
            <Button
              onClick={() => {
                return onCancel(modal);
              }}
            >
              {formatMessage({
                id: 'odc.component.ReconnectModal.ReturnConnectionList',
              })}
            </Button>
            <Button type="primary" onClick={onOk}>
              {formatMessage({ id: 'odc.component.ReconnectModal.Reconnect' })}
            </Button>
          </Space>
        </div>
      </div>
    ),
  });
}
