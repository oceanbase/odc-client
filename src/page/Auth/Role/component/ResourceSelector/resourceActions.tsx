import { IManagerRolePermissionType } from '@/d.ts';
import type { ConnectionAccessAction, ResourceManagementAction, SystemAction } from './const';
import {
  connectionAccessActionMap,
  connectionAccessActionOptions,
  resourceManagementActionMap,
  resourceManagementActionOptions,
  systemActionMap,
  systemActionOptions,
} from './const';

class ResourceActions {
  [IManagerRolePermissionType.connectionAccessPermissions] = {
    actionMap: connectionAccessActionMap,
    options: connectionAccessActionOptions,
  };
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
