import type {
  IManagePagesKeys,
  IManagerPublicConnection,
  IManagerResourceGroup,
  IManagerRole,
  IManagerUser,
  IManageUserListParams,
  IRequestListParamsV2,
  IResponseData,
} from '@/d.ts';
import React from 'react';

interface IManageContext {
  users: IResponseData<IManagerUser>;

  roles: Map<number, IManagerRole>;

  publicConnections: IResponseData<IManagerPublicConnection>;

  resourceGroups: IResponseData<IManagerResourceGroup>;

  activeMenuKey: IManagePagesKeys;

  getUserList: (params?: IManageUserListParams) => void;

  updateUserById?: (data: IManagerUser) => void;

  getRoleList: (params?: IRequestListParamsV2) => void;

  updateRoleById?: (data: IManagerRole) => void;

  getPublicConnectionList: (params?: IRequestListParamsV2) => void;

  updatePublicConnectionById?: (data: IManagerPublicConnection) => void;

  getResourceGroupList: (params?: IRequestListParamsV2) => void;

  updateResourceGroupById?: (data: IManagerResourceGroup) => void;
}

export const ManageContext = React.createContext<IManageContext>(null);
