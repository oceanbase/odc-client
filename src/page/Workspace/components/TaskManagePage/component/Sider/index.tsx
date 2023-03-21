import { TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { SchemaStore } from '@/store/schema';
import { SettingStore } from '@/store/setting';
import { TaskStore } from '@/store/task';
import { formatMessage } from '@/util/intl';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import classNames from 'classnames';
import { flatten } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { getTaskTypeList } from '../helper';

import styles from './index.less';

interface IProps {
  settingStore?: SettingStore;
  schemaStore?: SchemaStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
}

const Sider: React.FC<IProps> = function ({ settingStore, schemaStore, taskStore, modalStore }) {
  const { enabledCreate, taskPageScope } = taskStore;
  const taskTypeList = getTaskTypeList(settingStore, schemaStore, taskStore);
  const taskTypes = Object.values(TaskType);
  const firstEnabledTask = flatten(taskTypeList?.map((taskGroup) => taskGroup?.group))?.find(
    (item) => item?.enabled,
  );

  const hasCreate = (key: string) => {
    return taskTypes.includes(key as TaskType);
  };

  const handleMenuClick = (type: TaskPageType) => {
    switch (type) {
      case TaskPageType.IMPORT:
        modalStore.changeImportModal(true);
        break;
      case TaskPageType.EXPORT:
        modalStore.changeExportModal();
        break;
      case TaskPageType.DATAMOCK:
        modalStore.changeDataMockerModal(true);
        break;
      case TaskPageType.ASYNC:
        modalStore.changeCreateAsyncTaskModal(true);
        break;
      case TaskPageType.PARTITION_PLAN:
        modalStore.changePartitionModal(true);
        break;
      case TaskPageType.SQL_PLAN:
        modalStore.changeCreateSQLPlanTaskModal(true);
        break;
      case TaskPageType.PERMISSION_APPLY:
        modalStore.changeApplyPermissionModal(true);
        break;
      case TaskPageType.SHADOW:
        modalStore.changeShadowSyncVisible(true);
        break;
      default:
    }
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
                      [styles.selected]: taskStore?.taskPageType === item.value,
                    },
                    styles.groupItem,
                  )}
                  key={item.value}
                  onClick={() => taskStore.changeTaskPageType(item.value)}
                >
                  {item.label}
                  {enabledCreate && hasCreate(item.value) && (
                    <PlusOutlined
                      className={styles.plus}
                      onClick={() => {
                        handleMenuClick(item.value);
                      }}
                    />
                  )}
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

  return (
    <div className={styles.taskSider}>
      <header className={styles.taskTitle}>
        {formatMessage({ id: 'odc.component.Sider.TaskCenter' }) /*任务中心*/}
      </header>
      {renderTaskTypeList()}
    </div>
  );
};

export default inject('settingStore', 'schemaStore', 'taskStore', 'modalStore')(observer(Sider));
