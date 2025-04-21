import { formatMessage } from '@/util/intl';
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

import { getCycleTaskDetail, getTaskDetail } from '@/common/network/task';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import type {
  IAlterScheduleTaskParams,
  IDataArchiveJobParameters,
  IResponseData,
  ISqlPlayJobParameters,
  TaskRecordParameters,
  TaskStatus,
} from '@/d.ts';
import { IConnectionType, ICycleTaskRecord, TaskPageType, TaskRecord, TaskType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import type { TaskStore } from '@/store/task';
import tracert from '@/util/tracert';
import { getPreTime } from '@/util/utils';
import { useLocation } from '@umijs/max';
import { useSetState } from 'ahooks';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useRef, useMemo } from 'react';
import TaskTable from './component/TaskTable';
import DetailModal from './DetailModal';
import { isCycleTask, isCycleTaskPage } from './helper';
import styles from './index.less';
import { UserStore } from '@/store/login';
import { TaskDetailContext } from './TaskDetailContext';

interface IProps {
  taskStore?: TaskStore;
  userStore?: UserStore;
  modalStore?: ModalStore;
  pageKey?: TaskPageType;
  tabHeight?: number;
  projectId?: number;
  isMultiPage?: boolean;
  inProject?: boolean;
  defaultTaskId?: number;
  defaultTaskType?: TaskType;
}
export interface IState {
  detailId: number;
  detailType: TaskType;
  detailVisible: boolean;
  status: TaskStatus;
  tasks: IResponseData<TaskRecord<TaskRecordParameters>>;
  cycleTasks: IResponseData<ICycleTaskRecord<ISqlPlayJobParameters | IDataArchiveJobParameters>>;
}
const TaskManaerContent: React.FC<IProps> = (props) => {
  const {
    pageKey,
    taskStore,
    modalStore,
    isMultiPage = false,
    inProject,
    projectId,
    userStore,
  } = props;
  const taskTabType = pageKey || taskStore?.taskPageType;
  const taskOpenRef = useRef<boolean>(null);
  const [state, setState] = useSetState<IState>({
    detailId: props.taskStore?.defaultOpenTaskId,
    detailType: props.taskStore?.defauleOpenTaskType,
    detailVisible: !!props.taskStore?.defaultOpenTaskId,
    tasks: null,
    cycleTasks: null,
    status: null,
  });
  const location = useLocation();
  const isSqlworkspace = location?.pathname?.includes('/sqlworkspace');
  const { detailId, detailType, detailVisible, cycleTasks, tasks } = state;
  const taskList = isCycleTaskPage(taskTabType) ? cycleTasks : tasks;
  const theme = isSqlworkspace ? null : 'vs';
  const tableRef = useRef<ITableInstance>();

  const TaskEventMap = {
    [TaskPageType.IMPORT]: () => modalStore.changeImportModal(true),
    [TaskPageType.EXPORT]: () => modalStore.changeExportModal(),
    [TaskPageType.DATAMOCK]: () => modalStore.changeDataMockerModal(true),
    [TaskPageType.ASYNC]: () => modalStore.changeCreateAsyncTaskModal(true),
    [TaskPageType.PARTITION_PLAN]: () => modalStore.changePartitionModal(true),
    [TaskPageType.SQL_PLAN]: () => modalStore.changeCreateSQLPlanTaskModal(true),
    [TaskPageType.SHADOW]: () => modalStore.changeShadowSyncVisible(true),
    [TaskPageType.DATA_ARCHIVE]: () => modalStore.changeDataArchiveModal(true),
    [TaskPageType.STRUCTURE_COMPARISON]: () => modalStore.changeStructureComparisonModal(true),
    [TaskPageType.DATA_DELETE]: () => modalStore.changeDataClearModal(true),
    [TaskPageType.ONLINE_SCHEMA_CHANGE]: () => modalStore.changeCreateDDLAlterTaskModal(true),
    [TaskPageType.EXPORT_RESULT_SET]: () => modalStore.changeCreateResultSetExportTaskModal(true),
    [TaskPageType.APPLY_PROJECT_PERMISSION]: () => modalStore.changeApplyPermissionModal(true),
    [TaskPageType.APPLY_DATABASE_PERMISSION]: () =>
      modalStore.changeApplyDatabasePermissionModal(true),
    [TaskPageType.APPLY_TABLE_PERMISSION]: () => modalStore.changeApplyTablePermissionModal(true),
    [TaskPageType.MULTIPLE_ASYNC]: () =>
      modalStore.changeMultiDatabaseChangeModal(
        true,
        inProject
          ? {
              projectId,
            }
          : null,
      ),
    [TaskPageType.LOGICAL_DATABASE_CHANGE]: () => modalStore.changeLogicialDatabaseModal(true),
  };
  const loadList = async (args: ITableLoadOptions, executeDate: [Dayjs, Dayjs]) => {
    const { pageKey, taskStore } = props;
    const taskTabType = pageKey || taskStore?.taskPageType;
    if (isCycleTaskPage(taskTabType)) {
      await loadCycleTaskList(taskTabType, args, executeDate);
    } else {
      await loadTaskList(taskTabType, args, executeDate);
    }
  };
  const loadTaskList = async (
    taskTabType,
    args: ITableLoadOptions,
    executeDate: [Dayjs, Dayjs],
  ) => {
    const { projectId } = props;
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { status, executeTime, candidateApprovers, creator, connection, id, projectIdList } =
      filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const connectionId = connection?.filter(
      (key) => ![IConnectionType.PRIVATE, IConnectionType.ORGANIZATION].includes(key),
    );
    const isAllScope = ![
      TaskPageType.CREATED_BY_CURRENT_USER,
      TaskPageType.APPROVE_BY_CURRENT_USER,
    ].includes(taskTabType);
    const isAll = taskTabType === TaskPageType.ALL;
    if (!pageSize) {
      return;
    }
    const params = {
      fuzzySearchKeyword: id ? id : undefined,
      taskType: isAllScope ? (isAll ? undefined : taskTabType) : undefined,
      projectId: projectId || projectIdList || undefined,
      status,
      startTime: executeDate?.[0]?.valueOf() ?? getPreTime(7),
      endTime: executeDate?.[1]?.valueOf() ?? getPreTime(0),
      connectionId,
      candidateApprovers,
      creator,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
      createdByCurrentUser: isAllScope
        ? true
        : taskTabType === TaskPageType.CREATED_BY_CURRENT_USER,
      approveByCurrentUser: isAllScope
        ? true
        : taskTabType === TaskPageType.APPROVE_BY_CURRENT_USER,
      containsAll: isAll || isAllScope,
    };
    if (executeTime !== 'custom' && typeof executeTime === 'number') {
      params.startTime = getPreTime(executeTime);
      params.endTime = getPreTime(0);
    }
    // sorter
    params.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const tasks = await props.taskStore.getTaskList(params);
    setState({
      tasks,
    });
  };
  const loadCycleTaskList = async (
    taskTabType,
    args: ITableLoadOptions,
    executeDate: [Dayjs, Dayjs],
  ) => {
    const { projectId } = props;
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { status, executeTime, candidateApprovers, creator, id, projectIdList } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const isAllScope = ![
      TaskPageType.CREATED_BY_CURRENT_USER,
      TaskPageType.APPROVE_BY_CURRENT_USER,
    ].includes(taskTabType);
    const isAll = taskTabType === TaskPageType.ALL;
    if (!pageSize) {
      return;
    }
    const params = {
      id: id ? id : undefined,
      type: isAllScope ? (isAll ? undefined : taskTabType) : undefined,
      projectId: projectId || projectIdList,
      status,
      candidateApprovers,
      creator,
      startTime: executeDate?.[0]?.valueOf() ?? getPreTime(7),
      endTime: executeDate?.[1]?.valueOf() ?? getPreTime(0),
      createdByCurrentUser: taskTabType === TaskPageType.CREATED_BY_CURRENT_USER,
      approveByCurrentUser: taskTabType === TaskPageType.APPROVE_BY_CURRENT_USER,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
      containsAll: isAll || isAllScope,
    };
    if (executeTime !== 'custom' && typeof executeTime === 'number') {
      params.startTime = getPreTime(executeTime);
      params.endTime = getPreTime(0);
    }
    // sorter
    params.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const cycleTasks = await props.taskStore.getCycleTaskList(params);
    setState({
      cycleTasks,
    });
  };

  const reloadList = () => {
    tableRef.current.reload();
  };
  const handleDetailVisible = (
    task: TaskRecord<TaskRecordParameters> | ICycleTaskRecord<any>,
    visible: boolean = false,
  ) => {
    const { id, type } = task ?? {};
    const detailId =
      type === TaskType.ALTER_SCHEDULE
        ? (task as TaskRecord<IAlterScheduleTaskParams>)?.parameters?.taskId
        : id;
    setState({
      detailId,
      detailType:
        (task as TaskRecord<TaskRecordParameters>)?.type ||
        (task as ICycleTaskRecord<any>)?.type ||
        TaskType.ASYNC,
      detailVisible: visible,
    });
    taskOpenRef.current = visible;
  };
  const handleMenuClick = (type: TaskPageType) => {
    tracert.click('a3112.b64006.c330917.d367464', {
      type,
    });
    TaskEventMap?.[type]?.();
  };
  const openDefaultTask = async () => {
    const { defaultTaskId, defaultTaskType } = props;
    if (defaultTaskId) {
      const isSchedule = isCycleTask(defaultTaskType);
      const data = isSchedule
        ? await getCycleTaskDetail(defaultTaskId)
        : await getTaskDetail(defaultTaskId, true);
      if (!data) {
        message.error(
          formatMessage({
            id: 'odc.src.component.Task.NoCurrentWorkOrderView',
            defaultMessage: '无当前工单查看权限',
          }), //'无当前工单查看权限'
        );
        return;
      }
      setState({
        detailId: defaultTaskId,
        detailType: defaultTaskType || TaskType.ASYNC,
        detailVisible: true,
      });
      taskOpenRef.current = true;
    }
  };
  useEffect(() => {
    openDefaultTask();
  }, []);

  /**
   * 隐藏项目列
   * 隐藏：项目中工单、个人空间
   * 显示：sql控制台
   */
  const disableProjectCol = useMemo(() => {
    if (inProject) {
      return true;
    } else if (userStore.isPrivateSpace()) {
      return true;
    } else if (pageKey === TaskPageType.ALL && !userStore.isPrivateSpace()) {
      return false;
    }
    return false;
  }, [inProject, pageKey, userStore.organizationId]);

  return (
    <TaskDetailContext.Provider
      value={{
        handleDetailVisible,
        setState,
      }}
    >
      <div className={styles.content}>
        <TaskTable
          disableProjectCol={disableProjectCol}
          tableRef={tableRef}
          taskTabType={taskTabType}
          taskList={taskList}
          isMultiPage={isMultiPage}
          getTaskList={loadList}
          onDetailVisible={handleDetailVisible}
          onReloadList={reloadList}
          onMenuClick={handleMenuClick}
        />
      </div>
      <DetailModal
        theme={theme}
        taskOpenRef={taskOpenRef}
        type={detailType}
        detailId={detailId}
        visible={detailVisible}
        onDetailVisible={handleDetailVisible}
        onReloadList={reloadList}
      />
    </TaskDetailContext.Provider>
  );
};
export default inject('userStore', 'taskStore', 'modalStore')(observer(TaskManaerContent));
