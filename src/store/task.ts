import { getMaskPolicyList } from '@/common/network/mask';
import {
  getCycleTaskList,
  getTaskFlowList,
  getTaskList,
  getTaskMetaInfo,
} from '@/common/network/task';
import type { IMaskPolicy, IResponseData, ISqlPlayJobParameters, IDataArchiveJobParameters } from '@/d.ts';
import {
  ICycleTaskRecord,
  TaskPageScope,
  TaskPageType,
  TaskRecord,
  TaskRecordParameters,
  TaskStatus,
  TaskType,
} from '@/d.ts';
import tracert from '@/util/tracert';
import { isUndefined } from 'lodash';
import { action, observable } from 'mobx';

export class TaskStore {
  /**
   * 打开drawer默认打开的taskId
   */
  @observable
  public defaultOpenTaskId: number;
  /**
   * 打开drawer默认打开的taskId
   */
  @observable
  public defauleOpenTaskType: TaskType;
  /**
   * 是否允许创建任务
   */
  @observable
  public enabledCreate: boolean;

  /**
   * 任务流程
   */
  @observable
  public taskFlowList: any[];

  /**
   * 待我审批的任务
   */
  @observable
  public pendingApprovalInstanceIds: number[];

  /**
   * 任务列表
   */
  @observable
  public tasks: IResponseData<TaskRecord<TaskRecordParameters>>;

  /**
   * sql 计划列表
   */
  @observable
  public cycleTasks: IResponseData<ICycleTaskRecord<ISqlPlayJobParameters | IDataArchiveJobParameters>>;

  /**
   * task page 的 tab
   */
  @observable
  public taskPageType: TaskPageType = TaskPageType.EXPORT;

  /**
   * 任务一级筛选范围
   */
  @observable
  public taskPageScope: TaskPageScope;

  /**
   * 控制task隐藏显示
   */
  @observable
  public taskManageVisible: boolean = false;
  /**
   * 脱敏策略
   */
  @observable.shallow
  public policys: IMaskPolicy[] = [];

  @observable
  public showAllSchemaTaskType: boolean = false;

  @action clear() {
    this.showAllSchemaTaskType = false;
  }

  @action
  public changeTaskManageVisible(
    isShow: boolean,
    taskPageType?: TaskPageType,
    taskPageScope?: TaskPageScope,
    taskId?: number,
    taskType?: TaskType,
  ) {
    if (!isUndefined(taskPageType)) {
      this.changeTaskPageType(taskPageType);
    }
    if (!isUndefined(taskPageScope)) {
      this.taskPageScope = taskPageScope;
    }
    if (isShow) {
      this.defaultOpenTaskId = taskId;
      this.defauleOpenTaskType = taskType;
    }
    isShow && tracert.expo('c114249');
  }

  @action
  public changeTaskPageType = (taskType: TaskPageType) => {
    this.taskPageType = taskType;
  };

  @action
  public changeTaskPageScope = (taskPageScope: TaskPageScope) => {
    this.taskPageScope = taskPageScope;
  };

  @action
  public setTaskCreateEnabled = (enabled: boolean = false) => {
    this.enabledCreate = enabled;
  };

  @action
  public getTaskList = async (params?: {
    taskType?: TaskPageType;
    projectId?: number;
    connection?: number;
    fuzzySearchKeyword?: string;
    status?: string[];
    flowInstanceId?: number;
    startTime?: number;
    endTime?: number;
    createdByCurrentUser?: boolean;
    approveByCurrentUser?: boolean;
    connectionId?: string;
    schema?: string;
    creator?: string;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const { taskType, createdByCurrentUser, approveByCurrentUser } = params;
    const tasks = await getTaskList<TaskRecordParameters>(params);
    if (
      (!taskType && (createdByCurrentUser || approveByCurrentUser)) ||
      taskType === this.taskPageType
    ) {
      this.tasks = tasks;
    }
  };

  @action
  public getCycleTaskList = async (params?: {
    connectionId?: number[];
    projectId?: number;
    creator?: string;
    databaseName?: string[];
    id?: number;
    status?: TaskStatus[];
    type?: TaskPageType;
    startTime?: number;
    endTime?: number;
    createdByCurrentUser?: boolean;
    approveByCurrentUser?: boolean;
    sort?: string;
    page?: number;
    size?: number;
  }) => {
    const { type, createdByCurrentUser, approveByCurrentUser } = params;
    const tasks = await getCycleTaskList<ISqlPlayJobParameters | IDataArchiveJobParameters>(params);
    if ((!type && (createdByCurrentUser || approveByCurrentUser)) || type === this.taskPageType) {
      this.cycleTasks = tasks;
    }
  };

  @action
  public getTaskFlowList = async () => {
    const taskFlowList = await getTaskFlowList();
    this.taskFlowList = taskFlowList;
  };

  @action
  public getTaskMetaInfo = async () => {
    const res = await getTaskMetaInfo();
    this.pendingApprovalInstanceIds = res?.pendingApprovalInstanceIds ?? [];
  };

  @action
  public getPolicys = async () => {
    const policys = await getMaskPolicyList();
    this.policys = policys?.contents;
  };
}
export default new TaskStore();
