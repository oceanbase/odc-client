import React from 'react';
import { ActivityBarItemType } from '../ActivityBar/type';

interface IActivityBarContext {
  activeKey?: ActivityBarItemType;
  setActiveKey?: (v: ActivityBarItemType) => void;
}

const ActivityBarContext = React.createContext<IActivityBarContext>({});
export default ActivityBarContext;
