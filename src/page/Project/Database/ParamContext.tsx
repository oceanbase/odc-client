import { ConnectType } from '@/d.ts';
import { DBType } from '@/d.ts/database';
import React from 'react';
import { IEnvironment } from '@/d.ts/environment';
import { DatabaseGroup } from '@/d.ts/database';
import { DatabaseSearchType } from '@/d.ts/database';
export interface IFilterParams {
  environmentId: number[];
  connectType: ConnectType[];
  type: DBType[];
}

interface IParamContext {
  searchValue: { value: string; type: DatabaseSearchType };
  setSearchvalue?: (v: string, type: DatabaseSearchType) => void;
  filterParams?: IFilterParams;
  setFilterParams?: (params: IFilterParams) => void;
  reload?: () => void;
  envList?: IEnvironment[];
  groupMode?: DatabaseGroup;
  setGroupMode?: React.Dispatch<React.SetStateAction<DatabaseGroup>>;
  loading?: boolean;
}

const ParamContext: React.Context<IParamContext> = React.createContext({
  searchValue: null,
  sortType: null,
  connectType: [],
});

export default ParamContext;
