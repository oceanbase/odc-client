import React from 'react';

export interface IFilterParams {
  existed: boolean;
  belongsToProject: boolean;
}

interface IParamContext {
  searchValue: string;
  setSearchValue?: (v: string) => void;
  filterParams?: IFilterParams;
  setFilterParams?: (params: IFilterParams) => void;
  reload?: (name?: string) => void;
  loading?: boolean;
}

const ParamContext: React.Context<IParamContext> = React.createContext({
  searchValue: null,
});

export default ParamContext;
