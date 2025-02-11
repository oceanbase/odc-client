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
