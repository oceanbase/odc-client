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

import { getTaskDetail } from '@/common/network/task';
import { TaskPageType } from '@/d.ts';
import taskStore from '@/store/task';
import { isNil } from 'lodash';
import { history } from '@umijs/max';

export interface ITaskAction {
  action: 'openTask';
  data: ITaskData;
}

export interface ITaskData {
  taskId: number;
}

/**
 * 进入第一个连接，并且打开OB教程
 */
export const action = async (actionData: ITaskAction) => {
  const { data } = actionData;
  const taskId = data?.taskId;
  if (isNil(taskId)) {
    return 'TaskId Is Required';
  }
  /**
   * 先确认是否可以获取到task
   */
  const task = await getTaskDetail(taskId);
  if (!task) {
    return 'Get Task Failed';
  }
  taskStore.changeTaskManageVisible(true, TaskPageType.ALL, undefined, taskId, task?.type);
  history.push('/project');
  return;
};
