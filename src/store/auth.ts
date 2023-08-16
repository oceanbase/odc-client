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

import { getCurrentUserPermissions } from '@/common/network/manager';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { action, observable } from 'mobx';
import { createContext } from 'react';

type Permissions = Map<
  IManagerResourceType,
  {
    resourceIds: Map<any, actionTypes[]>;
    all: actionTypes[];
  }
>;

export class AuthStore {
  @observable
  permissions: Permissions = new Map();

  @action
  public async getCurrentUserPermissions() {
    try {
      const response = await getCurrentUserPermissions();
      const { systemOperationPermissions = [], resourceManagementPermissions = [] } = response;
      /* {
        mock: {
          resourceIds: {
            1: ['create', 'update']
          },
          all: ['create']
        }
      } */
      const newPermissions: Permissions = new Map();
      resourceManagementPermissions?.concat(systemOperationPermissions)?.forEach((permission) => {
        const { actions = [], resourceId, resourceType } = permission;
        if (!newPermissions.get(resourceType as IManagerResourceType)) {
          newPermissions.set(resourceType as IManagerResourceType, {
            resourceIds: new Map(),
            all: [],
          });
        }
        const item = newPermissions.get(resourceType as IManagerResourceType);
        if (!resourceId) {
          item.all = item.all.concat((actions as actionTypes[]) || []);
        } else {
          const rid = resourceId?.toString();
          const data = item.resourceIds.get(rid) || [];
          item.resourceIds.set(rid, data.concat(actions as actionTypes[]));
        }
      });
      this.permissions = newPermissions;
      return response;
    } catch (e) {
      console.error('GetCurrentUserPermissions Failed', e);
    }
  }

  public getResourceActions(resourceId: any, resourceType: IManagerResourceType) {
    return new Set(
      this.permissions
        .get(resourceType)
        ?.all?.concat(
          this.permissions.get(resourceType).resourceIds.get(resourceId?.toString()) || [],
        ) || [],
    );
  }

  public getResourceByAction(resourceType: IManagerResourceType, action: actionTypes): any[] {
    const resource = this.permissions.get(resourceType);
    if (!resource) {
      return [];
    }
    let resourceIds = [];
    if (resource.all?.includes(action)) {
      resourceIds.push('*');
    }
    resource.resourceIds.forEach((actions, key) => {
      if (actions?.includes(action)) {
        resourceIds.push(key);
      }
    });
    return resourceIds;
  }
}

const authStore = new AuthStore();

export const AuthStoreContext = createContext<AuthStore>({} as AuthStore);

AuthStoreContext.displayName = 'AuthStoreContext';

export default authStore;
