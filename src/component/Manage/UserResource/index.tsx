import { getUserList } from '@/common/network/manager';
import { EmptyLabel } from '@/component/CommonFilter';
import DisplayTable from '@/component/DisplayTable';
import RoleList, { useRoleListByIds } from '@/component/Manage/RoleList';
import type { IManagerRole } from '@/d.ts';
import { getSourceAuthLabelString, getSourceAuthOptions, sourceAuthMap } from '@/page/Manage';
import { formatMessage } from '@/util/intl';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const getDefaultColumns = (roles: IManagerRole[]) => {
  const authFilters = getSourceAuthOptions().map(({ title: text, value }) => ({
    text,
    value,
  }));

  return [
    {
      dataIndex: 'name',
      title: formatMessage({ id: 'odc.components.CommonUserResource.Name' }), // 姓名
      ellipsis: true,
      width: 120,
      render: (name, record) => (
        <Tooltip
          placement="right"
          color="var(--background-normal-color)"
          overlayClassName={styles.name}
          title={
            <Space direction="vertical">
              <span>
                {
                  formatMessage(
                    {
                      id: 'odc.components.CommonUserResource.NameName',
                    },
                    { name },
                  ) /* 姓名：{name} */
                }
              </span>
              <span>
                {
                  formatMessage(
                    {
                      id: 'odc.components.CommonUserResource.AccountRecordaccountname',
                    },
                    { recordAccountName: record.accountName },
                  ) /* 账号：{recordAccountName} */
                }
              </span>
            </Space>
          }
        >
          <span>{name}</span>
          <InfoCircleOutlined style={{ margin: '0px 4px', color: 'var(--text-color-secondary)' }} />
        </Tooltip>
      ),
    },

    {
      dataIndex: 'roleIds',
      title: formatMessage({ id: 'odc.components.CommonUserResource.Role' }), // 角色
      ellipsis: true,
      filters: roles.map(({ name, id }) => {
        return {
          text: name,
          value: id,
        };
      }),
      onFilter: (value, record) => {
        return record?.roleIds?.includes(value) || (!value && !record.roleIds?.length);
      },
      render: (roleIds) => {
        return <RoleList roleIds={roleIds} isShowIcon />;
      },
    },

    {
      dataIndex: 'authorizedActions',
      title: formatMessage({
        id: 'odc.components.CommonUserResource.Permissions',
      }),
      // 权限
      width: 108,
      ellipsis: true,
      filters: authFilters,
      onFilter: (value, record) => {
        return sourceAuthMap[value].hasSourceAuth(record?.authorizedActions);
      },
      render: (authorizedActions) => getSourceAuthLabelString(authorizedActions),
    },
  ];
};

export const CommonUserResource: React.FC<{
  id: number;
  getColumns?: (roles: IManagerRole[]) => any[];
  authorizedResource?: string;
  roleIds?: number[];
}> = (props) => {
  const { id, authorizedResource, roleIds, getColumns } = props;
  const [userInfo, setUserInfo] = useState([]);
  const [allRoleIds, setAllRoleIds] = useState([]);
  const allRoles = useRoleListByIds(allRoleIds);
  allRoles.unshift({ name: <EmptyLabel />, id: 0 } as any);
  const columns = getColumns ? getColumns(allRoles) : getDefaultColumns(allRoles);

  useEffect(() => {
    (async () => {
      const data = await getUserList({
        authorizedResource,
        roleId: roleIds,
      });

      setUserInfo(data?.contents);
      if (data?.contents?.length) {
        const allIds = data.contents.reduce((ids, item) => ids.concat(item.roleIds), []);
        setAllRoleIds(Array.from(new Set([...allIds])));
      }
    })();
  }, [id]);

  return (
    <DisplayTable
      rowKey="id"
      columns={columns}
      dataSource={userInfo}
      scroll={null}
      disablePagination
    />
  );
};
