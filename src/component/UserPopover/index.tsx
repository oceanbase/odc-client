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

import { formatMessage } from '@/util/intl';
import { Popover, Space } from 'antd';
import React from 'react';
import styles from './index.less';

const UserPopover: React.FC<{
  name: string;
  accountName: string;
  roles: string[];
}> = (props) => {
  const { name, accountName, roles } = props ?? {};
  const roleNames = roles?.join(' | ');
  return (
    <Popover
      overlayClassName={styles.userPopover}
      content={
        <Space direction="vertical">
          <div className={styles.ellipsis} title={name}>
            {
              formatMessage({
                id: 'odc.component.UserPopover.Name',
                defaultMessage: '姓名：',
              }) /*姓名：*/
            }{' '}
            {name}
          </div>
          <div className={styles.ellipsis} title={accountName}>
            {
              formatMessage({
                id: 'odc.component.UserPopover.Account',
                defaultMessage: '账号：',
              }) /*账号：*/
            }{' '}
            {accountName}
          </div>
          {roleNames && (
            <div className={styles.ellipsis} title={roleNames}>
              {
                formatMessage({
                  id: 'odc.component.UserPopover.Role',
                  defaultMessage: '角色：',
                }) /*角色：*/
              }{' '}
              {roleNames}
            </div>
          )}
        </Space>
      }
    >
      {name}
    </Popover>
  );
};
export default UserPopover;
