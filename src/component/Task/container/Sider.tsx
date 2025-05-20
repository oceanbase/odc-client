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

import { TaskPageType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import type { PageStore } from '@/store/page';
import { TaskStore } from '@/store/task';
import Icon from '@ant-design/icons';
import { Space, Tooltip, Typography } from 'antd';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { getFirstEnabledTask, getTaskGroupLabels } from '../helper';
import useUrlAction from '@/util/hooks/useUrlAction';
import useURLParams from '@/util/hooks/useUrlParams';
import styles from '../index.less';

interface IProps {
  taskStore?: TaskStore;
  pageStore?: PageStore;
  className?: string;
  isPage?: boolean;
  inProject?: boolean;
}

const { Text } = Typography;

const Sider: React.FC<IProps> = function ({ taskStore, pageStore, className, isPage }) {
  const firstEnabledTask = getFirstEnabledTask();
  const pageKey = isPage ? pageStore?.activePageKey : taskStore?.taskPageType;
  const { getParam, deleteParam } = useURLParams();
  const urlTriggerValue = getParam('filtered');
  const urlStatusValue = getParam('status');

  const { runTask } = useUrlAction();

  const handleClick = (value: TaskPageType) => {
    if (urlTriggerValue) {
      deleteParam('filtered');
    }
    if (urlStatusValue) {
      deleteParam('status');
    }
    if (isPage) {
      openTasksPage(value);
    }
    taskStore.changeTaskPageType(value);
  };

  function renderTaskTypeList() {
    return getTaskGroupLabels()
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
                  <Tooltip title={item.label} placement="right">
                    <Text ellipsis>{item.label}</Text>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        );
      })
      .filter(Boolean);
  }

  useEffect(() => {
    const res = runTask({
      callback: (task) => {
        openTasksPage(task as TaskPageType);
        taskStore.changeTaskPageType(task as TaskPageType);
      },
    });

    if (!res) taskStore.changeTaskPageType(firstEnabledTask?.value);
    return () => {
      taskStore.changeTaskPageType(firstEnabledTask?.value);
      taskStore.changeTaskPageScope(null);
    };
  }, []);

  return <div className={`${styles.taskSider} ${className}`}>{renderTaskTypeList()}</div>;
};

export default inject('taskStore', 'pageStore')(observer(Sider));
