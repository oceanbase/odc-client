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

import { IManagerRolePermissionType } from '@/d.ts';
import { ResourceManagementAction, resourceManagementActionMap } from '../../../utils';
import type { ConnectionAccessAction, SystemAction } from './const';
import { resourceManagementActionOptions, systemActionMap, systemActionOptions } from './const';

class ResourceActions {
  [IManagerRolePermissionType.resourceManagementPermissions] = {
    actionMap: resourceManagementActionMap,
    options: resourceManagementActionOptions,
  };
  [IManagerRolePermissionType.systemOperationPermissions] = {
    actionMap: systemActionMap,
    options: systemActionOptions,
  };

  getActionsArrayValue = (
    actions: ConnectionAccessAction | ResourceManagementAction | SystemAction,
    resourceType: IManagerRolePermissionType,
  ) => {
    return this?.[resourceType]?.actionMap?.[actions];
  };

  getActionStringValue = (actions: string[], resourceType: IManagerRolePermissionType) => {
    const actionMap = this?.[resourceType]?.actionMap;
    return Object.keys(actionMap)?.find(
      (key) =>
        actions?.length === actionMap[key]?.length &&
        actions?.every((item) => actionMap[key]?.includes(item)),
    );
  };

  getActionStringLabel = (
    actions: ConnectionAccessAction | ResourceManagementAction | SystemAction,
    resourceType: IManagerRolePermissionType,
  ) => {
    const options = this?.[resourceType]?.options;
    const data = (options as any[])?.find((item) => actions === item.value);
    return data?.label;
  };
}

export default new ResourceActions();
