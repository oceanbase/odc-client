import { ConnectionMode, IAsyncTaskResultSet } from '.';
import { IDatabase } from './database';
import { IDatasource } from './datasource';
import { IEnvironment } from './environment';
import { IServerTable } from './table';

export interface InconsistentPhysicalTable {
  id?: number;
  name: string;
  expression: string;
  physicalTableCount: number;
  basePhysicalTable: IServerTable;
}
export interface ILogicalTable {
  id?: number;
  name?: string;
  expression: string;
  physicalTableCount: number;
  inconsistentPhysicalTables: InconsistentPhysicalTable[];
  topologies: ITopology[];
  basePhysicalTable: IServerTable;
}
export interface ITopology {
  expression: string;
  physicalDatabase: IDatabase;
  tableCount: number;
}
export interface ILogicalDatabase {
  id?: number;
  name: string;
  alias: string;
  dialectType: ConnectionMode;
  environment: IEnvironment;
  physicalDatabases: IDatabase[];
  logicalTables: ILogicalTable[];
}

export interface ISchemaChangeRecord {
  id: number;
  database: IDatabase;
  dataSource: IDatasource;
  sql: string;
  sqlExecuteResults: IAsyncTaskResultSet[];
  totalSqlCount: number;
  completedSqlCount: number;
  status: SchemaChangeRecordStatus;
}

export enum SchemaChangeRecordStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TERMINATED = 'TERMINATED',
  SKIPPING = 'SKIPPING',
  SKIPPED = 'SKIPPED',
  TERMINATING = 'TERMINATING',
  TERMINATE_FAILED = 'TERMINATE_FAILED',
}

export interface IPreviewSql {
  sql: string;
  database: IDatabase;
}
