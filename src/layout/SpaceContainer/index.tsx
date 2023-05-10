import { Outlet } from '@umijs/max';
import React from 'react';
import styles from './index.less';
import Sider from './Sider';

interface ISpaceContainerProps {}
const SpaceContainer: React.FC<ISpaceContainerProps> = (props) => {
  return (
    <div className={styles.content}>
      <Sider />
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
};

export default SpaceContainer;
