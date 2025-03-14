import { ConnectType } from '@/d.ts';
import { DBType } from '@/d.ts/database';
import React from 'react';
import { IEnvironment } from '@/d.ts/environment';
import { DatabaseGroup } from '@/d.ts/database';
import { SearchType } from './Header/Search';
export interface IFilterParams {
  environmentId: number[];
  connectType: ConnectType[];
  type: DBType[];
}

interface IParamContext {
  searchValue: { value: string; type: SearchType };
  setSearchvalue?: (v: string, type: SearchType) => void;
  filterParams?: IFilterParams;
  setFilterParams?: (params: IFilterParams) => void;
  reload?: () => void;
  envList?: IEnvironment[];
  groupMode?: DatabaseGroup;
  setGroupMode?: React.Dispatch<React.SetStateAction<DatabaseGroup>>;
}

const ParamContext: React.Context<IParamContext> = React.createContext({
  searchValue: null,
  sortType: null,
  connectType: [],
});

export default ParamContext;
