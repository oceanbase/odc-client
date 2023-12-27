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

import Node from '@/component/TreeNode';
import Icon from '@ant-design/icons';
import { Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { PureComponent } from 'react';
// @ts-ignore
import { ReactComponent as FunctionSvg } from '@/svgr/Function.svg';
import { formatMessage } from '@/util/intl';

enum MenuKey {
  BROWSER_SCHEMA = 'BROWSER_SCHEMA',
  CREATE_FUNCTION = 'CREATE_FUNCTION',
  DELETE_FUNCTION = 'DELETE_FUNCTION',
}

export default class FunctionTreeNode extends PureComponent<{
  title: string;
  onBrowserSchema: () => void; // 双击节点默认行为
  onCreateFunction: () => void;
  onDeleteFunction: (funName: string) => void;
}> {
  public handleMenuClick = (param: MenuInfo) => {
    const { title, onBrowserSchema, onCreateFunction, onDeleteFunction } = this.props;
    switch (param.key) {
      case MenuKey.BROWSER_SCHEMA:
        onBrowserSchema();
        break;
      case MenuKey.CREATE_FUNCTION:
        onCreateFunction();
        break;
      case MenuKey.DELETE_FUNCTION:
        onDeleteFunction(title);
        break;
      default:
    }
  };

  public render() {
    const { title, onBrowserSchema } = this.props;
    return (
      <Node
        title={title}
        disabled={false}
        icon={
          <Icon
            component={FunctionSvg}
            style={{
              color: '#8750d8',
            }}
          />
        }
        onDoubleClick={onBrowserSchema}
        onMenuClick={this.handleMenuClick}
      >
        <Menu.Item key={MenuKey.BROWSER_SCHEMA}>
          {formatMessage({ id: 'workspace.tree.function.browserSchema' })}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={MenuKey.CREATE_FUNCTION}>
          {formatMessage({ id: 'workspace.tree.function.create' })}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={MenuKey.DELETE_FUNCTION}>
          {formatMessage({ id: 'workspace.tree.table.delete' })}
        </Menu.Item>
      </Node>
    );
  }
}
