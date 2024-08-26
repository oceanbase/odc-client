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
  name: string;
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
  sqlExecuteResult: IAsyncTaskResultSet;
  totalSqlCount: number;
  completedSqlCount: number;
  SchemaChangeRecordStatus: SchemaChangeRecordStatus;
}

export enum SchemaChangeRecordStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum SqlExecuteStatus {
  CREATED = 'CREATED',
}

export interface IPreviewSql {
  sql: string;
  database: IDatabase;
}
