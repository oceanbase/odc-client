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
    defaultMessage: '全部',
  }), //全部
  [SearchType.NAME]: formatMessage({
    id: 'odc.Datasource.Datasource.ParamContext.DataSourceName',
    defaultMessage: '数据源名',
  }), //数据源名
  [SearchType.CLUSTER]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Cluster',
    defaultMessage: '集群',
  }), //集群
  [SearchType.TENANT]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Tenant',
    defaultMessage: '租户',
  }), //租户
  [SearchType.HOST]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.HostPort',
    defaultMessage: '主机端口',
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
    defaultMessage: '公共读写连接',
  }), //公共读写连接
  [actionTypes.readonlyconnect]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.PublicReadOnlyConnection',
    defaultMessage: '公共只读连接',
  }), //公共只读连接
};

interface IParamContext {
  searchValue: { value: string; type: SearchType };
  setSearchvalue?: (v: string, type: SearchType) => void;
  sortType: SortType;
  setSortType?: (v: SortType) => void;
  connectType: ConnectType[];
  setConnectType?: (v: ConnectType[]) => void;
  reloadTable?: () => Promise<boolean>;
  editDatasource?: (id: number) => void;
  setCopyDatasourceId?: (id: number) => void;
}

const ParamContext: React.Context<IParamContext> = React.createContext({
  searchValue: null,
  sortType: null,
  connectType: [],
});

export default ParamContext;
