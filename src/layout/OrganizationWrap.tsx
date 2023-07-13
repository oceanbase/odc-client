/**
 * 组织的初始化处理，校验并且设置默认的组织
 */
import PageLoading from '@/component/PageLoading';
import { IOrganization } from '@/d.ts';
import { SpaceType } from '@/d.ts/_index';
import { UserStore } from '@/store/login';
import { Outlet, useLocation, useNavigate } from '@umijs/max';
import { message } from 'antd';
import { inject } from 'mobx-react';
import React, { useEffect, useState } from 'react';

interface IProps {
  userStore?: UserStore;
}

export const sessionKey = '$odc_session_organizationKey';

const OrganizationWrap: React.FC<IProps> = function ({ userStore }) {
  const [isReady, setIsReady] = useState(false);
  const organizationId = userStore?.organizationId;
  const location = useLocation();
  const nav = useNavigate();

  async function selectOrganization() {
    const organizations = userStore.organizations;
    if (!organizations?.length) {
      return;
    }
    let personalOrganization: IOrganization = organizations.find(
      (item) => item.type === SpaceType.PRIVATE,
    );
    const firstOrganization = organizations.find((item) => item.type === SpaceType.SYNERGY);
    let defaultOrganization = firstOrganization || personalOrganization;
    if (!defaultOrganization) {
      message.error('Organization Invalid');
      return;
    }
    if (!(await userStore.switchCurrentOrganization(defaultOrganization?.id))) {
      return;
    }
    if (
      defaultOrganization?.type === SpaceType.PRIVATE &&
      !location.hash.includes('sqlworkspace')
    ) {
      nav('/sqlworkspace');
    }
    setIsReady(true);
  }

  useEffect(() => {
    if (organizationId) {
      setIsReady(true);
    } else {
      selectOrganization();
    }
  }, [organizationId]);

  return isReady ? (
    <>
      <Outlet />
    </>
  ) : (
    <PageLoading showError={false} />
  );
};

export default inject('userStore')(OrganizationWrap);
