import { IDatasource } from './datasource';
import { IEnvironment } from './environment';
import { IProject } from './project';

export enum DatabaseSyncStatus {
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
  PENDING = 'PENDING',
}

export interface IDatabase {
  id: number;
  name: string;
  project: IProject;
  dataSource: IDatasource;
  syncStatus: DatabaseSyncStatus;
  lastSyncTime: number;
  organizationId: number;
  charsetName: string;
  collationName: string;
  tableCount: number;
  environment: IEnvironment;
  existed: boolean;
}
