import React, { useContext } from 'react';

import { ActivityBarItemType } from '../ActivityBar/type';
import ActivityBarContext from '../context/ActivityBarContext';
import styles from './index.less';
import Job from './Job';
import Manager from './Manager';
import ResourceTree from './ResourceTree/Container';
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

  const Component = items[activityBarContext?.activeKey];

  return (
    <div className={styles.sideBar}>
      <div className={styles.content}>{!!Component && <Component />}</div>
    </div>
  );
};

export default SideBar;
