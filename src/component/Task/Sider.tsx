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

import { TaskPageScope, TaskPageType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { PageStore } from '@/store/page';
import { SettingStore } from '@/store/setting';
import { TaskStore } from '@/store/task';
import Icon from '@ant-design/icons';
import { Space } from 'antd';
import classNames from 'classnames';
import { flatten } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { getTaskTypeList } from './helper';

import styles from './index.less';

interface IProps {
  settingStore?: SettingStore;
  taskStore?: TaskStore;
  pageStore?: PageStore;
  className?: string;
  isPage?: boolean;
}

const Sider: React.FC<IProps> = function ({
  settingStore,
  taskStore,
  pageStore,
  className,
  isPage,
}) {
  const { taskPageScope } = taskStore;
  const taskTypeList = getTaskTypeList(settingStore, taskStore);
  const firstEnabledTask = flatten(taskTypeList?.map((taskGroup) => taskGroup?.group))?.find(
    (item) => item?.enabled,
  );
  const pageKey = isPage ? pageStore?.activePageKey : taskStore?.taskPageType;

  const handleClick = (value: TaskPageType) => {
    if (isPage) {
      openTasksPage(value);
    }
    taskStore.changeTaskPageType(value);
  };

  function renderTaskTypeList() {
    return taskTypeList
      ?.map((taskGroup) => {
        const { groupName, icon, group } = taskGroup;
        const tasks = group?.filter((task) => task.enabled);
        const groupIcon = icon ? <Icon component={icon as any} /> : null;
        if (!tasks?.length) {
          return null;
        }
        return (
          <div className={styles.group} key={groupName}>
            {groupName ? (
              <Space size={4} className={styles.groupName}>
                {groupIcon}
                {groupName}
              </Space>
            ) : null}
            {tasks.map((item) => {
              return (
                <div
                  className={classNames(
                    {
                      [styles.selected]: pageKey === item.value,
                    },
                    styles.groupItem,
                  )}
                  key={item.value}
                  onClick={() => handleClick(item.value)}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        );
      })
      .filter(Boolean);
  }

  useEffect(() => {
    if (taskPageScope !== TaskPageScope.CREATED_BY_CURRENT_USER) {
      taskStore.changeTaskPageType(firstEnabledTask.value);
    }
    return () => {
      taskStore.changeTaskPageType(firstEnabledTask.value);
      taskStore.changeTaskPageScope(null);
    };
  }, []);

  return <div className={`${styles.taskSider} ${className}`}>{renderTaskTypeList()}</div>;
};

export default inject('settingStore', 'taskStore', 'pageStore')(observer(Sider));
