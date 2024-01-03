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

import type { IManagerRole } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Space } from 'antd';
import React from 'react';

export const useRoleListByIds = (roles: IManagerRole[], roleIds: number[]) => {
  const relatedRoles = [];
  if (roles?.length && roles?.length) {
    roleIds?.forEach((id) => {
      const role = roles?.find((item) => item?.id === id);
      if (role) {
        relatedRoles?.push(role);
      }
    });
  }
  return relatedRoles?.filter((item) => item?.name);
};

// 是否需要内聚掉？
const RoleList: React.FC<{
  roles: IManagerRole[];
  isShowIcon?: boolean;
  isWrap?: boolean;
}> = ({ roles, isShowIcon = false, isWrap = false }) => {
  return (
    <div title={roles?.map((item) => item.name)?.join(' | ')}>
      <Space split="|" size={10} wrap={isWrap}>
        {roles?.length ? (
          roles?.map(({ name, enabled }) => (
            <Space size={5}>
              <span title={name}>{name}</span>
              {!enabled && isShowIcon && (
                <span
                  title={formatMessage({
                    id: 'odc.components.UserPage.component.RoleDisabled',
                  })}
                  /* 角色已停用 */
                >
                  <ExclamationCircleFilled style={{ color: '#faad14' }} />
                </span>
              )}
            </Space>
          ))
        ) : (
          <span>-</span>
        )}
      </Space>
    </div>
  );
};

export default RoleList;
