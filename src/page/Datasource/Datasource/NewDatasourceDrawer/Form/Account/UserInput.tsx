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

import { ClusterStore } from '@/store/cluster';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Empty, Input, Select } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { forwardRef, useEffect, useState } from 'react';

interface IProps {
  placeholder: string;
  baseWidth?: number;
  tenantId: string;
  clusterId: string;
  clusterStore?: ClusterStore;
  value?: any;
  onChange?: any;
}

const Option = Select.Option;

const UserInput: React.FC<IProps> = forwardRef(function (props, ref) {
  const { placeholder, baseWidth, tenantId, clusterId, clusterStore, value, onChange } = props;
  const [userLoading, setUserLoading] = useState(false);

  async function fetchUserList() {
    try {
      setUserLoading(true);
      await clusterStore.loadTenantDBUsers(clusterId, tenantId);
    } catch (e) {
      console.error(e);
    } finally {
      setUserLoading(false);
    }
  }
  useEffect(() => {
    if (tenantId && clusterId) {
      fetchUserList();
    }
  }, [tenantId, clusterId, clusterStore]);
  const users = clusterStore.userListMap[tenantId];
  return haveOCP() ? (
    <Select
      placeholder={placeholder}
      style={{
        width: baseWidth,
      }}
      ref={ref as any}
      value={value}
      onChange={onChange}
      showSearch
      loading={userLoading}
      notFoundContent={
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={formatMessage({
            id: 'odc.AddConnectionForm.Account.UserInput.NoDatabaseAccountIsAvailable',
          })} /*暂无数据库账号，请在租户工作台创建*/
        />
      }
    >
      {users?.map((user) => {
        return (
          <Option value={user.userName} key={user.userName}>
            {user.userName}
          </Option>
        );
      })}
    </Select>
  ) : (
    <Input
      ref={ref as any}
      autoComplete="new-user"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={
        baseWidth
          ? {
              width: baseWidth,
            }
          : null
      }
    />
  );
});

export default inject('clusterStore')(observer(UserInput));
