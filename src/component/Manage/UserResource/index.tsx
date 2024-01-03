/*
 * Copyright 2024 OceanBase
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

import { getUserList } from '@/common/network/manager';
import { EmptyLabel } from '@/component/CommonFilter';
import DisplayTable from '@/component/DisplayTable';
import RoleList, { useRoleListByIds } from '@/component/Manage/RoleList';
import type { IManagerRole } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getSourceAuthLabelString, getSourceAuthOptions, sourceAuthMap } from '@/util/manage';
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
        const _roles = useRoleListByIds(roles, roleIds);
        return <RoleList roles={_roles} isShowIcon />;
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
  roles: IManagerRole[];
}> = (props) => {
  const { id, authorizedResource, roleIds, roles, getColumns } = props;
  const [userInfo, setUserInfo] = useState([]);
  const [allRoleIds, setAllRoleIds] = useState([]);
  const allRoles = useRoleListByIds(roles, allRoleIds);
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
