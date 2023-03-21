import Node from '@/component/TreeNode';
import Icon from '@ant-design/icons';
import { Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { PureComponent } from 'react';
import { FormattedMessage } from 'umi';
// @ts-ignore
import FunctionSvg from '@/svgr/Function.svg';

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
          <FormattedMessage id="workspace.tree.function.browserSchema" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={MenuKey.CREATE_FUNCTION}>
          <FormattedMessage id="workspace.tree.function.create" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={MenuKey.DELETE_FUNCTION}>
          <FormattedMessage id="workspace.tree.table.delete" />
        </Menu.Item>
      </Node>
    );
  }
}
