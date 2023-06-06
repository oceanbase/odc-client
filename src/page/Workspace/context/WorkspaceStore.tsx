import { useState } from 'react';
import { ActivityBarItemType } from '../ActivityBar/type';
import ActivityBarContext from './ActivityBarContext';

export default function WorkspaceStore({ children }) {
  const [activityBarKey, setActivityBarKey] = useState(ActivityBarItemType.Database);

  return (
    <ActivityBarContext.Provider
      value={{
        activeKey: activityBarKey,
        setActiveKey: setActivityBarKey,
      }}
    >
      {children}
    </ActivityBarContext.Provider>
  );
}
