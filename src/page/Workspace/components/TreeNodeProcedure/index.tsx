import Node from '@/component/TreeNode';
import Icon from '@ant-design/icons';
import { Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { PureComponent } from 'react';
import { FormattedMessage } from '@umijs/max';
// @ts-ignore
import ProcedureSvg from '@/svgr/Stored-procedure.svg';

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
          <FormattedMessage id="workspace.tree.procedure.browserSchema" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={MenuKey.CREATE_PROCEDURE}>
          <FormattedMessage id="workspace.tree.procedure.create" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key={MenuKey.DELETE_TABLE}>
          <FormattedMessage id="workspace.tree.table.delete" />
        </Menu.Item>
      </Node>
    );
  }
}
