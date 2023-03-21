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
