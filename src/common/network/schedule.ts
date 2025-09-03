import {
  ScheduleType,
  IScheduleRecord,
  ScheduleRecordParameters,
  createScheduleRecord,
  createSchedueleParameters,
  ScheduleStatus,
} from '@/d.ts/schedule';
import request from '@/util/request';
import {
  IScheduleTaskExecutionDetail,
  ScheduleTaskStatus,
  SubTaskParameters,
} from '@/d.ts/scheduleTask';
import { Operation, IResponseData, CommonTaskLogType, ITaskStatParam, IStat } from '@/d.ts';
import { scheduleTask, IScheduleTaskRecord } from '@/d.ts/scheduleTask';
import { ApprovalStatus } from '@/component/Schedule/interface';
import { omit } from 'lodash';
import { IScheduleTerminateCmd, IScheduleTerminateResult } from '@/d.ts/importTask';
export interface ScheduleListParams {
  dataSourceName?: string;
  dataSourceId?: number[];
  databaseName?: string;
  tenantId?: string;
  clusterId?: string;
  id?: number;
  name?: string;
  status?: ScheduleStatus[];
  type?: ScheduleType[];
  startTime?: string;
  endTime?: string;
  creator?: string;
  approveStatus?: ApprovalStatus[];
  projectUniqueIdentifier?: string;
  projectIds?: number[];
  triggerStrategy?: 'DAY' | 'WEEK' | 'MONTH' | 'CRON' | 'START_NOW' | 'START_AT';
  page?: number;
  size?: number;
  sort?: string;
  approveByCurrentUser?: boolean;
}

export interface SubTaskListParams {
  dataSourceName?: string;
  dataSourceId?: number[];
  databaseName: string;
  tenantId?: string;
  clusterId?: string;
  id: number;
  scheduleId: number;
  scheduleName: string;
  status: ScheduleTaskStatus[];
  scheduleType: ScheduleType[];
  startTime?: string;
  creator?: string;
  endTime?: string;
  projectIds?: number[];
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * 查询作业列表
 * @param params
 * @returns
 */
export const getScheduleList = async (
  params: ScheduleListParams,
): Promise<IResponseData<IScheduleRecord<ScheduleRecordParameters>>> => {
  const res = await request.get('/api/v2/schedule/schedules', {
    params,
  });
  return res?.data;
};

/**
 * 新建作业
 */
export const createSchedule = async (data: createScheduleRecord<createSchedueleParameters>) => {
  const res = await request.post(`/api/v2/schedule/schedules`, {
    data,
  });
  return res;
};

/**
 * 查询作业详情
 */
export const getScheduleDetail = async (
  id: number,
  ignoreError: boolean = false,
): Promise<IScheduleRecord<ScheduleRecordParameters>> => {
  const res = await request.get(`/api/v2/schedule/schedules/${id}`);
  return res?.data;
};

/**
 * 删除作业
 * @param id
 * @returns
 */
export const deleteSchedule = async (id: number, projectId: number) => {
  const res = await request.delete(`/api/v2/schedule/schedules/${id}`, {
    params: {
      projectId,
    },
  });
  return res;
};

/**
 * 更新作业
 * @param data
 * @returns
 */
export const updateSchedule = async (data: createScheduleRecord<createSchedueleParameters>) => {
  const { id } = data;
  const res = await request.put(`/api/v2/schedule/schedules/${id}`, { data });
  return res;
};

/**
 * 禁用作业
 */
export const pauseSchedule = async (id: number) => {
  const res = await request.post(`/api/v2/schedule/schedules/${id}/pause`);
  return res;
};

/**
 * 启用作业
 */
export const resumeSchedule = async (id: number) => {
  const res = await request.post(`/api/v2/schedule/schedules/${id}/resume`);
  return res;
};

/**
 * 终止作业
 */
export const terminateSchedule = async (id: number) => {
  const res = await request.post(`/api/v2/schedule/schedules/${id}/terminate`);
  return res;
};

/**
 * 操作详情
 */
export async function getOperationDetail(
  scheduleId: number,
  scheduleChangeLogId: number,
): Promise<Operation> {
  const res = await request.get(
    `/api/v2/schedule/schedules/${scheduleId}/changes/${scheduleChangeLogId}`,
  );
  return res?.data;
}

/**
 * 更新限流配置
 */
export async function updateLimiterConfig(
  taskId: number,
  data: {
    rowLimit?: number;
    dataSizeLimit?: number;
  },
): Promise<boolean> {
  const res = await request.put(`/api/v2/schedule/schedules/${taskId}/dlmRateLimitConfiguration`, {
    data,
  });
  return !!res?.data;
}

/**
 * 计划任务终止-发起
 */
export async function batchTerminateScheduleAndTask(data: IScheduleTerminateCmd): Promise<string> {
  const res = await request.post(`/api/v2/schedule/schedules/asyncTerminate`, {
    data,
  });
  return res?.data;
}

/**
 * 作业终止-查看
 */
export async function getTerminateScheduleResult(
  terminateId: string,
): Promise<IScheduleTerminateResult[]> {
  const res = await request.get(
    `/api/v2/schedule/schedules/asyncTerminateResult?terminateId=${terminateId}`,
  );
  return res?.data;
}

/**
 * 作业终止-查看日志
 */
export async function getTerminateScheduleLog(terminateId: string): Promise<string> {
  const res = await request.get(
    `/api/v2/schedule/schedules/asyncTerminateLog?terminateId=${terminateId}`,
  );
  return res?.data;
}
/**
 * 查询周期任务状态
 */
export async function getScheduleStat<T>(
  params: ITaskStatParam,
): Promise<Record<ScheduleType, IStat>> {
  const res = await request.get('/api/v2/collaboration/landingPage/scheduleStat', {
    params,
  });
  return res?.data;
}

/**
 * 查询作业子任务日志
 */
export async function getCycleTaskLog(
  scheduleId: number,
  taskId: number,
  logType: CommonTaskLogType,
): Promise<string> {
  const res = await request.get(`/api/v2/schedule/schedules/${scheduleId}/tasks/${taskId}/log`, {
    params: {
      logType,
    },
  });
  return res?.data;
}

/**
 * 获取作业子任务全量日志下载URL
 */
export async function getDownloadUrl(scheduleId: number, taskId: number) {
  const res = await request.post(
    `/api/v2/schedule/schedules/${scheduleId}/tasks/${taskId}/log/getDownloadUrl`,
  );
  return res?.data;
}

/**
 * 获取执行视角下的子任务列表
 */
export const getSubTaskList = async (
  params,
): Promise<IResponseData<scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>>> => {
  const res = await request.get(`api/v2/schedule/tasks`, {
    params,
  });
  return res?.data;
};

/**
 * 获取子任务列表
 */
export const listScheduleTasks = async (params: {
  scheduleId: number;
  size: number;
  page: number;
}): Promise<IResponseData<scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>>> => {
  const { scheduleId, size, page } = params;
  const res = await request.get(`/api/v2/schedule/schedules/${scheduleId}/tasks`, {
    params: omit(params, 'scheduleId'),
  });
  return res?.data;
};

/**
 * 获取子任务详情
 */
export const detailScheduleTask = async (
  scheduleId: number,
  taskId: number,
): Promise<scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>> => {
  const res = await request.get(`/api/v2/schedule/schedules/${scheduleId}/tasks/${taskId}`);
  return res?.data;
};

/**
 * 获取操作记录
 */
export const listChangeLog = async (id: number): Promise<IResponseData<Operation>> => {
  const res = await request.get(`/api/v2/schedule/schedules/${id}/changes`);
  return res?.data;
};

/**
 * 执行作业子任务
 * @param scheduleId
 * @param taskId
 * @returns
 */
export const startScheduleTask = async (scheduleId: number, taskId: number) => {
  const res = await request.put(`/api/v2/schedules/${scheduleId}/tasks/${taskId}/start`);
  return res;
};

/**
 * 回滚作业子任务
 * @param scheduleId
 * @param taskId
 * @returns
 */
export const rollbackScheduleTask = async (scheduleId: number, taskId: number) => {
  const res = await request.put(`/api/v2/schedules/${scheduleId}/tasks/${taskId}/rollback`);
  return res;
};

/**
 * 获取作业子任务日志
 * @param scheduleId
 * @param taskId
 * @param logType
 * @returns
 */
export const getScheduleTaskLog = async (scheduleId: number, taskId: number, logType: string) => {
  const res = await request.get(
    `/api/v2/schedule/schedules/${scheduleId}/tasks/${taskId}/executions/latest/log`,
    {
      params: {
        logType,
      },
    },
  );
  return res?.data;
};

/**
 * 终止作业子任务（数据归档）
 * @param scheduleId
 * @param taskId
 * @returns
 */
export const stopScheduleTask = async (scheduleId: number, taskId: number) => {
  const res = await request.post(
    `/api/v2/schedule/schedules/${scheduleId}/tasks/${taskId}/executions/latest/stop`,
  );
  return res;
};

/**
 * 恢复作业子任务
 * @param scheduleId
 * @param taskId
 * @returns
 */
export const resumeScheduleTask = async (scheduleId: number, taskId: number) => {
  const res = await request.post(`/api/v2/schedule/schedules/${scheduleId}/tasks/${taskId}/resume`);
  return res;
};

/**
 * 暂停作业子任务
 * @param scheduleId
 * @param taskId
 * @returns
 */
export const pauseScheduleTask = async (scheduleId: number, taskId: number) => {
  const res = await request.post(`/api/v2/schedule/schedules/${scheduleId}/tasks/${taskId}/pause`);
  return res;
};
