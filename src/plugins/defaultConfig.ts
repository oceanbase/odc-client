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

import { actionTypes, IManagerResourceType, IRoles, type IManagerUser } from '@/d.ts';

export default {
  login: {
    menu: true,
    setFirstOraganizationToDefault: true,
  },
  locale: {
    menu: true,
    getLocale: null,
  },
  docs: {
    url: null,
  },
  worker: {
    needOrigin: true,
  },
  debug: {
    enable: true,
  },
  manage: {
    user: {
      create: true,
      resetPwd: true,
      delete: true,
      canEdit: (user: Pick<IManagerUser, 'resourceManagementPermissions'>, resourceId?: string) => {
        const permissions = user?.resourceManagementPermissions?.filter(
          (item) =>
            item.resourceType === IManagerResourceType.user &&
            item.actions.includes(actionTypes.update),
        );
        if (!permissions || permissions.length === 0) {
          return false;
        }
        return permissions.some((item) => {
          if (item?.resourceId === '*' || item?.resourceId === resourceId) {
            return true;
          }
        });
      },
      isODCOrganizationConfig: (user: Pick<IManagerUser, 'systemOperationPermissions'>) => {
        return user?.systemOperationPermissions?.some(
          (item) => item?.resourceType === IManagerResourceType.odc_organization_config,
        );
      },
      tabInVisible: (setting) => {
        return false;
      },
    },
    record: {
      enable: (setting) => {
        return true;
      },
    },
    showRAMAlert: (setting) => {
      return false;
    },
    integration: {
      enable: true,
    },
  },
  connection: {
    sys: true,
  },
  task: {
    sys: true,
  },
  systemConfig: {
    default: null,
  },
  spaceConfig: {
    showSecurity: true,
  },
  workspaceConfig: {
    batchDownloadScripts: true,
  },
  spm: {
    enable: true,
  },
  workspace: {
    preMount() {},
    unMount() {},
  },
  network: {
    baseUrl() {
      return window.ODCApiHost || '';
    },
  },
};
