import { Popover } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

interface IProps {
  menu?: JSX.Element;
  small?: boolean;
}

const DropMenu: React.FC<IProps> = function ({ children, menu, small }) {
  return (
    <Popover
      overlayClassName={classNames(styles.dropmenu, { [styles.small]: small })}
      content={menu}
      trigger={['hover']}
      zIndex={1000}
      placement="right"
    >
      {children}
    </Popover>
  );
};

export default DropMenu;
