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

import { actionTypes, IConnection, IConnectionStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { message, Popover, Space, Tooltip } from 'antd';
import React from 'react';

import Icon, { Loading3QuartersOutlined, MinusCircleFilled } from '@ant-design/icons';

import ConnectionPopover from '@/component/ConnectionPopover';
import { IDatasource } from '@/d.ts/datasource';
import classNames from 'classnames';
import styles from './index.less';
import { getDataSourceStyleByConnectType } from '@/common/datasource';

interface IProps {
  connection: IConnection;
  openNewConnection: (connection: IConnection) => Promise<void>;
}

const ConnectionName: React.FC<IProps> = function ({ connection, openNewConnection }) {
  if (!connection) {
    return null;
  }
  function getStatusIcon() {
    const { status, type } = connection;
    const DBIcon = getDataSourceStyleByConnectType(type)?.icon;
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
            <Icon
              style={{ color: DBIcon.color }}
              component={DBIcon.component}
              className={styles.activeStatus}
            />
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
            <Icon
              component={DBIcon.component}
              style={{ filter: 'grayscale(1)' }}
              className={styles.activeStatus}
            />
          </Tooltip>
        );
      }
    }
  }

  const isActive = [IConnectionStatus.ACTIVE, IConnectionStatus.NOPASSWORD].includes(
    connection?.status?.status,
  );
  function openConnection(connection: IDatasource) {
    if (!isActive) {
      return;
    }
    if (!connection.permittedActions?.includes(actionTypes.update)) {
      message.error(
        formatMessage({ id: 'odc.List.ConnectionNameItem.TheDataSourceIsNot' }), //无该数据源权限
      );
      return;
    }
    openNewConnection(connection);
  }
  return (
    <div
      className={classNames(styles.container, { [styles.isActive]: isActive })}
      onClick={() => openConnection(connection)}
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
      </Space>
    </div>
  );
};

export default ConnectionName;
