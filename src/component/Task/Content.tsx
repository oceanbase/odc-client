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

import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import type {
  IAlterScheduleTaskParams,
  IConnectionPartitionPlan,
  IDataArchiveJobParameters,
  IResponseData,
  ISqlPlayJobParameters,
  TaskRecordParameters,
  TaskStatus,
} from '@/d.ts';
import { IConnectionType, ICycleTaskRecord, TaskPageType, TaskRecord, TaskType } from '@/d.ts';
import type { UserStore } from '@/store/login';
import { ModalStore } from '@/store/modal';
import type { TaskStore } from '@/store/task';
import { getPreTime } from '@/util/utils';
import { inject, observer } from 'mobx-react';
import type { Moment } from 'moment';
import React from 'react';
import TaskTable from './component/TaskTable';
import DetailModal from './DetailModal';
import { isCycleTaskPage } from './helper';
import styles from './index.less';
import tracert from '@/util/tracert';
import { getProject } from '@/common/network/project';
import { ProjectRole } from '@/d.ts/project';

interface IProps {
  taskStore?: TaskStore;
  userStore?: UserStore;
  modalStore?: ModalStore;
  pageKey?: TaskPageType;
  tabHeight?: number;
  projectId?: number;
  isMultiPage?: boolean;
  inProject?: boolean;
}

interface IState {
  detailId: number;
  detailType: TaskType;
  detailVisible: boolean;
  partitionPlan: IConnectionPartitionPlan;
  status: TaskStatus;
  disabledOpt: boolean;
  tasks: IResponseData<TaskRecord<TaskRecordParameters>>;
  cycleTasks: IResponseData<ICycleTaskRecord<ISqlPlayJobParameters | IDataArchiveJobParameters>>;
}

@inject('userStore', 'taskStore', 'modalStore')
@observer
class TaskManaerContent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      detailId: props.taskStore?.defaultOpenTaskId,
      detailType: props.taskStore?.defauleOpenTaskType,
      detailVisible: !!props.taskStore?.defaultOpenTaskId,
      disabledOpt: null,
      partitionPlan: null,
      tasks: null,
      cycleTasks: null,
      status: null,
    };
  }

  private tableRef = React.createRef<ITableInstance>();

  public loadList = async (args: ITableLoadOptions, executeDate: [Moment, Moment]) => {
    const { pageKey, taskStore } = this.props;
    const taskTabType = pageKey || taskStore?.taskPageType;
    if (isCycleTaskPage(taskTabType)) {
      await this.loadCycleTaskList(taskTabType, args, executeDate);
    } else {
      await this.loadTaskList(taskTabType, args, executeDate);
    }
  };

  public loadTaskList = async (
    taskTabType,
    args: ITableLoadOptions,
    executeDate: [Moment, Moment],
  ) => {
    const { projectId } = this.props;
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { status, executeTime, candidateApprovers, creator, connection, id } = filters ?? {};
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
      projectId,
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
    const tasks = await this.props.taskStore.getTaskList(params);
    this.setState({
      tasks,
    });
  };

  public loadCycleTaskList = async (
    taskTabType,
    args: ITableLoadOptions,
    executeDate: [Moment, Moment],
  ) => {
    const { projectId } = this.props;
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { status, executeTime, candidateApprovers, creator, id } = filters ?? {};
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
      projectId,
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
    const cycleTasks = await this.props.taskStore.getCycleTaskList(params);
    this.setState({
      cycleTasks,
    });
  };

  private handlePartitionPlanChange = (value: IConnectionPartitionPlan) => {
    this.setState({
      partitionPlan: value,
    });
  };

  private reloadList = () => {
    this.tableRef.current.reload();
  };

  private handleDetailVisible = (
    task: TaskRecord<TaskRecordParameters> | ICycleTaskRecord<any>,
    visible: boolean = false,
  ) => {
    const { id, type } = task ?? {};
    const detailId =
      type === TaskType.ALTER_SCHEDULE
        ? (task as TaskRecord<IAlterScheduleTaskParams>)?.parameters?.taskId
        : id;
    this.setState({
      detailId,
      detailType:
        (task as TaskRecord<TaskRecordParameters>)?.type ||
        (task as ICycleTaskRecord<any>)?.type ||
        TaskType.ASYNC,
      detailVisible: visible,
    });
  };

  private handleMenuClick = (type: TaskPageType) => {
    const { modalStore } = this.props;
    tracert.click('a3112.b64006.c330917.d367464', { type });
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
      case TaskPageType.SHADOW:
        modalStore.changeShadowSyncVisible(true);
        break;
      case TaskPageType.DATA_ARCHIVE:
        modalStore.changeDataArchiveModal(true);
        break;
      case TaskPageType.DATA_DELETE:
        modalStore.changeDataClearModal(true);
        break;
      case TaskPageType.ONLINE_SCHEMA_CHANGE:
        modalStore.changeCreateDDLAlterTaskModal(true);
        break;
      case TaskPageType.EXPORT_RESULT_SET:
        modalStore.changeCreateResultSetExportTaskModal(true);
        break;
      case TaskPageType.APPLY_PROJECT_PERMISSION:
        modalStore.changeApplyPermissionModal(true);
        break;
      default:
    }
  };
  async fetchProject(projectId: number) {
    const data = await getProject(projectId);
    const currentUserResourceRoles = data?.currentUserResourceRoles || [];
    const disabled =
      currentUserResourceRoles?.filter((roles) =>
        [ProjectRole.DBA, ProjectRole.OWNER, ProjectRole.DEVELOPER]?.includes(roles),
      )?.length === 0;
    this.setState({
      disabledOpt: disabled,
    });
  }
  componentDidMount(): void {
    const { inProject, projectId } = this.props;
    if (inProject && projectId) {
      this.fetchProject(projectId);
    }
  }

  private hasCreate = (key: string) => {
    const taskTypes = Object.values(TaskType);
    // return taskTypes.includes(key as TaskType);
  };

  render() {
    const { pageKey, taskStore, isMultiPage = false } = this.props;
    const {
      detailId,
      detailType,
      detailVisible,
      partitionPlan,
      cycleTasks,
      tasks,
      disabledOpt,
    } = this.state;
    const taskTabType = pageKey || taskStore?.taskPageType;
    const taskList = isCycleTaskPage(taskTabType) ? cycleTasks : tasks;
    return (
      <>
        <div className={styles.content}>
          <TaskTable
            disabledOpt={disabledOpt}
            tableRef={this.tableRef}
            taskTabType={taskTabType}
            taskList={taskList}
            isMultiPage={isMultiPage}
            getTaskList={this.loadList}
            onDetailVisible={this.handleDetailVisible}
            onReloadList={this.reloadList}
            onMenuClick={this.handleMenuClick}
          />
        </div>
        <DetailModal
          type={detailType}
          detailId={detailId}
          visible={detailVisible}
          partitionPlan={partitionPlan}
          onPartitionPlanChange={this.handlePartitionPlanChange}
          onDetailVisible={this.handleDetailVisible}
          onReloadList={this.reloadList}
        />
      </>
    );
  }
}

export default TaskManaerContent;
