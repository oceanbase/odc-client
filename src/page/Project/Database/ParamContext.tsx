import { ConnectType } from '@/d.ts';
import { DBType } from '@/d.ts/database';
import React from 'react';
import { IEnvironment } from '@/d.ts/environment';

export interface IFilterParams {
  environmentId: number[];
  connectType: ConnectType[];
  type: DBType[];
}

interface IParamContext {
  searchValue: string;
  setSearchValue?: (v: string) => void;
  filterParams?: IFilterParams;
  setFilterParams?: (params: IFilterParams) => void;
  reload?: () => void;
  envList?: IEnvironment[];
}

const ParamContext: React.Context<IParamContext> = React.createContext({
  searchValue: null,
  sortType: null,
  connectType: [],
});

export default ParamContext;
