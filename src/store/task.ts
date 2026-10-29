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

import { getMaskPolicyList } from '@/common/network/mask';
import { getTaskFlowList, getTaskList, getTaskMetaInfo } from '@/common/network/task';
import { TaskSearchType } from '@/component/Task/interface';
import type { IMaskPolicy, IResponseData } from '@/d.ts';
import { TaskPageType, TaskRecord, TaskRecordParameters, TaskType } from '@/d.ts';
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
   * 待我审批的调度作业
   */
  @observable
  public pendingApprovalScheduleIds: number[];

  /**
   * 任务列表
   */
  @observable
  public tasks: IResponseData<TaskRecord<TaskRecordParameters>>;

  /**
   * task page 的 tab
   */
  @observable
  public taskPageType: TaskPageType;

  /**
   * 脱敏策略
   */
  @observable.shallow
  public policys: IMaskPolicy[] = [];

  @observable
  public showAllSchemaTaskType: boolean = false;

  @observable
  public selectedRowKeys: React.Key[] = [];

  @action clear() {
    this.showAllSchemaTaskType = false;
  }

  @action
  public setSelectedRowKeys(value: React.Key[]) {
    this.selectedRowKeys = value;
  }

  @action
  public changeTaskManageVisible(
    isShow: boolean,
    taskPageType?: TaskPageType,
    taskId?: number,
    taskType?: TaskType,
  ) {
    if (!isUndefined(taskPageType)) {
      this.changeTaskPageType(taskPageType);
    }
    if (isShow) {
      this.defaultOpenTaskId = taskId;
      this.defauleOpenTaskType = taskType;
    }
    isShow && tracert.expo('c114249');
  }

  @action
  public changeTaskPageType = (taskType: TaskPageType) => {
    if (taskType) {
      tracert.expo('a3112.b64006.c330917', { type: taskType });
    }
    this.taskPageType = taskType;
  };

  @action
  public getTaskList = async (params?: {
    taskTypes?: TaskPageType[];
    searchType: TaskSearchType;
    projectId?: number | number[];
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
    const res = await getTaskList<TaskRecordParameters>(params);
    return res;
  };

  @action
  public getTaskFlowList = async () => {
    const taskFlowList = await getTaskFlowList();
    this.taskFlowList = taskFlowList;
  };

  @action
  public getTaskMetaInfo = async () => {
    const res = await getTaskMetaInfo();
    this.pendingApprovalInstanceIds = res?.approvingFlowIds ?? [];
    this.pendingApprovalScheduleIds = res?.approvingFlowScheduleIds ?? [];
  };

  @action
  public getPolicys = async () => {
    const policys = await getMaskPolicyList();
    this.policys = policys?.contents;
  };
}
export default new TaskStore();
