import { formatMessage } from '@/util/intl';
import { ConnectType, IConnection, TaskType } from '.';
import { ODCCloudProvider } from './migrateTask';
import { ScheduleType } from './schedule';

export enum ScheduleNonImportableType {
  LACK_OF_INSTANCE = 'LACK_OF_INSTANCE',
  TYPE_NOT_MATCH = 'TYPE_NOT_MATCH',
  DATASOURCE_NON_EXIST = 'DATASOURCE_NON_EXIST',
  IMPORTED = 'IMPORTED',
}

export const ScheduleNonImportableTypeMap = {
  [ScheduleNonImportableType.DATASOURCE_NON_EXIST]: formatMessage({
    id: 'src.d.ts.25D43093',
    defaultMessage: '数据源不存在',
  }),
  [ScheduleNonImportableType.LACK_OF_INSTANCE]: formatMessage({
    id: 'src.d.ts.CAC52ADB',
    defaultMessage: '实例不存在',
  }),
  [ScheduleNonImportableType.TYPE_NOT_MATCH]: formatMessage({
    id: 'src.d.ts.B89ABE6D',
    defaultMessage: '类型不匹配',
  }),
  [ScheduleNonImportableType.IMPORTED]: formatMessage({
    id: 'src.d.ts.7AE88D0A',
    defaultMessage: '已导入',
  }),
};

export interface IScheduleTaskImportRequest {
  bucketName: string;
  objectId: string;
  scheduleType: TaskType;
  projectId: string;
  decryptKey: string;
  // 导入接口必须传
  importableExportRowId?: string[];
}

export interface IImportScheduleTaskView {
  /**
   * The unique ID of the exported file, which uniquely represents one schedule in one exported file
   */
  exportRowId: string;
  /**
   * Indicates whether a schedule can be imported
   */
  importable: boolean;
  /**
   * Reasons for not being importable
   */
  nonImportableType: ScheduleNonImportableType;
  /**
   * Schedule id of the system before export
   */
  originId: string;
  /**
   * Project name of the system before export
   */
  originProjectName: string;
  type: TaskType | ScheduleType;
  databaseView: IImportDatabaseView;
  targetDatabaseView: IImportDatabaseView;
}

export interface IImportDatabaseView {
  cloudProvider: ODCCloudProvider;
  type: ConnectType;
  instanceId: string;
  instanceNickName: string;
  tenantNickName: string;
  tenantId: string;
  region: string;
  host: string;
  port: number;
  username: string;
  /**
   * datasource name from export file
   */
  name: string;
  /**
   * If the imported datasource is consistent with the existing data source, the existing data source
   * will be reused. It's means matched datasource name, null means not matched
   */
  matchedDatasourceName: string;
  databaseName: string;
}

export interface IImportTaskResult {
  /**
   * The unique ID of the exported file, which uniquely represents one task in one file
   */
  exportRowId: string;
  success: boolean;
  failedReason: string;
}

export enum IMPORT_TYPE {
  ZIP = 'ZIP',
  SQL = 'SQL',
  CSV = 'CSV',
  DIR = 'DIR',
}

export interface IBatchTerminateFlowResult {
  terminateSucceed: boolean;
  flowInstanceId: number;
  failReason: string;
}

export interface IScheduleTerminateCmd {
  scheduleType: TaskType;
  ids: number[];
}

export interface IScheduleTerminateResult {
  terminateSucceed: boolean;
  scheduleType: TaskType;
  id: number;
  failReason: string;
}
