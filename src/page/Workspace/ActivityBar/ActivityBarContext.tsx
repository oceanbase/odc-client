import React from 'react';
import { ActivityBarItemType } from './type';

const ActivityBarContext = React.createContext<{
  activeKey: ActivityBarItemType | null;
  onChangeActiveKey: (v: ActivityBarItemType | null) => void;
}>({
  activeKey: ActivityBarItemType.Database,
  onChangeActiveKey(v) {},
});

export default ActivityBarContext;
