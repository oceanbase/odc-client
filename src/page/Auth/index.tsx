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

import { getConnectionList } from '@/common/network/connection';
import { getResourceRoles, getRoleList, getUserList } from '@/common/network/manager';
import { listProjects } from '@/common/network/project';
import { canAcess, createPermission } from '@/component/Acess';
import PageContainer, { TitleType } from '@/component/PageContainer';
import { actionTypes, IManagerResourceType, IResourceRole } from '@/d.ts';
import { IProject } from '@/d.ts/project';
import { IPageType } from '@/d.ts/_index';
import { formatMessage } from '@/util/intl';
import React, { useState } from 'react';
import { history, useParams } from '@umijs/max';
import Autoauth from './Autoauth';
import { ResourceContext } from './context';
import Role from './Role';
import User from './User';

export const getProjectRoleNameByIds = (roles: IResourceRole[], roleIds: number[]) => {
  const names = [];
  if (roles?.length && roleIds?.length) {
    roleIds?.forEach((id) => {
      const name = roles?.find((item) => item?.id === id)?.roleName;
      if (name) {
        names?.push(name);
      }
    });
  }
  return names;
};

export const getProjectName = (projects: IProject[], projectId: number) => {
  return projects?.find((item) => item?.id === projectId)?.name;
};

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
  const [projectRoles, setProjectRoles] = useState([]);
  const [projects, setProjects] = useState([]);
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

  const loadProjectRoles = async () => {
    const res = await getResourceRoles({});
    setProjectRoles(res?.contents);
  };

  const loadProjects = async () => {
    const res = await listProjects(null, null, null);
    setProjects(res?.contents);
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
          projectRoles,
          projects,
          loadRoles,
          loadUsers,
          loadConnections,
          loadProjectRoles,
          loadProjects,
        }}
      >
        <Component id={id} />
      </ResourceContext.Provider>
    </PageContainer>
  );
};

export default Index;
