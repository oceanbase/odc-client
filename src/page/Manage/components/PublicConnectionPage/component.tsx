import { deletePublicConnection } from '@/common/network/manager';
import appConfig from '@/constant/appConfig';
import {
  ConnectType,
  IManagerDetailTabs,
  IManagerPublicConnection,
  IManagerResourceType,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Button, Descriptions, Divider, message, Space } from 'antd';
import React, { useState } from 'react';
import { CommonDeleteModal } from '../CommonDeleteModal';
import { CommonUserResource } from '../CommonUserResource';
import RelativeTaskFlow from '../RelativeTaskFlow';
import styles from './index.less';
import RelativeRoles from './relativeRoles';

const ConnectionTypeMap = {
  [ConnectType.CLOUD_OB_MYSQL]: formatMessage({
    id: 'odc.components.PublicConnectionPage.component.PublicCloud',
  }),
  [ConnectType.CLOUD_OB_ORACLE]: formatMessage({
    id: 'odc.components.PublicConnectionPage.component.PublicCloud',
  }),
  // 公有云
  [ConnectType.OB_MYSQL]: formatMessage({
    id: 'odc.components.PublicConnectionPage.component.ApsaraStack',
  }),
  [ConnectType.OB_ORACLE]: formatMessage({
    id: 'odc.components.PublicConnectionPage.component.ApsaraStack',
  }),
  [ConnectType.ODP_SHARDING_OB_MYSQL]: formatMessage({
    id: 'odc.components.PublicConnectionPage.component.ApsaraStack',
  }),
  // 专有云
};

const UserDetail: React.FC<{
  data: IManagerPublicConnection;
  handleCloseAndReload: () => void;
}> = ({ data, handleCloseAndReload }) => {
  const {
    name,
    id,
    dialectType,
    host,
    port,
    clusterName,
    tenantName,
    username,
    createTime,
    updateTime,
    readonlyUsername,
    sysTenantUsername,
    creatorName,
    resourceGroups,
  } = data;
  const [visible, setVisible] = useState(false);

  const handleDelete = async () => {
    const res = await deletePublicConnection(id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.PublicConnectionPage.component.Deleted',
        }),

        // 删除成功
      );
      setVisible(false);
      handleCloseAndReload();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.PublicConnectionPage.component.UnableToDelete',
        }),

        // 删除失败
      );
    }
  };

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.PublicConnectionPage.component.ConnectionMode',
          })}

          /* 连接模式 */
        >
          {dialectType}
        </Descriptions.Item>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={formatMessage({
            id: 'odc.components.PublicConnectionPage.component.ConnectionName',
          })}

          /* 连接名称 */
        >
          {name}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.PublicConnectionPage.component.ResourceGroup',
          })}
          /* 所属资源组 */
        >
          {resourceGroups.length ? (
            resourceGroups?.map((item) => item.name)?.join(' | ')
          ) : (
            <span>-</span>
          )}
        </Descriptions.Item>

        <Descriptions.Item>
          <Space direction="vertical" className={styles.adress}>
            <div className={styles.authLabel}>
              {
                formatMessage({
                  id: 'odc.components.PublicConnectionPage.component.Endpoint',
                })

                /* 连接地址 */
              }
            </div>
            <Descriptions column={1}>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.PublicConnectionPage.component.HostName',
                })}

                /* 主机名 */
              >
                {host}
              </Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.PublicConnectionPage.component.Port',
                })}

                /* 端口 */
              >
                {port}
              </Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.PublicConnectionPage.component.Cluster',
                })}

                /* 集群 */
              >
                {clusterName}
              </Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.components.PublicConnectionPage.component.Tenant',
                })}

                /* 租户 */
              >
                {tenantName}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.PublicConnectionPage.component.DatabaseReadWriteUsername',
          })}
          /* 数据库读写用户名 */
        >
          {username}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.PublicConnectionPage.component.DatabaseReadOnlyUsername',
          })}
          /* 数据库只读用户名 */
        >
          {readonlyUsername}
        </Descriptions.Item>
        {appConfig.connection.sys && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.components.PublicConnectionPage.component.QueryTheSysTenantAccount',
            })}

            /* 查询sys租户账号 */
          >
            {sysTenantUsername}
          </Descriptions.Item>
        )}
      </Descriptions>
      <Divider />
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.PublicConnectionPage.component.Founder',
          })}

          /* 创建人 */
        >
          {creatorName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.PublicConnectionPage.component.Created',
          })}

          /* 创建时间 */
        >
          {getLocalFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.PublicConnectionPage.component.UpdateTime',
          })}

          /* 更新时间 */
        >
          {getLocalFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Space size={5}>
        <span>
          {
            formatMessage({
              id: 'odc.components.PublicConnectionPage.component.AfterAPublicConnectionIs',
            })

            /* 删除公共连接后，赋予该连接的用户将无法访问 */
          }
        </span>
        <Button
          type="link"
          onClick={() => {
            setVisible(true);
          }}
        >
          {
            formatMessage({
              id: 'odc.components.PublicConnectionPage.component.DeleteAPublicConnection',
            })

            /* 删除公共连接 */
          }
        </Button>
      </Space>
      <CommonDeleteModal
        type={formatMessage({
          id: 'odc.components.PublicConnectionPage.component.PublicConnection',
        })}
        /* 公共连接 */
        description={formatMessage({
          id: 'odc.components.PublicConnectionPage.component.AfterAPublicConnectionIs.1',
        })}
        /* 删除公共连接后，赋与该连接的用户将无法访问 */
        name={name}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={handleDelete}
      />
    </>
  );
};

const UserResource: React.FC<{
  data: IManagerPublicConnection;
}> = ({ data: { id } }) => {
  return (
    <CommonUserResource
      id={id}
      authorizedResource={`${IManagerResourceType.public_connection}:${id}`}
    />
  );
};

const RoleResource: React.FC<{
  data: IManagerPublicConnection;
}> = ({ data: { id } }) => {
  return <RelativeRoles id={id} />;
};

const TaskFlow: React.FC<{
  data: IManagerPublicConnection;
}> = ({ data: { id } }) => {
  return <RelativeTaskFlow resourceId={id} resourceType={IManagerResourceType.public_connection} />;
};

const DetailContents = {
  [IManagerDetailTabs.DETAIL]: UserDetail,
  [IManagerDetailTabs.RESOURCE]: UserResource,
  [IManagerDetailTabs.ROLE]: RoleResource,
  [IManagerDetailTabs.TASK_FLOW]: TaskFlow,
};

export const UserDetailContent: React.FC<{
  activeKey: IManagerDetailTabs;
  data: IManagerPublicConnection;
  handleCloseAndReload: () => void;
}> = ({ activeKey, ...rest }) => {
  const DetailContent = DetailContents[activeKey];
  return <DetailContent {...rest} />;
};
