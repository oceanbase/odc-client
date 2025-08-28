import { TaskRecord, TaskRecordParameters, TaskStatus, TaskType } from '.';
import { IDatabase } from './database';

export enum OrganizationType {
  TEAM = 'TEAM',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum UnfinishedScheduleListType {
  TEAM = 'TEAM',
  INDIVIDUAL = 'INDIVIDUAL',
  ALL = 'ALL',
}

export enum TripartiteExportTaskStatus {
  CREATED = 'CREATED',
  EXPORTING = 'EXPORTING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum AsyncTaskType {
  export = 'export',
  terminateTask = 'terminateTask',
  terminateSchedule = 'terminateSchedule',
  import = 'import',
}

export interface ISwitchOdcTaskListResponse {
  organization: InnerOrganization;
  taskId: number;
  taskType: TaskType;
  description: string;
  innerCreator: InnerCreator;
  created: number;
  status: TaskStatus;
  scheduleType: TaskType;
  // 自己加的
  instanceName: string;
  instanceId: string;
}

export interface InnerOrganization {
  type: OrganizationType;
  organizationId: number;
  innerCreator: InnerCreator;
}

export interface InnerCreator {
  creatorId: number;
  creatorName: string;
  creatorAccountName: string;
}

export interface UnfinishedScheduleListRequest {
  instanceId: string;
  type?: UnfinishedScheduleListType;
}

export interface FileExportResponse {
  taskId: string;
  exporting: boolean;
  downloadUrl: string;
  secret: string;
  fileName: string;
  status: TripartiteExportTaskStatus;
}

export interface ScheduleExportListView {
  id: number;
  scheduleType: TaskType;
  type: TaskType;
  databaseId: number;
  database: IDatabase;
  description: string;
  creatorId: number;
  creator: TaskRecord<TaskRecordParameters>['creator'];
  scheduleStatus: TaskStatus;
  createTime: number;
}

export enum ODCCloudProvider {
  NONE = 'NONE',
  ALIBABA_CLOUD = 'ALIBABA_CLOUD',
  AWS = 'AWS',
  AWSCN = 'AWSCN',
  AZURE = 'AZURE',
  GOOGLE_CLOUD = 'GOOGLE_CLOUD',
  HUAWEI_CLOUD = 'HUAWEI_CLOUD',
  TENCENT_CLOUD = 'TENCENT_CLOUD',
  UNKNOWN = 'UNKNOWN',
}

export enum CloudProvider {
  ALIYUN = 'ALIYUN',
  QCLOUD = 'QCLOUD',
  TENCENT = 'TENCENT',
  AWSCN = 'AWSCN',
  AWS = 'AWS',
  HUAWEI = 'HUAWEI',
  GOOGLE = 'GCP',
}

export const reverseCloudProviderMapping: Record<CloudProvider, ODCCloudProvider> = {
  [CloudProvider.ALIYUN]: ODCCloudProvider.ALIBABA_CLOUD,
  [CloudProvider.QCLOUD]: ODCCloudProvider.TENCENT_CLOUD,
  [CloudProvider.TENCENT]: ODCCloudProvider.TENCENT_CLOUD,
  [CloudProvider.AWSCN]: ODCCloudProvider.AWSCN,
  [CloudProvider.AWS]: ODCCloudProvider.AWS,
  [CloudProvider.HUAWEI]: ODCCloudProvider.HUAWEI_CLOUD,
  [CloudProvider.GOOGLE]: ODCCloudProvider.GOOGLE_CLOUD,
};

export type FilteredODCCloudProvider = Exclude<ODCCloudProvider, 'NONE' | 'AZURE' | 'UNKNOWN'>;

export const fromODCPRoviderToProvider: Record<FilteredODCCloudProvider, CloudProvider> = {
  [ODCCloudProvider.ALIBABA_CLOUD]: CloudProvider.ALIYUN,
  [ODCCloudProvider.TENCENT_CLOUD]: CloudProvider.QCLOUD,
  [ODCCloudProvider.AWSCN]: CloudProvider.AWSCN,
  [ODCCloudProvider.AWS]: CloudProvider.AWS,
  [ODCCloudProvider.HUAWEI_CLOUD]: CloudProvider.HUAWEI,
  [ODCCloudProvider.GOOGLE_CLOUD]: CloudProvider.GOOGLE,
};
