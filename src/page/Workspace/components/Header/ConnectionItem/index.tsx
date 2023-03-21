import ConnectionPopover from '@/component/ConnectionPopover';
import { ConnectionMode } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { Popover } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';

import MySQLSvg from '@/svgr/mysql.svg';
import OracleSvg from '@/svgr/oracle.svg';

import { ClusterStore } from '@/store/cluster';
import { haveOCP } from '@/util/env';
import ConnectionMenuList from '../ConnectionMenuList';
import styles from '../index.less';

interface IProps {
  connectionStore?: ConnectionStore;
  clusterStore?: ClusterStore;
}

function ConnectionMenuListWrap() {
  return (
    <div>
      <div
        style={{
          paddingTop: 12,
          fontWeight: 500,
          fontSize: 14,
          paddingLeft: 12,
        }}
      >
        {
          formatMessage({
            id: 'odc.Header.ConnectionItem.SwitchConnections',
          }) /*切换连接*/
        }
      </div>
      <ConnectionMenuList newWindow={false} />
    </div>
  );
}

const ConnectionItem: React.FC<IProps> = function (props) {
  const { connectionStore, clusterStore } = props;
  const [showList, setShowList] = useState(false);
  const { connection } = connectionStore;
  useEffect(() => {
    if (haveOCP()) {
      clusterStore.loadClusterList(connection?.visibleScope);
    }
  }, []);
  const clusterName = clusterStore?.clusterList.find(
    (cluster) => cluster.instanceId === connection?.clusterName,
  )?.instanceName;
  return (
    <Popover
      content={
        showList ? <ConnectionMenuListWrap /> : <ConnectionPopover connection={connection} />
      }
      overlayClassName={styles.connectionPopover}
      placement="bottomLeft"
      onVisibleChange={(visible) => {
        if (!visible) {
          /**
           * tooltip 有动画，需要动画完成后再变更状态
           */
          setTimeout(() => {
            setShowList(false);
          }, 300);
        }
      }}
    >
      <span
        onClick={() => {
          console.log('click');
          setShowList(true);
        }}
        className={styles.connectionName}
      >
        <span
          style={{
            fontSize: 16,
            marginRight: 4,
            lineHeight: '16px',
          }}
        >
          {connection.dbMode == ConnectionMode.OB_ORACLE ? (
            <OracleSvg
              style={{
                verticalAlign: 'bottom',
                fill: 'rgba(255,255,255,0.85)',
              }}
            />
          ) : (
            <MySQLSvg
              style={{
                verticalAlign: 'bottom',
                fill: 'rgba(255,255,255,0.85)',
              }}
            />
          )}
        </span>
        <span className={styles.name}>{connection && connection.sessionName}</span>
      </span>
    </Popover>
  );
};

export default inject('connectionStore', 'clusterStore')(observer(ConnectionItem));
