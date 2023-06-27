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
  const organizationId = userStore.user?.organizationId;
  const location = useLocation();
  const navigate = useNavigate();
  function addListener() {
    window.addEventListener('storage', () => {
      const organizationId = window.localStorage.getItem(key);
      if (organizationId !== userStore.user?.organizationId?.toString()) {
        window._forceRefresh = true;
        window.close();
      }
    });
  }

  function sendEvent() {
    if (organizationId) {
      window.localStorage.setItem(key, organizationId.toString());
    }
  }

  useEffect(() => {
    const isPersonal =
      userStore.user?.belongedToOrganizations?.find(
        (item) => item.id === userStore?.user?.organizationId,
      )?.type === SpaceType.PRIVATE;
    if (isPersonal && location.hash?.indexOf('sqlworkspace') === -1) {
      /**
       * 私人空间禁止
       */
      navigate('/sqlworkspace');
    }
  }, [location.hash, userStore.user]);

  useEffect(() => {
    sendEvent();
  }, [organizationId]);

  useEffect(() => {
    addListener();
  }, []);

  return (
    <>
      <Outlet />
    </>
  );
};

export default inject('userStore')(observer(OrganizationListenWrap));
