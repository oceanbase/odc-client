import { UserStore } from '@/store/login';
import { Outlet } from '@umijs/max';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';
import Sider from './Sider';

interface ISpaceContainerProps {
  userStore: UserStore;
}
const SpaceContainer: React.FC<ISpaceContainerProps> = (props) => {
  return (
    <div key={props?.userStore?.user?.organizationId} className={styles.content}>
      <Sider />
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
};

export default inject('userStore')(observer(SpaceContainer));
