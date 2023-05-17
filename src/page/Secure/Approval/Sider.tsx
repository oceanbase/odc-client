import { TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { SchemaStore } from '@/store/schema';
import { SettingStore } from '@/store/setting';
import { TaskStore } from '@/store/task';
import TaskSvg from '@/svgr/task.svg';
import { isClient } from '@/util/env';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { formatMessage } from '@umijs/max';
import classNames from 'classnames';
import { flatten } from 'lodash';
import { inject, observer } from 'mobx-react';
import { useEffect } from 'react';
import styles from './Sider.less';

export function getTaskTypeList(
  settingStore: SettingStore,
  schemaStore: SchemaStore,
  task?: TaskStore,
): {
  groupName: string;
  icon?: React.ReactNode;
  group: {
    value: TaskPageType;
    label: string;
    enabled: boolean;
  }[];
}[] {
  return [
    {
      groupName: '',
      icon: TaskSvg,
      group: [
        {
          value: TaskPageType.ALL,
          label: '全部流程',
          // @ts-ignore
          enabled: true || settingStore?.enableAll,
        },
        {
          value: TaskPageType.EXPORT,
          label: formatMessage({ id: 'odc.components.TaskManagePage.Export' }), // 导出
          enabled: settingStore.enableDBExport,
        },
        {
          value: TaskPageType.IMPORT,
          label: formatMessage({ id: 'odc.components.TaskManagePage.Import' }), // 导入
          enabled: settingStore.enableDBImport,
        },
        {
          value: TaskPageType.DATAMOCK,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.AnalogData',
          }),

          // 模拟数据
          enabled: settingStore.enableMockdata,
        },

        {
          value: TaskPageType.ASYNC,
          label: formatMessage({
            id: 'odc.components.TaskManagePage.DatabaseChanges',
          }),

          enabled: settingStore.enableAsyncTask,
          // 数据库变更
        },

        {
          value: TaskPageType.SHADOW,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.ShadowTableSynchronization',
          }),
          //影子表同步
          enabled: true || schemaStore.enableShadowSync || task?.showAllSchemaTaskType,
        },

        {
          value: TaskPageType.SQL_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.helper.SqlPlan',
          }), //SQL 计划
          enabled: !isClient(),
        },
        {
          value: TaskPageType.PARTITION_PLAN,
          label: formatMessage({
            id: 'odc.TaskManagePage.component.TaskTable.PartitionPlan',
          }),
          //分区计划
          enabled: true || schemaStore.enablePartitionPlan || task?.showAllSchemaTaskType,
        },
        {
          value: TaskPageType.DATASAVE,
          label: '数据归档',
          //分区计划
          enabled: true,
        },
      ],
    },
  ];
}

interface IProps {
  settingStore?: SettingStore;
  schemaStore?: SchemaStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  handleTaskTypeChange?: any;
}
const Sider: React.FC<IProps> = function ({
  settingStore,
  schemaStore,
  taskStore,
  modalStore,
  handleTaskTypeChange,
}) {
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
                  onClick={() => {
                    taskStore.changeTaskPageType(item.value);
                    handleTaskTypeChange(item.value);
                  }}
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
    taskStore.changeTaskPageType(TaskPageType.ALL);
    return;
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

export default inject('settingStore', 'schemaStore', 'taskStore', 'modalStore')(observer(Sider));
