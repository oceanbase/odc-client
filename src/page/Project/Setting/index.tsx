import { formatMessage } from '@/util/intl';
import React, { useState } from 'react';

import { Menu } from 'antd';
import styles from './index.less';
import Info from './Info';
import Notifacation from './Notifacation';

enum MenuKey {
  INFO = 'info',
  NOTIFICATION = 'notification',
}
interface IProps {
  id: string;
}

const Components = {
  [MenuKey.INFO]: Info,
  [MenuKey.NOTIFICATION]: Notifacation,
};

const Setting: React.FC<IProps> = (props) => {
  const [menuKey, setmenuKey] = useState<MenuKey>(MenuKey.INFO);
  const Component = Components[menuKey];
  return (
    <div className={styles.setting}>
      <div className={styles.menu}>
        <Menu
          selectedKeys={[menuKey]}
          onSelect={(e) => {
            setmenuKey(e.key as MenuKey);
          }}
          mode="vertical"
        >
          <Menu.Item key={MenuKey.INFO}>
            {formatMessage({ id: 'odc.Project.Setting.ProjectInformation' }) /*项目信息*/}
          </Menu.Item>
          {/* <Menu.Item key={MenuKey.NOTIFICATION}>通知设置</Menu.Item> */}
        </Menu>
      </div>
      <div className={styles.content}>
        <Component />
      </div>
    </div>
  );
};

export default Setting;
