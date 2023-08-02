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
          const data = item.resourceIds.get(resourceId) || [];
          item.resourceIds.set(resourceId, data.concat(actions as actionTypes[]));
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
        ?.all?.concat(this.permissions.get(resourceType).resourceIds.get(resourceId) || []) || [],
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
