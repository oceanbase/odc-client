/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useRef } from 'react';

import classNames from 'classnames';
import { ActivityBarItemType } from '../ActivityBar/type';
import ActivityBarContext from '../context/ActivityBarContext';
import styles from './index.less';
import Manager from './Manager';
import ResourceTree from './ResourceTree/Container';
import Script from './Script';
import Task from './Task';

interface IProps {}

const items = {
  [ActivityBarItemType.Database]: ResourceTree,
  [ActivityBarItemType.Script]: Script,
  [ActivityBarItemType.Task]: Task,
  [ActivityBarItemType.Manager]: Manager,
};

const SideBar: React.FC<IProps> = function () {
  const activityBarContext = useContext(ActivityBarContext);

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
