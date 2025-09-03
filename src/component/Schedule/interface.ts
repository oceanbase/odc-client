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
  // DATABASE = 'DATABASE',
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

export enum ApprovalStatus {
  APPROVING = 'APPROVING',
  APPROVE_FAILED = 'APPROVE_FAILED',
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

export interface IScheduleParam {
  searchValue: string;
  searchType: ScheduleSearchType;
  type: ScheduleType[];
  status: ScheduleStatus[];
  projectIds: number[];
  sort: string;
  timeRange: number | string;
  executeDate?: [Dayjs, Dayjs];
  approveStatus?: ApprovalStatus[];
  tab?: ScheduleTab;
}

export interface ISubTaskParam {
  searchValue: string;
  searchType: SubTaskSearchType;
  type: ScheduleType[];
  status: ScheduleTaskStatus[];
  projectIds: number[];
  sort: string;
  timeRange: number | string;
  executeDate?: [Dayjs, Dayjs];
  tab?: ScheduleTaskTab;
}
