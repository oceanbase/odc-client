import PageLoading from '@/component/PageLoading';
import { SpaceType } from '@/d.ts/_index';
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
    const isPersonal =
      userStore.organizations?.find((item) => item.id === organizationId)?.type ===
      SpaceType.PRIVATE;
    if (isPersonal && location.hash?.indexOf('sqlworkspace') === -1) {
      /**
       * 私人空间禁止
       */
      navigate('/sqlworkspace');
    }
  }, [location.hash, organizationId, userStore.organizations]);

  return isSwitching ? (
    <PageLoading showError={false} />
  ) : (
    <>
      <Outlet />
    </>
  );
};

export default inject('userStore')(observer(OrganizationListenWrap));
