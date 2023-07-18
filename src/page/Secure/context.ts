import type { IManagerUser, IManageUserListParams, IResponseData } from '@/d.ts';
import React from 'react';

interface IManageContext {
  users: IResponseData<IManagerUser>;

  getUserList: (params?: IManageUserListParams) => void;
}

export const ManageContext = React.createContext<IManageContext>(null);
