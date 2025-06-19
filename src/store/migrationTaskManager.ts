import { observable, action, computed, runInAction } from 'mobx';
import { notification } from 'antd';
import { AsyncTaskType } from '@/d.ts/migrateTask';

export interface TaskConfig {
  asyncTaskType: AsyncTaskType;
  api: {
    fetchStatus: (params: any) => Promise<any>;
    submit: (params: any) => Promise<any>;
  };
  getSubmitParams?: () => any;
  isTaskCompleted: (result: any) => boolean;
  notificationHandler: {
    handleResult: (result: any, taskId: string) => void;
    handleError: (error: any) => void;
    closeNotification?: (notificationId: string) => void;
    startNotification?: (taskId: number, ids: number[]) => string;
  };
  pollingInterval?: number;
  timeout?: number;
}

interface TaskStoreState {
  isFinished: boolean;
  result: any;
  pollingTimer?: any;
  startTime: number;
  notificationId?: string;
}

class TaskManagerModel {
  @observable tasks = new Map<string, TaskStoreState>();
  config: TaskConfig;

  constructor(config: TaskConfig) {
    this.config = config;
  }

  @computed
  get taskKeys() {
    return Array.from(this.tasks.keys());
  }

  @action
  startTask = async (key: string, taskType: string, params: any) => {
    this.stopTask(key);

    const notificationId = this.config.notificationHandler?.startNotification?.(
      params?.taskId,
      params?.ids,
    );

    this.tasks.set(key, {
      isFinished: false,
      result: null,
      startTime: Date.now(),
      notificationId: notificationId || `${params?.taskId}`,
      pollingTimer: undefined,
    });

    await this.pollTask(key, params);
  };

  @action
  stopTask = (key: string) => {
    const task = this.tasks.get(key);
    if (task) {
      if (task.pollingTimer) {
        clearTimeout(task.pollingTimer);
      }
      if (task.notificationId) {
        notification.destroy(task.notificationId);
      }
      this.tasks.delete(key);
    }
  };

  @action
  private pollTask = async (key: string, params: any) => {
    const task = this.tasks.get(key);
    if (!task || task.isFinished) return;

    try {
      const result = await this.config.api.fetchStatus(params.taskId);
      if (this.config.isTaskCompleted(result)) {
        const notificationToDestroy = task.notificationId || `${params?.taskId}`;

        runInAction(() => {
          task.isFinished = true;
          task.result = result;
          task.pollingTimer = undefined;
          task.notificationId = notificationToDestroy;
        });

        setTimeout(() => {
          notification.destroy(notificationToDestroy);
          this.config.notificationHandler.handleResult(result, params.taskId);
          runInAction(() => {
            task.notificationId = undefined;
          });
        }, 200);
      } else {
        const timer = setTimeout(
          () => this.pollTask(key, params),
          this.config.pollingInterval || 2000,
        );
        runInAction(() => {
          task.pollingTimer = timer;
        });
      }
    } catch (error) {
      this.handleError(key, error);
    }
  };

  @action
  private handleError = (key: string, error: any) => {
    const task = this.tasks.get(key);
    if (task) {
      if (task.notificationId) {
        notification.destroy(task.notificationId);
      }
      if (task.pollingTimer) {
        clearTimeout(task.pollingTimer);
      }

      runInAction(() => {
        task.isFinished = true;
        task.result = {
          status: 'ERROR',
          errorMessage: error.message,
        };
        task.pollingTimer = undefined;
        task.notificationId = undefined;
      });

      setTimeout(() => {
        this.config.notificationHandler?.handleError?.(error);
      }, 100);
    }
  };

  @action
  clearAllTasks = () => {
    this.tasks.forEach((task, key) => {
      if (task.pollingTimer) {
        clearTimeout(task.pollingTimer);
      }
      if (task.notificationId) {
        notification.destroy(task.notificationId);
      }
    });
    this.tasks.clear();
  };

  getTaskStatus = (key: string) => this.tasks.get(key)?.result;

  isTaskFinished = (key: string) => !!this.tasks.get(key)?.isFinished;
}

export const createTaskManager = (config: TaskConfig) => {
  return new TaskManagerModel(config);
};
