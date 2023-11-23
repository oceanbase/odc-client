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
import ProcedureSvg from '@/svgr/Stored-procedure.svg';
import { formatMessage } from '@/util/intl';

enum MenuKey {
  BROWSER_SCHEMA = 'BROWSER_SCHEMA',
  CREATE_PROCEDURE = 'CREATE_PROCEDURE',
  DELETE_TABLE = 'DELETE_TABLE',
}

export default class ProcedureTreeNode extends PureComponent<{
  title: string;
  onBrowserSchema: () => void; // 双击节点默认行为
  onCreateProcedure: () => void;
  onDeleteFunction: (funName: string) => void;
}> {
  public handleMenuClick = (param: MenuInfo) => {
    const { title, onBrowserSchema, onCreateProcedure, onDeleteFunction } = this.props;
    switch (param.key) {
      case MenuKey.BROWSER_SCHEMA:
        onBrowserSchema();
        break;
      case MenuKey.CREATE_PROCEDURE:
        onCreateProcedure();
        break;
      case MenuKey.DELETE_TABLE:
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
            component={ProcedureSvg}
            style={{
              color: '#52C41A',
            }}
          />
        }
        onDoubleClick={onBrowserSchema}
        onMenuClick={this.handleMenuClick}
      >
        <Menu.Item key={MenuKey.BROWSER_SCHEMA}>
          {formatMessage({ id: 'workspace.tree.procedure.browserSchema' })}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={MenuKey.CREATE_PROCEDURE}>
          {formatMessage({ id: 'workspace.tree.procedure.create' })}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={MenuKey.DELETE_TABLE}>
          {formatMessage({ id: 'workspace.tree.table.delete' })}
        </Menu.Item>
      </Node>
    );
  }
}
