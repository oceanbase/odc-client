import { SubTaskStatus, TaskStatus, TaskType } from '.';
import { IProject } from './project';
import { ScheduleType } from './schedule';

export enum EResourceType {
  TASKS = 'tasks',
  JOBS = 'jobs',
  JOB_RECORDS = 'jobRecords',
}
export enum EEntityType {
  PROJECT = 'PROJECT',
  USER = 'USER',
  DATABASE = 'DATABASE',
  DATASOURCE = 'DATASOURCE',
  MEMBER = 'MEMBER',
}

export const propertyMap = {
  [EEntityType.PROJECT]: 'projectId',
  [EEntityType.USER]: 'userId',
  [EEntityType.DATABASE]: 'databaseIds',
  [EEntityType.DATASOURCE]: 'datasourceId',
  [EEntityType.MEMBER]: 'userId',
};

export interface IResourceDependency {
  scheduleDependencies: IScheduleDependencyOverview[];
  scheduleTaskDependencies: IScheduleTaskDependencyOverview[];
  flowDependencies: IFlowDependencyOverview[];
}

export type IResourceDependencyItem =
  | IFlowDependencyOverview
  | IScheduleDependencyOverview
  | IScheduleTaskDependencyOverview;

export interface InnerUser {
  accountName: string;
  id: number;
  name: string;
  roleNames: [];
}
/**
 * 资源依赖查询参数接口
 */
export interface IResourceDependencyParams {
  datasourceId?: number;
  databaseIds?: number;
  projectId?: number;
  userId?: number;
}

/**
 * 调度依赖概览接口
 */
export interface IScheduleDependencyOverview {
  id: number;
  name: string;
  type: ScheduleType;
  description: string;
  status: SubTaskStatus;
  project: IProject;
  creator: InnerUser;
  createTime: number;
}

/**
 * 调度任务依赖概览接口
 */
export interface IScheduleTaskDependencyOverview {
  id: number;
  scheduleId: number; // 等同于 scheduleDependency 中的 schedule id
  scheduleName: string;
  taskType: TaskType;
  description: string;
  status: TaskStatus;
  project: IProject;
  creator: InnerUser;
  createTime: number;
}

/**
 * 流程依赖概览接口
 */
export interface IFlowDependencyOverview {
  id: number;
  name: string;
  description: string;
  taskType: TaskType;
  status: TaskStatus;
  project: IProject;
  creator: InnerUser;
  createTime: number;
}
