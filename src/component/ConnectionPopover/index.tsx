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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { ConnectTypeText } from '@/constant/label';
import { IConnection } from '@/d.ts';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { IDatabase } from '@/d.ts/database';
import { ClusterStore } from '@/store/cluster';
import { isLogicalDatabase } from '@/util/database';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import RiskLevelLabel from '../RiskLevelLabel';
import styles from './index.less';

const ConnectionPopover: React.FC<{
  connection: Partial<IConnection>;
  database?: IDatabase;
  showType?: boolean;
  clusterStore?: ClusterStore;
}> = (props) => {
  const { connection, clusterStore, showType = true, database } = props;
  const isLogicDb = isLogicalDatabase(database);
  const isFileSyetem = isConnectTypeBeFileSystemGroup(connection?.type);
  if (!connection && !isLogicDb) {
    return null;
  }

  const DBIcon = getDataSourceStyleByConnectType(connection?.type || database?.connectType)?.icon;

  if (isFileSyetem) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{ lineHeight: '20px' }}
      >
        <Space direction="vertical">
          <Tooltip title={connection.name}>
            <div
              style={{
                marginBottom: 4,
                fontFamily: 'PingFangSC-Semibold',
                color: 'var(--text-color-primary)',
                fontWeight: 'bold',
                maxWidth: '240px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <RiskLevelLabel
                  content={connection?.environmentName}
                  color={connection?.environmentStyle?.toLowerCase()}
                />
                <Icon
                  component={DBIcon?.component}
                  style={{ fontSize: 22, marginRight: 4, color: DBIcon?.color }}
                />{' '}
                {connection.name}
              </div>
            </div>
          </Tooltip>
          {renderConnectionMode()}
          <div>{`连接串地址：${connection.host ?? '-'}`}</div>
          <div>{`文件URL： ${connection.defaultSchema ?? '-'}`}</div>
        </Space>
      </div>
    );
  }

  if (isLogicDb) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{ lineHeight: '20px' }}
      >
        <Space direction="vertical">
          <Tooltip>
            <div
              style={{
                marginBottom: 4,
                fontFamily: 'PingFangSC-Semibold',
                color: 'var(--text-color-primary)',
                fontWeight: 'bold',
                maxWidth: '240px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <RiskLevelLabel
                  content={database?.environment?.name}
                  color={database?.environment?.style?.toLowerCase()}
                />

                <DataBaseStatusIcon item={database} />
                <div className={styles.ellipsis} title={database?.name}>{`${database?.name}`}</div>
              </div>
            </div>
          </Tooltip>
          <div
            style={{
              maxWidth: '400px',
            }}
            className={styles.ellipsis}
            title={database?.alias}
          >
            {formatMessage(
              {
                id: 'src.component.ConnectionPopover.F992A18D',
                defaultMessage: '逻辑库别名: {databaseAlias}',
              },
              { databaseAlias: database?.alias },
            )}
          </div>
          <div>
            {formatMessage(
              {
                id: 'src.component.ConnectionPopover.7A5FFB14',
                defaultMessage: '项目: {databaseProjectName}',
              },
              { databaseProjectName: database?.project?.name },
            )}
          </div>
          <div>
            {formatMessage(
              {
                id: 'src.component.ConnectionPopover.8E155F86',
                defaultMessage: '类型: {ConnectTypeTextDatabaseConnectType}',
              },
              { ConnectTypeTextDatabaseConnectType: ConnectTypeText[database?.connectType] },
            )}
          </div>
        </Space>
      </div>
    );
  }

  let clusterAndTenant = (
    <div>
      {
        formatMessage({
          id: 'odc.components.Header.ConnectionPopover.ClusterTenant',
          defaultMessage: '集群/租户：',
        })

        /*集群/租户：*/
      }
      {connection?.clusterName || '- '}/{connection?.tenantName || ' -'}
    </div>
  );

  if (haveOCP()) {
    const isTenantInstance = !!clusterStore.tenantListMap?.[connection?.tenantName];
    if (isTenantInstance) {
      clusterAndTenant = (
        <div>
          {
            formatMessage({
              id: 'odc.component.ConnectionPopover.InstanceId',
              defaultMessage: '实例 ID:',
            })

            /*实例 ID:*/
          }

          {connection?.tenantName}
        </div>
      );
    } else {
      clusterAndTenant = (
        <div>
          {
            formatMessage({
              id: 'odc.component.ConnectionPopover.InstanceIdTenantId',
              defaultMessage: '实例ID/租户ID:',
            })

            /*实例ID/租户ID:*/
          }
          {connection?.clusterName}/{connection.tenantName}
        </div>
      );
    }
  }
  function renderConnectionMode() {
    if (isLogicDb) return;
    const { type } = connection;
    return (
      <div>
        {
          formatMessage(
            {
              id: 'odc.component.ConnectionPopover.TypeConnecttypetexttype',
              defaultMessage: '类型：{ConnectTypeTextType}',
            },

            { ConnectTypeTextType: ConnectTypeText[type] },
          )

          /*类型：{ConnectTypeTextType}*/
        }
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{
        lineHeight: '20px',
        // padding: 12,
      }}
    >
      <Space direction="vertical">
        <Tooltip title={connection.name}>
          <div
            style={{
              marginBottom: 4,
              fontFamily: 'PingFangSC-Semibold',
              color: 'var(--text-color-primary)',
              fontWeight: 'bold',
              maxWidth: '240px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RiskLevelLabel
                content={connection?.environmentName}
                color={connection?.environmentStyle?.toLowerCase()}
              />
              <Icon
                component={DBIcon?.component}
                style={{ fontSize: 22, marginRight: 4, color: DBIcon?.color }}
              />{' '}
              {connection.name}
            </div>
          </div>
        </Tooltip>
        {renderConnectionMode()}
        {haveOCP() ? null : (
          <div>
            {
              formatMessage({
                id: 'odc.components.Header.ConnectionPopover.HostnamePort',
                defaultMessage: '主机名/端口：',
              })

              /*主机名/端口：*/
            }
            {connection.host}:{connection.port}
          </div>
        )}

        {clusterAndTenant}
        <div>
          {
            formatMessage(
              {
                id: 'odc.components.Header.ConnectionPopover.DatabaseUsernameConnectiondbuser',
                defaultMessage: '数据库用户名：{connectionDbUser}',
              },

              { connectionDbUser: connection.username ?? '-' },
            )

            /*数据库用户名：{connectionDbUser}*/
          }
        </div>
      </Space>
    </div>
  );
};

export default inject('clusterStore')(observer(ConnectionPopover));
