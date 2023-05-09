import Sider from '@/component/Sider';
import { Outlet } from '@umijs/max';
import React from 'react';
import styles from './SpaceContainer.less';

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
