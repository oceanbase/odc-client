import React, { useContext } from 'react';

import ActivityBarContext from '../ActivityBar/ActivityBarContext';
import { ActivityBarItemType, ActivityBarItemTypeText } from '../ActivityBar/type';
import styles from './index.less';
import Job from './Job';
import Manager from './Manager';
import ResourceTree from './ResourceTree';
import Script from './Script';

interface IProps {}

const items = {
  [ActivityBarItemType.Database]: ResourceTree,
  [ActivityBarItemType.Script]: Script,
  [ActivityBarItemType.Job]: Job,
  [ActivityBarItemType.Manager]: Manager,
};

const SideBar: React.FC<IProps> = function () {
  const activityBarContext = useContext(ActivityBarContext);
  const title = ActivityBarItemTypeText[activityBarContext.activeKey];

  const Component = items[activityBarContext?.activeKey];

  return (
    <div className={styles.sideBar}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{!!Component && <Component />}</div>
    </div>
  );
};

export default SideBar;
