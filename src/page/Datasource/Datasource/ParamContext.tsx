import { actionTypes, ConnectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import React from 'react';

export enum SearchType {
  ALL,
  NAME,
  CLUSTER,
  TENANT,
  HOST,
}

export const SearchTypeText = {
  [SearchType.ALL]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.All',
  }), //全部
  [SearchType.NAME]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.ConnectionName',
  }), //连接名
  [SearchType.CLUSTER]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Cluster',
  }), //集群
  [SearchType.TENANT]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Tenant',
  }), //租户
  [SearchType.HOST]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.HostPort',
  }), //主机端口
};

export enum SortType {
  CREATE_TIME = 'createTime,asc',
  UPDATE_TIME = 'updateTime,asc',
  NAME_AZ = 'name,asc',
  NAME_ZA = 'name,desc',
}

export const PermissionText = {
  [actionTypes.writeAndReadConnect]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.PublicReadWriteConnection',
  }), //公共读写连接
  [actionTypes.readonlyconnect]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.PublicReadOnlyConnection',
  }), //公共只读连接
};

interface IParamContext {
  searchValue: { value: string; type: SearchType };
  setSearchvalue?: (v: string, type: SearchType) => void;
  sortType: SortType;
  setSortType?: (v: SortType) => void;
  connectType: ConnectType[];
  setConnectType?: (v: ConnectType[]) => void;
  permissions: actionTypes[];
  setPermissions?: (v: actionTypes[]) => void;
  reloadTable?: () => Promise<boolean>;
  editDatasource?: (id: number) => void;
}

const ParamContext: React.Context<IParamContext> = React.createContext({
  searchValue: null,
  sortType: null,
  connectType: [],
  permissions: [],
});

export default ParamContext;
