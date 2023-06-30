import { useState } from 'react';
import { ActivityBarItemType } from '../ActivityBar/type';
import ActivityBarContext from './ActivityBarContext';
import ResourceTreeContext, { ResourceTreeTab } from './ResourceTreeContext';

export default function WorkspaceStore({ children }) {
  const [activityBarKey, setActivityBarKey] = useState(ActivityBarItemType.Database);

  const [selectTabKey, setSelectTabKey] = useState<ResourceTreeTab>(ResourceTreeTab.datasource);

  const [selectProjectId, setSelectProjectId] = useState<number>(null);
  const [selectDatasourceId, setSelectDatasourceId] = useState<number>(null);

  return (
    <ResourceTreeContext.Provider
      value={{
        selectTabKey,
        setSelectTabKey,
        selectProjectId,
        selectDatasourceId,
        setSelectDatasourceId,
        setSelectProjectId,
      }}
    >
      <ActivityBarContext.Provider
        value={{
          activeKey: activityBarKey,
          setActiveKey: setActivityBarKey,
        }}
      >
        {children}
      </ActivityBarContext.Provider>
    </ResourceTreeContext.Provider>
  );
}
