import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

import Action from '@/component/Action';
import { IDatasource } from '@/d.ts/datasource';
import ClusterSvg from '@/svgr/graphic_cluster.svg';
import HostSvg from '@/svgr/graphic_server.svg';
import TenantSvg from '@/svgr/graphic_tenant.svg';
import ODCSvg from '@/svgr/odc_logo_color.svg';
import { haveOCP } from '@/util/env';
import Icons, { PlusSquareOutlined } from '@ant-design/icons';
import { Space, Tag, Tooltip } from 'antd';

interface IProps {
  data: IDatasource;
  onClick: (data: IDatasource) => void;
}

const ListItem: React.FC<IProps> = function ({ data, onClick }) {
  return (
    <div className={styles.item}>
      <div className={classNames(styles.base, styles.expand)}>
        <PlusSquareOutlined />
      </div>
      <div onClick={() => onClick(data)} className={classNames(styles.base, styles.connectionName)}>
        <Space size={14}>
          <Icons style={{ fontSize: 16 }} component={ODCSvg} />
          {data?.name}
        </Space>
      </div>
      <Tooltip
        placement="topLeft"
        title={
          <Space>
            {
              formatMessage(
                {
                  id: 'odc.Content.ListItem.ClusterCluster',
                },
                { cluster: data?.clusterName },
              ) /*集群: {cluster}*/
            }
          </Space>
        }
      >
        <div className={classNames(styles.base, styles.cluster)}>
          <Space wrap={false}>
            <Icon component={ClusterSvg} />
            {data?.clusterName}
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
                { tenant: data?.tenantName },
              ) /*租户: {tenant}*/
            }
          </Space>
        }
      >
        <div className={classNames(styles.base, styles.tenant)}>
          <Space>
            <Icon component={TenantSvg} />
            {data?.tenantName}
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
                  { host: data?.host },
                ) /*主机:端口: {host}*/
              }
            </Space>
          }
        >
          <div className={classNames(styles.base, styles.host)}>
            <Space>
              <Icon component={HostSvg} />
              {data?.host}
            </Space>
          </div>
        </Tooltip>
      )}
      <div className={classNames(styles.base, styles.tag)}>
        <Tag color="blue">测试</Tag>
      </div>
      <div className={classNames(styles.base, styles.action)}>
        <Action.Group size={0}>
          <Action.Link>编辑</Action.Link>
          <Action.Link>删除</Action.Link>
        </Action.Group>
      </div>
    </div>
  );
};
export default ListItem;
