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
              }) /*姓名：*/
            }{' '}
            {name}
          </div>
          <div className={styles.ellipsis} title={accountName}>
            {
              formatMessage({
                id: 'odc.component.UserPopover.Account',
              }) /*账号：*/
            }{' '}
            {accountName}
          </div>
          {roleNames && (
            <div className={styles.ellipsis} title={roleNames}>
              {
                formatMessage({
                  id: 'odc.component.UserPopover.Role',
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
