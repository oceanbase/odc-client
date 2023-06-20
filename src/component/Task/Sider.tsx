import { TaskPageScope } from '@/d.ts';
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
}

const Sider: React.FC<IProps> = function ({ settingStore, taskStore }) {
  const { taskPageScope } = taskStore;
  const taskTypeList = getTaskTypeList(settingStore, taskStore);
  const firstEnabledTask = flatten(taskTypeList?.map((taskGroup) => taskGroup?.group))?.find(
    (item) => item?.enabled,
  );

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
                      [styles.selected]: taskStore?.taskPageType === item.value,
                    },
                    styles.groupItem,
                  )}
                  key={item.value}
                  onClick={() => taskStore.changeTaskPageType(item.value)}
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

  return <div className={styles.taskSider}>{renderTaskTypeList()}</div>;
};

export default inject('settingStore', 'taskStore')(observer(Sider));
