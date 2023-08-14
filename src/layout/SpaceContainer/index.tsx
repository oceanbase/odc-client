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
