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

import UserPopover from '@/component/UserPopover';
import type { IAudit } from '@/d.ts';
import { AuditEventResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Descriptions, Space } from 'antd';
import React from 'react';
import styles from './index.less';
import { AuditEventActionMap, AuditEventMetaMap, IUserMap } from '@/constant/record';

export const Status: React.FC<{
  result: AuditEventResult;
}> = ({ result }) => {
  return (
    <Space size={5}>
      {result === AuditEventResult.SUCCESS ? (
        <>
          <CheckCircleFilled style={{ color: '#52c41a' }} />
          <span>
            {
              formatMessage({
                id: 'odc.components.RecordPage.component.Successful',
              }) /*成功*/
            }
          </span>
        </>
      ) : (
        <>
          <CloseCircleFilled style={{ color: '#ff4d4f' }} />
          <span>
            {
              formatMessage({
                id: 'odc.components.RecordPage.component.Failed',
              }) /*失败*/
            }
          </span>
        </>
      )}
    </Space>
  );
};

export const JsonView: React.FC<{
  value: string;
}> = ({ value }) => {
  let viewStr = '';
  try {
    viewStr = JSON.stringify(JSON.parse(value ?? '-'), null, 2);
  } catch (error) {
    // value 是单纯的字符串，并不是 json string
    viewStr = value;
  }

  return <div className={styles.jsonView}>{viewStr}</div>;
};

export const RecordContent: React.FC<{
  data: IAudit;
  userMap?: IUserMap;
}> = ({ data, userMap }) => {
  const {
    type,
    action,
    connectionName,
    connectionDialectType,
    connectionHost,
    connectionPort,
    connectionClusterName,
    connectionTenantName,
    connectionUsername,
    username,
    clientIpAddress,
    detail,
    startTime,
    result,
  } = data;
  const { name, accountName, roleNames = [] } = userMap?.[username] ?? {};
  return (
    <Descriptions column={1}>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RecordPage.component.EventType',
        })} /*事件类型*/
      >
        {AuditEventMetaMap[type]}
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RecordPage.component.EventAction',
        })} /*事件操作*/
      >
        {AuditEventActionMap[action]}
      </Descriptions.Item>
      {connectionName && (
        <Descriptions.Item>
          <Space direction="vertical" className={styles.connection}>
            <div className={styles.authLabel}>
              {
                formatMessage({
                  id: 'odc.components.RecordPage.component.Connection',
                }) /*所属连接*/
              }
            </div>
            <Descriptions column={1}>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.RecordPage.component.ConnectionName',
                })} /*连接名称*/
              >
                {connectionName || '-'}
              </Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.RecordPage.component.ConnectionMode',
                })} /*连接模式*/
              >
                {connectionDialectType || '-'}
              </Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.RecordPage.component.HostnamePort',
                })} /*主机名/端口*/
              >{`${connectionHost || '-'}/${connectionPort || '-'}`}</Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.RecordPage.component.ClusterTenant',
                })} /*集群/租户*/
              >{`${connectionClusterName || '-'}/${
                connectionTenantName || '-'
              }`}</Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.RecordPage.component.DatabaseUsername',
                })} /*数据库用户名*/
              >
                {connectionUsername || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </Descriptions.Item>
      )}
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RecordPage.component.IpSource',
        })} /*IP来源*/
      >
        {clientIpAddress || '-'}
      </Descriptions.Item>
      <Descriptions.Item className={styles.blockDesc}>
        <Space direction="vertical">
          <div className={styles.authLabel}>
            {
              formatMessage({
                id: 'odc.components.RecordPage.component.DetailedRules',
              }) /*执行细则*/
            }
          </div>
          <JsonView value={detail} />
        </Space>
      </Descriptions.Item>
      {userMap && (
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.RecordPage.component.Executor',
          })} /*执行人*/
        >
          <UserPopover name={name ?? '-'} accountName={accountName ?? '-'} roles={roleNames} />
        </Descriptions.Item>
      )}
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RecordPage.component.ExecutionTime',
        })} /*执行时间*/
      >
        {getFormatDateTime(startTime)}
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.RecordPage.component.ExecutionResult',
        })} /*执行结果*/
      >
        <Status result={result} />
      </Descriptions.Item>
    </Descriptions>
  );
};
