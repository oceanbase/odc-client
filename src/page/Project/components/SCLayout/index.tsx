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

import { Menu, Spin } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import styles from './index.less';

export type MenuItem = Required<MenuProps>['items'][number];
interface ISecureSiderProps {
  loading?: boolean;
  items: MenuItem[];
  selectedKey: string[];
  handleItemOnClick: (key: string) => void;
}
interface SCLayoutProps {
  sider: ISecureSiderProps;
  content: React.ReactNode;
}
const SCLayout: React.FC<SCLayoutProps> = ({ sider, content }) => {
  const { loading = false, items, selectedKey, handleItemOnClick } = sider;
  function renderList() {
    if (items?.length === 0) {
      return null;
    }
    useEffect(() => {
      handleItemOnClick?.(items?.[0]?.key as string);
    }, []);
    return (
      <Spin spinning={loading}>
        <Menu
          style={{
            marginTop: '12px',
          }}
          selectedKeys={selectedKey}
          defaultSelectedKeys={[items?.[0]?.key as string]}
          className={styles.menu}
          items={items}
          onClick={({ key }) => handleItemOnClick(key)}
        />
      </Spin>
    );
  }
  return (
    <div className={styles.layout}>
      <div className={styles.sider}>{renderList()}</div>
      <div className={classNames(styles.content, styles.envDrawer)}>{content}</div>
    </div>
  );
};
export default SCLayout;
