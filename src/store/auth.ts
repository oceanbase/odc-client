import { getCurrentUserPermissions } from '@/common/network/manager';
import { action, observable } from 'mobx';
import { createContext } from 'react';

interface Role {
  id: number;
  name: string;
  type: string;
}

interface Permission {
  resourceId: number;
  resourceType: string;
  actions: string[];
}

export class AuthStore {
  @observable
  roles: Role[] = [];

  @observable
  permissions: Permission[] = [];

  @observable
  systemPermissions: Permission[] = [];

  @observable
  isAcessFetched: boolean = false;

  @action
  public async getCurrentUserPermissions() {
    try {
      const response = await getCurrentUserPermissions();
      const {
        systemOperationPermissions = [],
        connectionAccessPermissions = [],
        resourceManagementPermissions = [],
      } = response;

      this.systemPermissions = systemOperationPermissions;
      this.permissions = [
        ...(systemOperationPermissions ?? []),
        ...(connectionAccessPermissions ?? []),
        ...(resourceManagementPermissions ?? []),
      ];
      this.isAcessFetched = true;
      return response;
    } catch (e) {
      console.error('GetCurrentUserPermissions Failed', e);
    }
  }
}

const authStore = new AuthStore();

export const AuthStoreContext = createContext<AuthStore>({} as AuthStore);

AuthStoreContext.displayName = 'AuthStoreContext';

export default authStore;
