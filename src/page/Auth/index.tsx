import { getConnectionList } from '@/common/network/connection';
import { getRoleList, getUserList } from '@/common/network/manager';
import { canAcess, createPermission } from '@/component/Acess';
import PageContainer, { TitleType } from '@/component/PageContainer';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { IPageType } from '@/d.ts/_index';
import { formatMessage } from '@/util/intl';
import React, { useState } from 'react';
import { history, useParams } from 'umi';
import Autoauth from './Autoauth';
import { ResourceContext } from './context';
import Role from './Role';
import User from './User';
interface IProps {}

const Pages = {
  [IPageType.Auth_User]: {
    component: User,
  },
  [IPageType.Auth_Role]: {
    component: Role,
  },
  [IPageType.Auth_Autoauth]: {
    component: Autoauth,
  },
};

const tabs = [
  {
    tab: formatMessage({ id: 'odc.page.Auth.User' }), //用户
    key: IPageType.Auth_User,
  },
  {
    tab: formatMessage({ id: 'odc.page.Auth.Role' }), //角色
    key: IPageType.Auth_Role,
  },
  {
    tab: formatMessage({ id: 'odc.page.Auth.AutomaticAuthorization' }), //自动授权
    key: IPageType.Auth_Autoauth,
    permission: createPermission(IManagerResourceType.auto_auth, actionTypes.read),
  },
];

const Index: React.FC<IProps> = function () {
  const params = useParams<{ id: string; page: IPageType }>();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [resource, setPublicConnections] = useState([]);
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/auth/${key}`);
  };

  const loadRoles = async () => {
    const roles = await getRoleList();
    setRoles(roles?.contents);
  };

  const loadUsers = async () => {
    const users = await getUserList();
    setUsers(users?.contents);
  };

  const loadConnections = async () => {
    const res = await getConnectionList({});
    setPublicConnections(res?.contents);
  };

  const displayTabs = tabs.filter((tab) => {
    if (tab.permission) {
      return canAcess(tab.permission)?.accessible;
    }
    return true;
  });

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: formatMessage({ id: 'odc.page.Auth.UserPermissions' }), //用户权限
      }}
      tabList={displayTabs}
      tabActiveKey={page}
      onTabChange={handleChange}
    >
      <ResourceContext.Provider
        value={{
          roles,
          users,
          resource,
          loadRoles,
          loadUsers,
          loadConnections,
        }}
      >
        <Component id={id} />
      </ResourceContext.Provider>
    </PageContainer>
  );
};

export default Index;
