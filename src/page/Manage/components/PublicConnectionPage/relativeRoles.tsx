import DisplayTable from '@/component/DisplayTable';
import { getSourceAuthLabelString } from '@/page/Manage';
import { formatMessage } from '@/util/intl';
import { Descriptions } from 'antd';
import React, { useEffect, useState } from 'react';

const getColumns = () => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.PublicConnectionPage.relativeRoles.RoleName',
      }), //角色名称
      ellipsis: true,
    },

    {
      dataIndex: 'authorizedActions',
      title: formatMessage({
        id: 'odc.components.PublicConnectionPage.relativeRoles.Permission',
      }), //权限
      width: 108,
      ellipsis: true,
      render: (authorizedActions) => getSourceAuthLabelString(authorizedActions),
    },
  ];
};

const RelativeRoles: React.FC<{
  id: number;
}> = ({ id }) => {
  const [roles, setRoles] = useState<{
    admin: [];
    visitor: [];
  }>(null);

  const loadData = async () => {
    //
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const columns = getColumns();

  return (
    <Descriptions column={1} layout="vertical">
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.PublicConnectionPage.relativeRoles.RolesThatCanManageConnections',
        })} /*可管理连接的角色*/
      >
        <DisplayTable
          rowKey="id"
          columns={columns}
          dataSource={roles?.admin}
          scroll={null}
          disablePagination={true}
        />
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.PublicConnectionPage.relativeRoles.RolesThatCanAccessConnections',
        })} /*可访问连接的角色*/
      >
        <DisplayTable
          rowKey="id"
          columns={columns}
          dataSource={roles?.visitor}
          scroll={null}
          disablePagination={true}
        />
      </Descriptions.Item>
    </Descriptions>
  );
};

export default RelativeRoles;
