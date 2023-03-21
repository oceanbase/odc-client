import { IConnection, IConnectionStatus, IConnectionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Popover, Space, Tag, Tooltip } from 'antd';
import React from 'react';

import WifiIcon from '@/svgr/Wifi.svg';
import Icon, {
  ExclamationCircleFilled,
  Loading3QuartersOutlined,
  MinusCircleFilled,
} from '@ant-design/icons';

import ConnectionPopover from '@/component/ConnectionPopover';
import classNames from 'classnames';
import styles from './index.less';

interface IProps {
  connection: IConnection;
  openNewConnection: (connection: IConnection) => Promise<void>;
}

const ConnectionName: React.FC<IProps> = function ({ connection, openNewConnection }) {
  if (!connection) {
    return null;
  }
  function getStatusIcon() {
    const { status, visibleScope } = connection;
    switch (status?.status) {
      case IConnectionStatus.TESTING: {
        return (
          <Tooltip
            placement="top"
            title={formatMessage({
              id: 'odc.components.ConnectionCardList.StatusSynchronizationInProgress',
            })}
          >
            <Loading3QuartersOutlined
              spin
              style={{
                color: '#1890FF',
              }}
            />
          </Tooltip>
        );
      }
      case IConnectionStatus.ACTIVE: {
        return (
          <Tooltip
            placement="top"
            title={formatMessage({
              id: 'odc.components.ConnectionCardList.ValidConnection',
            })}
          >
            <Icon component={WifiIcon} className={styles.activeStatus} />
          </Tooltip>
        );
      }
      case IConnectionStatus.NOPASSWORD: {
        return (
          <Tooltip
            placement="top"
            title={
              formatMessage({
                id: 'odc.components.ConnectionCardList.TheConnectionPasswordIsNot',
              })

              // 连接密码未保存，无法获取状态
            }
          >
            <MinusCircleFilled />
          </Tooltip>
        );
      }
      case IConnectionStatus.DISABLED: {
        return (
          <Tooltip
            placement="top"
            title={formatMessage({
              id: 'odc.page.ConnectionList.columns.TheConnectionIsDisabled',
            })}

            /* 连接已停用 */
          >
            <MinusCircleFilled />
          </Tooltip>
        );
      }
      case IConnectionStatus.INACTIVE:
      default: {
        return (
          <Tooltip title={status?.errorMessage} placement="top">
            <ExclamationCircleFilled
              style={{
                color: '#F5222D',
              }}
            />
          </Tooltip>
        );
      }
    }
  }

  const isActive = [IConnectionStatus.ACTIVE, IConnectionStatus.NOPASSWORD].includes(
    connection?.status?.status,
  );

  return (
    <div
      className={classNames(styles.container, { [styles.isActive]: isActive })}
      onClick={isActive ? () => openNewConnection(connection) : null}
    >
      <Space>
        {getStatusIcon()}
        <Popover
          overlayClassName={styles.connectionPopover}
          content={<ConnectionPopover connection={connection} />}
        >
          <div
            style={{
              height: '100%',
              color: isActive ? null : 'var(--text-color-placeholder)',
            }}
          >
            {connection.name}
          </div>
        </Popover>
        {connection.visibleScope === IConnectionType.ORGANIZATION ? (
          <Tag>
            {
              formatMessage({
                id: 'odc.List.ConnectionNameItem.Public',
              }) /*公共*/
            }
          </Tag>
        ) : null}
      </Space>
    </div>
  );
};

export default ConnectionName;
