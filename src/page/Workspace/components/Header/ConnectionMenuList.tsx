import ConnectionPopover from '@/component/ConnectionPopover';
import { createSession } from '@/component/ReconnectModal';
import { IConnection } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { Empty, Input, Menu, Popover, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';

import styles from './index.less';

interface IProps {
  connectionStore?: ConnectionStore;
  newWindow?: boolean;
}

const ConnectionMenuList: React.FC<IProps> = function (props) {
  const { connectionStore, newWindow = true } = props;
  const [connections, setConnections] = useState<IConnection[]>([]);
  const [connectionName, setConnectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const { connection } = connectionStore;
  async function fetchData() {
    const res = await connectionStore.getList({
      visibleScope: connection.visibleScope,
    });

    setConnections(res?.contents);
    setLoading(false);
  }
  useEffect(() => {
    fetchData();
  }, []);

  const list = connections
    ?.map((c) => {
      if (c.sessionName.indexOf(connectionName) === -1) {
        return;
      }

      return (
        <Menu.Item key={`connection-${c.sid}`}>
          <Popover
            overlayClassName={styles.connectionPopover}
            placement="right"
            content={<ConnectionPopover connection={c} />}
          >
            <div
              style={{
                padding: '5px 12px',
              }}
            >
              {c.sessionName}
            </div>
          </Popover>
        </Menu.Item>
      );
    })
    .filter(Boolean);
  return (
    <Spin spinning={loading}>
      <Menu
        selectedKeys={[]}
        title={
          newWindow
            ? formatMessage({
                id: 'odc.components.Header.homeMenu.NewWindowOpensConnection',
              })
            : formatMessage({
                id: 'odc.components.Header.ConnectionMenuList.SwitchConnections',
              }) //切换连接
        }
        className={styles.sqlHomeMenu}
        onClick={async (info) => {
          const subKey = info.key;
          const sid = subKey?.split?.('-')[1];

          if (sid) {
            setLoading(true);
            try {
              await createSession(sid, false, !newWindow);
            } finally {
              setLoading(false);
            }
          }
        }}
      >
        <div key="search" className={styles.search}>
          <Input.Search
            placeholder={formatMessage({
              id: 'odc.components.Header.homeMenu.SearchForKeywords',
            })}
            /* 请搜索关键字 */
            onChange={(e) => {
              setConnectionName(e.target.value);
            }}
          />
        </div>
        {list?.length ? list : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </Menu>
    </Spin>
  );
};

export default inject('connectionStore')(observer(ConnectionMenuList));
