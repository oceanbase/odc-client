import type { PageStore } from '@/store/page';
import { TaskStore } from '@/store/task';
import { inject, observer } from 'mobx-react';
import { useTaskGroup } from '../hooks';
import { allTaskPageConfig, TaskConfig } from '@/common/task';
import { Space, Tooltip, Typography } from 'antd';
import classNames from 'classnames';
import styles from '@/component/Task/index.less';
import { useEffect } from 'react';
import { openTasksPage } from '@/store/helper/page';
import { TaskPageType } from '@/d.ts';
import useUrlAction from '@/util/hooks/useUrlAction';
import useURLParams from '@/util/hooks/useUrlParams';
import { getFirstEnabledTask } from '@/component/Task/helper';
import { TaskPageMode } from '../interface';

const { Text } = Typography;

interface IProps {
  taskStore?: TaskStore;
  pageStore?: PageStore;
  className?: string;
  mode: TaskPageMode;
}

const Sider: React.FC<IProps> = (props) => {
  const { taskStore, pageStore, className, mode } = props;
  const { results } = useTaskGroup({
    taskItems: [allTaskPageConfig, ...Object.values(TaskConfig)],
  });
  const pageKey =
    mode === TaskPageMode.MULTI_PAGE ? pageStore?.activePageKey : taskStore?.taskPageType;
  const { runTask } = useUrlAction();
  const { getParam, deleteParam } = useURLParams();
  const urlTriggerValue = getParam('filtered');
  const urlStatusValue = getParam('status');
  const firstEnabledTask = getFirstEnabledTask();

  useEffect(() => {
    const res = runTask({
      callback: (task: TaskPageType) => {
        openTasksPage(task as TaskPageType);
        taskStore.changeTaskPageType(task as TaskPageType);
      },
    });

    if (!res) taskStore.changeTaskPageType(firstEnabledTask?.pageType);
    return () => {
      taskStore.changeTaskPageType(firstEnabledTask?.pageType);
    };
  }, []);

  const handleClick = (value: TaskPageType) => {
    urlTriggerValue && deleteParam('filtered');
    urlStatusValue && deleteParam('status');
    if (mode === TaskPageMode.MULTI_PAGE) {
      openTasksPage(value);
    }
    taskStore.changeTaskPageType(value);
  };

  return (
    <div className={`${styles.taskSider} ${className}`}>
      {results.map((groupItem) => {
        const { label, key, children } = groupItem;
        return (
          <div className={styles.group} key={key}>
            {label && (
              <Space size={4} className={styles.groupName}>
                {label}
              </Space>
            )}
            {children.map((item) => {
              return (
                <div
                  key={item.value}
                  className={classNames(
                    {
                      [styles.selected]: pageKey === item.value,
                    },
                    styles.groupItem,
                  )}
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
      })}
    </div>
  );
};
export default inject('taskStore', 'pageStore')(observer(Sider));
