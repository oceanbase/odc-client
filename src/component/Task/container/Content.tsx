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
import type { IAlterScheduleTaskParams, TaskRecordParameters } from '@/d.ts';
import {
  IConnectionType,
  ICycleTaskRecord,
  TaskExecStrategy,
  TaskPageType,
  TaskRecord,
  TaskType,
} from '@/d.ts';
import { ModalStore } from '@/store/modal';
import type { TaskStore } from '@/store/task';
import tracert from '@/util/tracert';
import { useLocation } from '@umijs/max';
import { useSetState } from 'ahooks';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import type { Dayjs } from 'dayjs';
import React, { useEffect, useRef, useMemo } from 'react';
import TaskTable from '../component/TaskTable';
import { isCycleTask, isCycleTaskPage } from '../helper';
import styles from '../index.less';
import { UserStore } from '@/store/login';
import { TaskDetailContext } from './TaskDetailContext';
import useURLParams from '@/util/hooks/useUrlParams';
import { IState } from '../interface';
import CreateModals from '../modals/CreateModals';
import DetailModals from '../modals/DetailModals';
import { formatMessage } from '@/util/intl';
import { getPreTime } from '@/util/utils';

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
  const { getParam } = useURLParams();
  const urlTriggerValue = getParam('filtered');

  const taskModalActions = {
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

  const getListParams = (taskTabType, args: ITableLoadOptions, executeDate: [Dayjs, Dayjs]) => {
    const { projectId } = props;
    const { filters, sorter } = args ?? {};
    const { status, candidateApprovers, creator, projectIdList, executeTime } = filters ?? {};
    const { column, order } = sorter ?? {};

    const isAllScope = ![
      TaskPageType.CREATED_BY_CURRENT_USER,
      TaskPageType.APPROVE_BY_CURRENT_USER,
    ].includes(taskTabType);
    const isAll = taskTabType === TaskPageType.ALL;

    const commonParams = {
      projectId: projectId || projectIdList || undefined,
      status,
      startTime: executeDate?.length > 0 ? executeDate?.[0]?.valueOf() ?? getPreTime(7) : undefined,
      endTime: executeDate?.length > 0 ? executeDate?.[1]?.valueOf() ?? getPreTime(0) : undefined,
      candidateApprovers,
      creator,
      sort: column?.dataIndex,
      containsAll: isAll || isAllScope,
    };
    if (executeTime !== 'custom' && typeof executeTime === 'number') {
      commonParams.startTime = getPreTime(executeTime);
      commonParams.endTime = getPreTime(0);
    }
    const sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    return { commonParams, sort, isAllScope, isAll };
  };

  const loadTaskList = async (
    taskTabType,
    args: ITableLoadOptions,
    executeDate: [Dayjs, Dayjs],
  ) => {
    const { filters, pageSize, pagination } = args ?? {};
    const { connection, id } = filters ?? {};
    const connectionId = connection?.filter(
      (key) => ![IConnectionType.PRIVATE, IConnectionType.ORGANIZATION].includes(key),
    );
    const { current = 1 } = pagination ?? {};

    const { commonParams, sort, isAll, isAllScope } = getListParams(taskTabType, args, executeDate);

    if (!pageSize) {
      return;
    }
    const params = {
      ...commonParams,
      fuzzySearchKeyword: id ? id : undefined,
      taskType: isAllScope ? (isAll ? undefined : taskTabType) : undefined,
      connectionId,
      page: current,
      size: pageSize,
      createdByCurrentUser: isAllScope
        ? true
        : taskTabType === TaskPageType.CREATED_BY_CURRENT_USER,
      approveByCurrentUser: isAllScope
        ? true
        : taskTabType === TaskPageType.APPROVE_BY_CURRENT_USER,
    };
    // sorter
    params.sort = sort;

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
    const { filters, pageSize, pagination } = args ?? {};
    const { id } = filters ?? {};
    const { current = 1 } = pagination ?? {};

    const { commonParams, sort, isAll, isAllScope } = getListParams(taskTabType, args, executeDate);

    if (!pageSize) {
      return;
    }
    const params = {
      ...commonParams,
      id: id ? id : undefined,
      type: isAllScope ? (isAll ? undefined : taskTabType) : undefined,
      page: urlTriggerValue ? undefined : current,
      size: urlTriggerValue ? undefined : pageSize,
      createdByCurrentUser: taskTabType === TaskPageType.CREATED_BY_CURRENT_USER,
      approveByCurrentUser: taskTabType === TaskPageType.APPROVE_BY_CURRENT_USER,
    };
    // sorter
    params.sort = sort;

    const cycleTasks = await props.taskStore.getCycleTaskList(params);
    const filteredContents = cycleTasks?.contents?.filter(
      (item) =>
        ![TaskExecStrategy.START_NOW, TaskExecStrategy.START_AT].includes(
          item?.triggerConfig?.triggerStrategy,
        ),
    );
    setState({
      cycleTasks: urlTriggerValue ? { ...cycleTasks, contents: filteredContents } : cycleTasks,
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

  const handleMenuItemClick = (type: TaskPageType) => {
    tracert.click('a3112.b64006.c330917.d367464', {
      type,
    });
    taskModalActions?.[type]?.();
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
    if (inProject || userStore.isPrivateSpace()) {
      return true;
    }
    return false;
  }, [inProject, userStore.organizationId]);

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
          onMenuClick={handleMenuItemClick}
        />
      </div>
      {!isSqlworkspace && <CreateModals projectId={projectId} theme="white" />}
      <DetailModals
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
