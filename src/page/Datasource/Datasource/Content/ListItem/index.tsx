import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

import ClusterSvg from '@/svgr/graphic_cluster.svg';
import HostSvg from '@/svgr/graphic_server.svg';
import TenantSvg from '@/svgr/graphic_tenant.svg';
import { haveOCP } from '@/util/env';
import { Space, Spin, Tooltip } from 'antd';

interface IProps {
  connectionName: React.ReactElement;
  cluster: React.ReactElement;
  tenant: React.ReactElement;
  host: React.ReactElement;
  action: React.ReactElement;
  env: React.ReactElement;
  isConnecting?: boolean;
}

const ListItem: React.FC<IProps> = function ({
  connectionName,
  cluster,
  tenant,
  host,
  action,
  isConnecting,
  env,
}) {
  return (
    <Spin spinning={isConnecting}>
      <div className={styles.item}>
        <div className={classNames(styles.base, styles.connectionName)}>{connectionName}</div>
        <Tooltip
          placement="topLeft"
          title={
            <Space>
              {
                formatMessage(
                  {
                    id: 'odc.Content.ListItem.ClusterCluster',
                  },
                  { cluster: cluster },
                ) /*集群: {cluster}*/
              }
            </Space>
          }
        >
          <div className={classNames(styles.base, styles.cluster)}>
            <Space wrap={false}>
              <Icon component={ClusterSvg} />
              {cluster}
            </Space>
          </div>
        </Tooltip>
        <Tooltip
          placement="topLeft"
          title={
            <Space>
              {
                formatMessage(
                  {
                    id: 'odc.Content.ListItem.TenantTenant',
                  },
                  { tenant: tenant },
                ) /*租户: {tenant}*/
              }
            </Space>
          }
        >
          <div className={classNames(styles.base, styles.tenant)}>
            <Space>
              <Icon component={TenantSvg} />
              {tenant}
            </Space>
          </div>
        </Tooltip>
        {!haveOCP() && (
          <Tooltip
            title={
              <Space>
                {
                  formatMessage(
                    {
                      id: 'odc.Content.ListItem.HostPortHost',
                    },
                    { host: host },
                  ) /*主机:端口: {host}*/
                }
              </Space>
            }
          >
            <div className={classNames(styles.base, styles.host)}>
              <Space>
                <Icon component={HostSvg} />
                {host}
              </Space>
            </div>
          </Tooltip>
        )}
        <div className={classNames(styles.base, styles.env)}>{env}</div>
        <div className={classNames(styles.base, styles.action)}>{action}</div>
      </div>
    </Spin>
  );
};
export default ListItem;
