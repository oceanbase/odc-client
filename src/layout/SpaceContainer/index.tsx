import { UserStore } from '@/store/login';
import { Outlet, useNavigate } from '@umijs/max';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import Sider from './Sider';

interface ISpaceContainerProps {
  userStore: UserStore;
}
const SpaceContainer: React.FC<ISpaceContainerProps> = (props) => {
  const navigate = useNavigate();
  const organizationId = props?.userStore?.organizationId;
  const [id, setId] = useState(organizationId);
  useEffect(() => {
    if (id && organizationId && id !== organizationId) {
      navigate('/project');
    }
    setId(organizationId);
  }, [organizationId]);
  return (
    <div key={id} className={styles.content}>
      <Sider />
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  );
};

export default inject('userStore')(observer(SpaceContainer));
