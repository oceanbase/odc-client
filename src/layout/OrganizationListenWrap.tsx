import { formatMessage } from '@/util/intl';
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
import { Outlet, useLocation, useNavigate } from '@umijs/max';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect } from 'react';
import { PageLoadingContext } from './PageLoadingWrapper';
interface IProps {
  userStore?: UserStore;
}
const OrganizationListenWrap: React.FC<IProps> = function ({ children, userStore }) {
  const organizationId = userStore?.organizationId;
  const isSwitching = userStore?.isSwitchingOrganization;
  const location = useLocation();
  const navigate = useNavigate();
  const loadingContext = useContext(PageLoadingContext);
  useEffect(() => {
    if (isSwitching) {
      loadingContext?.setTask({
        tip: formatMessage({
          id: 'odc.src.layout.SwitchSpace',
        }), //'正在切换空间'
        showError: false,
      });
    } else {
      loadingContext?.removeTask();
    }
  }, [isSwitching]);
  useEffect(() => {
    const isPersonal = userStore.isPrivateSpace();
    if (isPersonal && location.pathname?.indexOf('sqlworkspace') === -1) {
      /**
       * 私人空间禁止
       */
      navigate('/sqlworkspace');
    }
  }, [location.pathname, organizationId, userStore.organizations]);
  return isSwitching ? (
    <></>
  ) : (
    <>
      <Outlet />
    </>
  );
};
export default inject('userStore')(observer(OrganizationListenWrap));
