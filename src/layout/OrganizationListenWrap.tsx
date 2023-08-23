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

import PageLoading from '@/component/PageLoading';
import { UserStore } from '@/store/login';
import { Outlet, useLocation, useNavigate } from '@umijs/max';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';

interface IProps {
  userStore?: UserStore;
}

const key = '$odc_event_organizationKey';

const OrganizationListenWrap: React.FC<IProps> = function ({ children, userStore }) {
  const organizationId = userStore?.organizationId;
  const isSwitching = userStore?.isSwitchingOrganization;
  const location = useLocation();
  const navigate = useNavigate();

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
    <PageLoading showError={false} />
  ) : (
    <>
      <Outlet />
    </>
  );
};

export default inject('userStore')(observer(OrganizationListenWrap));
