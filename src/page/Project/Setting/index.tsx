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
import React, { useEffect, useState } from 'react';

import { Menu } from 'antd';
import styles from './index.less';
import Info from './Info';
import Notifacation from './Notifacation';
import tracert from '@/util/tracert';

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
  useEffect(() => {
    tracert.expo('a3112.b64002.c330862');
  }, []);
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
