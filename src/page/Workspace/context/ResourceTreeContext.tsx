import React from 'react';

export enum ResourceTreeTab {
  datasource = 'datasource',
  project = 'project',
}
interface IResourceTreeContext {
  selectTabKey: ResourceTreeTab;
  setSelectTabKey?: (v: ResourceTreeTab) => void;
  selectProjectId: number;
  setSelectProjectId?: (v: number) => void;
  selectDatasourceId: number;
  setSelectDatasourceId?: (v: number) => void;
}

const ResourceTreeContext = React.createContext<IResourceTreeContext>({
  selectTabKey: ResourceTreeTab.datasource,
  selectProjectId: null,
  selectDatasourceId: null,
});
export default ResourceTreeContext;
