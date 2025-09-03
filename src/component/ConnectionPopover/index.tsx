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
import { Space, Tooltip, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useMemo } from 'react';
import RiskLevelLabel from '../RiskLevelLabel';
import styles from './index.less';

const ConnectionPopover: React.FC<{
  connection: Partial<IConnection>;
  database?: IDatabase;
  showType?: boolean;
  showRemark?: boolean;
  clusterStore?: ClusterStore;
}> = (props) => {
  const { connection, clusterStore, showType = true, showRemark = false, database } = props;
  const isLogicDb = isLogicalDatabase(database);
  const isFileSyetem = isConnectTypeBeFileSystemGroup(connection?.type);
  if (!connection && !isLogicDb) {
    return null;
  }

  const DBIcon = getDataSourceStyleByConnectType(connection?.type || database?.connectType)?.icon;

  const databaseRemarkDescription = useMemo(() => {
    return (
      <div className={styles.describe}>
        <span className={styles.label}>
          {formatMessage({
            id: 'src.component.ConnectionPopover.7A11191E',
            defaultMessage: '备注：',
          })}
        </span>
        <div className={styles.content}>{database?.remark ?? '-'}</div>
      </div>
    );
  }, [database]);

  const dataSourceDescription = useMemo(() => {
    return (
      <div className={styles.describe}>
        <span className={styles.label}>
          {formatMessage({
            id: 'src.component.ConnectionPopover.2A18AD55',
            defaultMessage: '数据源：',
          })}
        </span>
        <div className={styles.content}>
          {connection?.name || database?.dataSource?.name || '-'}
        </div>
      </div>
    );
  }, [connection, database]);

  const projectDescription = useMemo(() => {
    return (
      <div className={styles.describe}>
        <span className={styles.label}>
          {formatMessage({
            id: 'src.component.ConnectionPopover.16ED170C',
            defaultMessage: '项目：',
          })}
        </span>
        <div className={styles.content}>
          {database?.project?.name || connection?.projectName || '-'}
        </div>
      </div>
    );
  }, [database, connection]);

  if (isFileSyetem) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{ lineHeight: '20px', maxWidth: '280px' }}
      >
        <Space direction="vertical">
          <Tooltip title={connection?.name}>
            <div
              style={{
                marginBottom: 4,
                fontFamily: 'PingFangSC-Semibold',
                color: 'var(--text-color-primary)',
                fontWeight: 'bold',
                width: '280px',
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
                {connection?.name}
              </div>
            </div>
          </Tooltip>
          {renderConnectionMode()}
          <div>
            {formatMessage(
              {
                id: 'src.component.ConnectionPopover.986CE021',
                defaultMessage: '文件URL：{LogicalExpression0}',
              },
              { LogicalExpression0: connection?.host ?? '-' },
            )}
          </div>
          <div>
            {formatMessage(
              {
                id: 'src.component.ConnectionPopover.4A02B634',
                defaultMessage: '地域：{LogicalExpression0}',
              },
              { LogicalExpression0: connection?.region ?? '-' },
            )}
          </div>
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
        style={{ lineHeight: '20px', maxWidth: '280px' }}
      >
        <Space direction="vertical">
          <Tooltip>
            <div
              style={{
                marginBottom: 4,
                fontFamily: 'PingFangSC-Semibold',
                color: 'var(--text-color-primary)',
                fontWeight: 'bold',
                width: '280px',
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
              { ConnectTypeTextDatabaseConnectType: ConnectTypeText(database?.connectType) },
            )}
          </div>
          {showRemark && databaseRemarkDescription}
        </Space>
      </div>
    );
  }

  let clusterAndTenant = (
    <div className={styles.describe}>
      <span className={styles.label}>
        {
          formatMessage({
            id: 'odc.components.Header.ConnectionPopover.ClusterTenant',
            defaultMessage: '集群/租户：',
          })

          /*集群/租户：*/
        }
      </span>
      <span className={styles.content}>
        {connection?.clusterName || '- '}/{connection?.tenantName || ' -'}
      </span>
    </div>
  );

  if (haveOCP()) {
    const isTenantInstance = !!clusterStore.tenantListMap?.[connection?.tenantName];
    if (isTenantInstance) {
      clusterAndTenant = (
        <div className={styles.describe}>
          <span className={styles.label}>
            {
              formatMessage({
                id: 'odc.component.ConnectionPopover.InstanceId',
                defaultMessage: '实例 ID:',
              })

              /*实例 ID:*/
            }
          </span>
          <span className={styles.content}>{connection?.tenantName}</span>
        </div>
      );
    } else {
      clusterAndTenant = (
        <div className={styles.describe}>
          <span className={styles.label}>
            {
              formatMessage({
                id: 'odc.component.ConnectionPopover.InstanceIdTenantId',
                defaultMessage: '实例ID/租户ID:',
              })

              /*实例ID/租户ID:*/
            }
          </span>
          <span className={styles.content}>
            {connection?.clusterName}/{connection?.tenantName}
          </span>
        </div>
      );
    }
  }
  function renderConnectionMode() {
    if (isLogicDb) return;
    const { type } = connection;
    return (
      <div>
        <span className={styles.label}>
          {
            formatMessage(
              {
                id: 'odc.component.ConnectionPopover.TypeConnecttypetexttype',
                defaultMessage: '类型：{ConnectTypeTextType}',
              },

              { ConnectTypeTextType: <Typography.Text>{ConnectTypeText(type)}</Typography.Text> },
            )

            /*类型：{ConnectTypeTextType}*/
          }
        </span>
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
        maxWidth: '280px',
      }}
    >
      <Space direction="vertical">
        <Tooltip title={database?.name}>
          <div
            style={{
              marginBottom: 4,
              fontFamily: 'PingFangSC-Semibold',
              color: 'var(--text-color-primary)',
              fontWeight: 'bold',
              width: 'max-content',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              maxWidth: '280px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RiskLevelLabel
                content={connection?.environmentName || database?.environment?.name}
                color={
                  connection?.environmentStyle?.toLowerCase() ||
                  database?.environment?.style?.toLowerCase()
                }
              />

              <DataBaseStatusIcon item={database} />
              <span style={{ marginLeft: '6px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {database?.name}
              </span>
            </div>
          </div>
        </Tooltip>
        {dataSourceDescription}
        {projectDescription}
        {renderConnectionMode()}
        {haveOCP() ? null : (
          <div className={styles.describe}>
            <span className={styles.label}>
              {
                formatMessage({
                  id: 'odc.components.Header.ConnectionPopover.HostnamePort',
                  defaultMessage: '主机名/端口：',
                })

                /*主机名/端口：*/
              }
            </span>
            <span className={styles.content}>
              {connection?.host}:{connection?.port}
            </span>
          </div>
        )}

        {clusterAndTenant}
        <div className={styles.label}>
          {
            formatMessage(
              {
                id: 'odc.components.Header.ConnectionPopover.DatabaseUsernameConnectiondbuser',
                defaultMessage: '数据库用户名：{connectionDbUser}',
              },

              {
                connectionDbUser: <Typography.Text>{connection?.username ?? '-'}</Typography.Text>,
              },
            )

            /*数据库用户名：{connectionDbUser}*/
          }
        </div>
        {showRemark && databaseRemarkDescription}
      </Space>
    </div>
  );
};

export default inject('clusterStore')(observer(ConnectionPopover));
