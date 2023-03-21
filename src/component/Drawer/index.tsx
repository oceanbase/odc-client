import { Drawer as AntdDrawer, DrawerProps, Space } from 'antd';
import React, { ReactElement } from 'react';

import styles from './index.less';

interface IProps extends DrawerProps {
  footerBtns: ReactElement[];
}

const Drawer: React.FC<IProps> = function (props) {
  const { footerBtns, children, ...rest } = props;
  return (
    <AntdDrawer {...rest}>
      <div className={styles.content}>{children}</div>
      <div className={styles.footer}>
        <Space>{footerBtns}</Space>
      </div>
    </AntdDrawer>
  );
};

export default Drawer;
