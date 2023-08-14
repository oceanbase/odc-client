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

import { Dropdown, Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { PureComponent, ReactNode } from 'react';

import styles from './index.less';

export default class TreeNode extends PureComponent<{
  icon: string | ReactNode;
  title: string;
  style?: any;
  onMenuClick: (param: MenuInfo) => void;
  onDoubleClick: () => void;
  disabled: boolean;
}> {
  public render() {
    const { title, style, icon, disabled, onMenuClick, onDoubleClick, children } = this.props;
    const menu = (
      <Menu
        style={{
          width: '160px',
        }}
        onClick={(e) => {
          e.domEvent.preventDefault();
          e.domEvent.stopPropagation();
          onMenuClick(e);
        }}
      >
        {children}
      </Menu>
    );
    return (
      <Dropdown overlay={menu} trigger={['contextMenu']} disabled={disabled}>
        <span style={{ userSelect: 'none', ...style }} onDoubleClick={onDoubleClick}>
          <span style={{ display: 'inline-block', fontSize: 14 }}>
            <span
              style={{
                display: 'inline-block',
                verticalAlign: 'text-bottom',
                lineHeight: 1,
              }}
            >
              {icon}
            </span>
          </span>
          <span className={styles.title}>{title}</span>
        </span>
      </Dropdown>
    );
  }
}
