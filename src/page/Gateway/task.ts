import { getTaskDetail } from '@/common/network/task';
import { TaskPageType } from '@/d.ts';
import taskStore from '@/store/task';
import { isNil } from 'lodash';
import { history } from 'umi';

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
