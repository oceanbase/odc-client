import React, { useContext, useRef } from 'react';

import classNames from 'classnames';
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

  const loadedKeys = useRef<Set<ActivityBarItemType>>(new Set());

  loadedKeys.current.add(activityBarContext?.activeKey);

  return (
    <div className={styles.sideBar}>
      {Object.entries(items).map(([key, Component]: [ActivityBarItemType, any]) => {
        if (loadedKeys.current.has(key) || key === activityBarContext?.activeKey) {
          return (
            <div
              key={key}
              className={classNames(styles.content, {
                [styles?.active]: key === activityBarContext?.activeKey,
              })}
            >
              <Component />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default SideBar;
