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

import { resourceManagementActionOptions } from '@/page/Auth/Role/component/ResourceSelector/const';
import { formatMessage } from '@/util/intl';

export enum ResourceManagementAction {
  can_manage = 'can_manage',
  can_update = 'can_update',
  can_read = 'can_read',
  can_create = 'can_create',
  sencrity_administrator = 'SECURITY_ADMINISTRATOR',
  owner = 'OWNER',
  dba = 'DBA',
}

export const resourceManagementActionMap = {
  [ResourceManagementAction.can_manage]: ['delete', 'read', 'update'],
  [ResourceManagementAction.can_update]: ['read', 'update'],
  [ResourceManagementAction.can_read]: ['read'],
  [ResourceManagementAction.sencrity_administrator]: ['SECURITY_ADMINISTRATOR'],
  [ResourceManagementAction.owner]: ['OWNER'],
  [ResourceManagementAction.dba]: ['DBA'],
};

export const resourceAuthMap = {
  [ResourceManagementAction.can_create]: {
    hasAuth: hasCreateAuth,
  },
  [ResourceManagementAction.can_read]: {
    hasAuth: hasReadAuth,
  },
  [ResourceManagementAction.can_update]: {
    hasAuth: hasEditAuth,
  },
  [ResourceManagementAction.can_manage]: {
    hasAuth: hasManageAuth,
  },
};

// 新建权限
export function hasAuth(auths: string[] = [], type: ResourceManagementAction) {
  return resourceManagementActionMap[type].every((action) => {
    return auths?.includes(action);
  });
}

// 新建权限
export function hasCreateAuth(auths: string[] = []) {
  return auths?.includes('create');
}

// 仅查看权限
export function hasReadAuth(auths: string[] = []) {
  return auths?.length === 1 && hasAuth(auths, ResourceManagementAction.can_read);
}

// 可编辑权限
export function hasEditAuth(auths: string[] = []) {
  return hasAuth(auths, ResourceManagementAction.can_update) && !hasManageAuth(auths);
}

// 可管理权限
export function hasManageAuth(auths: string[] = []) {
  return hasAuth(auths, ResourceManagementAction.can_manage);
}

export const getAuthLabelString = (auths: string[] = []) => {
  const labels = auths.includes('create')
    ? [
        formatMessage({ id: 'odc.page.Auth.utils.CanBeCreated', defaultMessage: '可新建' }), //可新建
      ]
    : [];
  const otherLabel = resourceManagementActionOptions?.find((item) => {
    return resourceManagementActionMap[item?.value].every((action) => {
      return auths?.includes(action);
    });
  })?.label;
  return labels.concat(otherLabel)?.filter(Boolean).join(',');
};
