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

import {
  ScheduleType,
  ScheduleDetailType,
  IScheduleRecord,
  ScheduleRecordParameters,
  ScheduleStatus,
} from '@/d.ts/schedule';
import type { Dayjs } from 'dayjs';
import { IResponseData, TaskStatus } from '@/d.ts';
import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';

export enum SchedulePageMode {
  COMMON = 'COMMON',
  PROJECT = 'PROJECT',
  MULTI_PAGE = 'MULTI_PAGE',
}

export interface IState {
  detailId: number;
  scheduleType: ScheduleType;
  detailVisible: boolean;
  status: TaskStatus;
  schedule: IResponseData<IScheduleRecord<ScheduleRecordParameters>>;
  detailType: ScheduleDetailType;
}

export interface ISubTaskState {
  detailId: number;
  detailVisible: boolean;
  subTask: IResponseData<any>;
  scheduleId: number;
}

export interface IApprovalState {
  visible: boolean;
  approvalStatus: boolean;
  detailId: number;
}

export enum ScheduleSearchType {
  SCHEDULENAME = 'SCHEDULENAME',
  SCHEDULEID = 'SCHEDULEID',
  CREATOR = 'CREATOR',
  DATABASE = 'DATABASE',
  DATASOURCE = 'DATASOURCE',
  CLUSTER = 'CLUSTER',
  TENANT = 'TENANT',
}

export enum SubTaskSearchType {
  ID = 'ID',
  SCHEDULENAME = 'SCHEDULENAME',
  SCHEDULEID = 'SCHEDULEID',
  CREATOR = 'CREATOR',
  DATABASE = 'DATABASE',
  DATASOURCE = 'DATASOURCE',
  CLUSTER = 'CLUSTER',
  TENANT = 'TENANT',
}

export enum ScheduleTab {
  all = 'all',
  approveByCurrentUser = 'approveByCurrentUser',
}

export enum ScheduleTaskTab {
  all = ' all',
  approveByCurrentUser = 'approveByCurrentUser',
}

export enum ScheduleApprovalStatus {
  APPROVING = 'APPROVING',
  APPROVE_EXPIRED = 'APPROVE_EXPIRED',
  APPROVE_CANCELED = 'APPROVE_CANCELED',
  APPROVE_REJECTED = 'APPROVE_REJECTED',
}

export enum Perspective {
  /** 调度视角 */
  scheduleView = 'scheduleView',
  /** 执行视角*/
  executionView = 'executionView',
}

export interface IPagination {
  current: number;
  pageSize: number;
}

export enum ScheduleCreateTimeSort {
  ASC = 'createTime,asc',
  DESC = 'createTime,desc',
}

export enum ScheduleTaskCreateTimeSort {
  ASC = 'fireTime,asc',
  DESC = 'fireTime,desc',
}

export interface IScheduleParam {
  searchValue: string;
  searchType: ScheduleSearchType;
  type: ScheduleType[];
  status: ScheduleStatus[];
  projectIds: number[];
  sort: ScheduleCreateTimeSort;
  timeRange: number | string;
  executeDate?: [Dayjs, Dayjs];
  approveStatus?: ScheduleApprovalStatus[];
  tab?: ScheduleTab;
}

export interface ISubTaskParam {
  searchValue: string;
  searchType: SubTaskSearchType;
  type: ScheduleType[];
  status: ScheduleTaskStatus[];
  projectIds: number[];
  sort: ScheduleTaskCreateTimeSort;
  timeRange: number | string;
  executeDate?: [Dayjs, Dayjs];
  tab?: ScheduleTaskTab;
}
