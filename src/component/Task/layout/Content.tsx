import DetailModals from '@/component/Task/modals/DetailModals';
import styles from '@/component/Task/index.less';
import type { TaskStore } from '@/store/task';
import { UserStore } from '@/store/login';
import { ModalStore } from '@/store/modal';
import { useLocation } from '@umijs/max';
import type { ITableInstance } from '@/component/CommonTable/interface';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { getPreTime } from '@/util/utils';
import dayjs from 'dayjs';
import { getTaskDetail } from '@/common/network/task';
import tracert from '@/util/tracert';
import { formatMessage } from '@/util/intl';
import { TaskDetailContext } from '@/component/Task/context/TaskDetailContext';
import { useSetState } from 'ahooks';
import { inject, observer } from 'mobx-react';
import {
  TaskPageType,
  TaskRecord,
  TaskRecordParameters,
  TaskType,
  IAlterScheduleTaskParams,
  TaskStatus,
} from '@/d.ts';
import { message } from 'antd';
import TaskTable from '../component/TaskTable';
import {
  IPagination,
  ITaskParam,
  TaskDetailType,
  TaskPageMode,
  TaskTab,
} from '@/component/Task/interface';
import { IState } from '@/component/Task/interface';
import ApprovalModal from '@/component/Task/component/ApprovalModal';
import { getDefaultParam, getFirstEnabledTask } from '../helper';
import { TaskConfig } from '@/common/task';
import useTaskSearchParams from '../hooks/useTaskSearchParams';

interface IProps {
  taskStore?: TaskStore;
  userStore?: UserStore;
  modalStore?: ModalStore;
  pageKey?: TaskPageType;
  tabHeight?: number;
  projectId?: number;
  mode?: TaskPageMode;
}

export interface ContentRef {
  reloadList: () => void;
}

const Content = forwardRef<ContentRef, IProps>((props, ref) => {
  const {
    pageKey,
    taskStore,
    modalStore,
    projectId,
    userStore,
    mode = TaskPageMode.COMMON,
  } = props;
  const {
    searchParams: {
      defaultTaskId,
      defaultTaskType,
      defaultTab,
      timeValue,
      timeRange,
      startTime,
      endTime,
      projectId: urlProjectId,
      taskTypes: urlTaskTypes,
      statuses: urlStatuses,
    },
    resetSearchParams,
  } = useTaskSearchParams();
  const taskTabType = pageKey || taskStore?.taskPageType;
  const location = useLocation();
  const isSqlworkspace = location?.pathname?.includes('/sqlworkspace');
  const theme = isSqlworkspace ? null : 'vs';
  const tableRef = useRef<ITableInstance>();
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useSetState<IState>({
    detailId: taskStore?.defaultOpenTaskId,
    detailType: taskStore?.defauleOpenTaskType,
    detailVisible: !!taskStore?.defaultOpenTaskId,
    tasks: null,
    status: null,
    taskDetailType: TaskDetailType.INFO,
  });

  const [pagination, setPagination] = useState<IPagination>({
    current: 1,
    pageSize: 0,
  });
  const [params, setParams] = useSetState<ITaskParam>(getDefaultParam(mode));

  const [approvalState, setApprovalState] = useSetState({
    visible: false,
    approvalStatus: false,
    detailId: null,
  });

  const taskModalActions = {
    [TaskPageType.IMPORT]: () => modalStore.changeImportModal(true),
    [TaskPageType.EXPORT]: () => modalStore.changeExportModal(),
    [TaskPageType.DATAMOCK]: () => modalStore.changeDataMockerModal(true),
    [TaskPageType.ASYNC]: () => modalStore.changeCreateAsyncTaskModal(true),
    [TaskPageType.SHADOW]: () => modalStore.changeShadowSyncVisible(true),
    [TaskPageType.STRUCTURE_COMPARISON]: () => modalStore.changeStructureComparisonModal(true),
    [TaskPageType.ONLINE_SCHEMA_CHANGE]: () => modalStore.changeCreateDDLAlterTaskModal(true),
    [TaskPageType.EXPORT_RESULT_SET]: () => modalStore.changeCreateResultSetExportTaskModal(true),
    [TaskPageType.APPLY_PROJECT_PERMISSION]: () => modalStore.changeApplyPermissionModal(true),
    [TaskPageType.APPLY_DATABASE_PERMISSION]: () =>
      modalStore.changeApplyDatabasePermissionModal(true),
    [TaskPageType.APPLY_TABLE_PERMISSION]: () => modalStore.changeApplyTablePermissionModal(true),
    [TaskPageType.MULTIPLE_ASYNC]: () =>
      modalStore.changeMultiDatabaseChangeModal(
        true,
        mode === TaskPageMode.PROJECT
          ? {
              projectId,
            }
          : null,
      ),
    [TaskPageType.LOGICAL_DATABASE_CHANGE]: () => modalStore.changeLogicialDatabaseModal(true),
  };

  const resolveParams = (params: ITaskParam, pagination: IPagination) => {
    const {
      sort,
      searchValue,
      taskTypes,
      taskStatus,
      searchType,
      projectId: projectIdList,
      timeRange,
      executeDate,
      tab,
    } = params ?? {};
    const { pageSize, current } = pagination ?? {};

    const taskTabType = pageKey || taskStore?.taskPageType;
    const isAll = taskTabType === TaskPageType.ALL;
    const apiParams = {
      fuzzySearchKeyword: searchValue,
      searchType,
      status: taskStatus,
      taskTypes: isAll ? taskTypes : taskTabType,
      projectId: projectId || projectIdList || undefined,
      startTime: timeRange === 'ALL' ? undefined : String(getPreTime(7)),
      endTime: timeRange === 'ALL' ? undefined : String(getPreTime(0)),
      sort,
      page: current,
      size: pageSize,
      createdByCurrentUser: tab === TaskTab.all,
      approveByCurrentUser: [TaskTab.all, TaskTab.approveByCurrentUser].includes(tab),
      containsAll: tab === TaskTab.all,
    };
    if (tab === TaskTab.executionByCurrentUser) {
      apiParams.status = [TaskStatus.WAIT_FOR_EXECUTION];
    } else if (tab === TaskTab.approveByCurrentUser) {
      apiParams.status = [];
    }
    if (typeof timeRange === 'number') {
      apiParams.startTime = String(getPreTime(timeRange));
      apiParams.endTime = String(getPreTime(0));
    }

    if (timeRange === 'custom' && executeDate?.filter(Boolean)?.length === 2) {
      apiParams.startTime = String(executeDate?.[0]?.valueOf());
      apiParams.endTime = String(executeDate?.[1]?.valueOf());
    }

    return apiParams;
  };

  const loadTaskList = async (params: ITaskParam, pagination: IPagination) => {
    const apiParams = resolveParams(params, pagination);
    if (!apiParams.size) {
      return;
    }
    const tasks = await props.taskStore.getTaskList(apiParams as any);
    setLoading(false);
    setState({
      tasks,
    });
  };

  const reloadList = () => {
    loadTaskList(params, pagination);
  };

  const handleApprovalVisible = (approvalStatus: boolean = false, id: number) => {
    setApprovalState({
      detailId: id,
      approvalStatus,
      visible: true,
    });
  };

  const handleDetailVisible = (
    task: TaskRecord<TaskRecordParameters>,
    visible: boolean = false,
    taskDetailType?: TaskDetailType,
  ) => {
    const { id, type } = task ?? {};
    const detailId =
      type === TaskType.ALTER_SCHEDULE
        ? (task as TaskRecord<IAlterScheduleTaskParams>)?.parameters?.taskId
        : id;
    setState({
      detailId,
      detailType: (task as TaskRecord<TaskRecordParameters>)?.type || TaskType.ASYNC,
      detailVisible: visible,
      taskDetailType: taskDetailType ? taskDetailType : TaskDetailType.INFO,
    });
  };

  const handleMenuItemClick = (type: TaskPageType) => {
    tracert.click('a3112.b64006.c330917.d367464', {
      type,
    });
    taskModalActions?.[type]?.();
  };

  const resolveUrlSearchParams = async () => {
    defaultTaskId && (await openDefaultTask());
    if (defaultTaskType) {
      // 将 TaskType 映射到对应的 TaskPageType
      const taskConfig = TaskConfig[defaultTaskType];
      const taskPageType = taskConfig?.pageType;
      if (taskPageType) {
        taskStore.changeTaskPageType(taskPageType);
      } else {
        const firstEnabledTask = getFirstEnabledTask();
        taskStore.changeTaskPageType(firstEnabledTask?.pageType);
      }
    } else if (!taskStore?.taskPageType) {
      const firstEnabledTask = getFirstEnabledTask();
      taskStore.changeTaskPageType(firstEnabledTask?.pageType);
    }

    // Apply URL filter parameters
    const newParams: Partial<ITaskParam> = {
      tab: defaultTaskType ? TaskTab.all : defaultTab || params?.tab,
    };

    // Apply time filter from URL
    if (timeValue !== null) {
      newParams.timeRange = timeValue;
    } else if (timeRange !== null) {
      newParams.timeRange = timeRange;
    }

    // Apply custom date range from URL
    if (startTime !== null && endTime !== null) {
      newParams.timeRange = 'custom';
      newParams.executeDate = [dayjs(startTime), dayjs(endTime)];
    }

    // Apply project filter from URL
    if (urlProjectId !== null) {
      newParams.projectId = [String(urlProjectId)];
    }

    // Apply task types filter from URL
    if (urlTaskTypes !== null && urlTaskTypes.length > 0) {
      newParams.taskTypes = urlTaskTypes;
    }

    // Apply task statuses filter from URL
    if (urlStatuses !== null && urlStatuses.length > 0) {
      newParams.taskStatus = urlStatuses;
    }

    setParams(newParams);
    resetSearchParams();
  };

  const openDefaultTask = async () => {
    if (defaultTaskId) {
      const data = await getTaskDetail(defaultTaskId, true);
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
    }
  };

  useImperativeHandle(ref, () => ({
    reloadList,
  }));

  useEffect(() => {
    resolveUrlSearchParams();
  }, []);

  useEffect(() => {
    setPagination({
      current: state?.tasks?.page?.number,
      pageSize: state?.tasks?.page?.size ? state?.tasks?.page?.size : pagination?.pageSize,
    });
  }, [state?.tasks]);

  return (
    <TaskDetailContext.Provider
      value={{
        handleDetailVisible,
        setState,
      }}
    >
      <div className={styles.content}>
        <TaskTable
          onApprovalVisible={handleApprovalVisible}
          tableRef={tableRef}
          taskTabType={taskTabType}
          taskList={state.tasks}
          getTaskList={loadTaskList}
          onDetailVisible={handleDetailVisible}
          onReloadList={reloadList}
          onMenuClick={handleMenuItemClick}
          loading={loading}
          setLoading={setLoading}
          mode={mode}
          params={params}
          setParams={setParams}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
      <DetailModals
        onApprovalVisible={handleApprovalVisible}
        theme={theme}
        type={state.detailType}
        detailId={state.detailId}
        visible={state.detailVisible}
        onDetailVisible={handleDetailVisible}
        onReloadList={reloadList}
        taskDetailType={state.taskDetailType}
      />
      <ApprovalModal
        id={approvalState.detailId}
        visible={approvalState.visible}
        approvalStatus={approvalState.approvalStatus}
        onReload={reloadList}
        onCancel={() => setApprovalState({ visible: false })}
      />
    </TaskDetailContext.Provider>
  );
});

export default inject('userStore', 'taskStore', 'modalStore')(observer(Content));
