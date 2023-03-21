import { deleteResourceGroup } from '@/common/network/manager';
import DisplayTable from '@/component/DisplayTable';
import type { IManagerResourceGroup } from '@/d.ts';
import { IManagerDetailTabs, IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Button, Descriptions, Divider, message, Space } from 'antd';
import React, { useState } from 'react';
import { CommonDeleteModal } from '../CommonDeleteModal';
import Status from '../CommonStatus';
import { CommonUserResource } from '../CommonUserResource';
import RelativeTaskFlow from '../RelativeTaskFlow';

import styles from './index.less';

const getConnectionColumns = () => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.ResourceGroupPage.component.ConnectionName',
      }), // 连接名称
      ellipsis: true,
    },

    {
      dataIndex: 'enabled',
      title: formatMessage({
        id: 'odc.components.ResourceGroupPage.component.State',
      }), // 状态
      ellipsis: true,
      width: 108,
      filters: [
        {
          text: formatMessage({
            id: 'odc.components.ResourceGroupPage.component.Enable',
          }), // 启用
          value: true,
        },

        {
          text: formatMessage({
            id: 'odc.components.ResourceGroupPage.component.Disable',
          }), // 停用
          value: false,
        },
      ],

      onFilter: (value, record) => value === record.enabled,
      render: (enabled) => <Status enabled={enabled} />,
    },
  ];
};

const UserDetail: React.FC<{
  data: IManagerResourceGroup;
  handleCloseAndReload: () => void;
}> = ({ data, handleCloseAndReload }) => {
  const { name, id, description, connections, creatorName, createTime, updateTime } = data;
  const [visible, setVisible] = useState(false);

  const handleDelete = async () => {
    const res = await deleteResourceGroup(id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.ResourceGroupPage.component.Deleted',
        }), // 删除成功
      );
      setVisible(false);
      handleCloseAndReload();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.ResourceGroupPage.component.UnableToDelete',
        }), // 删除失败
      );
    }
  };

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={formatMessage({
            id: 'odc.components.ResourceGroupPage.component.ResourceGroupName',
          })} /* 资源组名称 */
        >
          {name}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.ResourceGroupPage.component.Note',
          })} /* 备注 */
        >
          {description}
        </Descriptions.Item>
      </Descriptions>
      <Space direction="vertical" className={styles.publicConnection}>
        <div className={styles.authLabel}>
          {
            formatMessage({
              id: 'odc.components.ResourceGroupPage.component.PublicConnection',
            }) /* 公共连接 */
          }
        </div>
        <DisplayTable
          rowKey="id"
          columns={getConnectionColumns()}
          dataSource={connections}
          disablePagination
          scroll={null}
        />
      </Space>
      <Divider
        style={{
          margin: `${connections?.length % 2 === 1 ? '0 0 12px' : '12px 0'}`,
        }}
      />
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.ResourceGroupPage.component.Founder',
          })} /* 创建人 */
        >
          {creatorName}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.ResourceGroupPage.component.Created',
          })} /* 创建时间 */
        >
          {getLocalFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.ResourceGroupPage.component.UpdateTime',
          })} /* 更新时间 */
        >
          {getLocalFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Space size={5}>
        <span>
          {
            formatMessage({
              id: 'odc.components.ResourceGroupPage.component.AfterYouDeleteAResource',
            }) /* 删除资源组后，赋予该连接的用户将无法访问 */
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
              id: 'odc.components.ResourceGroupPage.component.DeleteAResourceGroup',
            }) /* 删除资源组 */
          }
        </Button>
      </Space>
      <CommonDeleteModal
        type={formatMessage({
          id: 'odc.components.ResourceGroupPage.component.ResourceGroup',
        })} /* 资源组 */
        description={formatMessage({
          id: 'odc.components.ResourceGroupPage.component.AfterAResourceGroupIs',
        })} /* 删除资源组后，赋予该资源组的用户将丢失相关公共资源 */
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
  data: IManagerResourceGroup;
}> = ({ data: { id } }) => {
  return (
    <CommonUserResource
      id={id}
      authorizedResource={`${IManagerResourceType.resource_group}:${id}`}
    />
  );
};

const TaskFlow: React.FC<{
  data: IManagerResourceGroup;
}> = ({ data: { id } }) => {
  return <RelativeTaskFlow resourceId={id} resourceType={IManagerResourceType.resource_group} />;
};

const DetailContents = {
  [IManagerDetailTabs.DETAIL]: UserDetail,
  [IManagerDetailTabs.RESOURCE]: UserResource,
  [IManagerDetailTabs.TASK_FLOW]: TaskFlow,
};

export const UserDetailContent: React.FC<{
  activeKey: IManagerDetailTabs;
  data: IManagerResourceGroup;
  handleCloseAndReload: () => void;
}> = ({ activeKey, ...rest }) => {
  const DetailContent = DetailContents[activeKey];
  return <DetailContent {...rest} />;
};
