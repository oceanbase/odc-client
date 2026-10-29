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
}

export const propertyMap = {
  [EEntityType.PROJECT]: 'projectId',
  [EEntityType.USER]: 'userId',
  [EEntityType.DATABASE]: 'databaseIds',
  [EEntityType.DATASOURCE]: 'datasourceId',
};

export interface IResourceDependency {
  data: {
    scheduleDependencies: IScheduleDependencyOverview[];
    scheduleTaskDependencies: IScheduleTaskDependencyOverview[];
    flowDependencies: IFlowDependencyOverview[];
  };
  successful?: boolean;
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
