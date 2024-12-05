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

import { DatabasePermissionType } from '@/d.ts/database';

export interface IServerTable {
  name: string;
  columnGroups: IColumnStoreServerType[];
  tableOptions: Partial<IServerTableOptions>;
  columns: Partial<IServerTableColumn>[];
  indexes: Partial<IServerTableIndex>[];
  constraints: Partial<IServerTableConstraint>[];
  partition: {
    partitionOption?: Partial<{
      type: string;
      expression: string;
      columnNames: string[];
      partitionsNum: number;
      automatic: boolean;
      verticalColumnNames: string[];
    }>;
    partitionDefinitions?: Partial<IServerTablePartitionDefinition>[];
    subpartition?: Partial<IServerTable['partition']>
    subpartitionTemplated?: boolean
  };
  DDL: string;
  createTime: number;
  updateTime: number;
  owner: string;
  schemaName: string;
  warning: string;
  stats: {
    rowCount?: number | undefined;
    tableSize?: string | undefined;
  };
}

export interface IServerTableOptions {
  charsetName: string;
  collationName: string;
  comment: string;
  encryption: boolean;
  autoIncrementInitialValue: number;
  primaryZone: string;
  locality: string;
  replicaNum: number;
  tablegroupName: string;
  rowFormat: string;
  compressionOption: string;
  blockSize: number;
  tabletSize: number;
  useBloomFilter: boolean;
  updateTime?: number;
  createTime?: number;
}

export interface IServerTableColumn {
  schemaName: string;
  tableName: string;
  name: string;
  typeName: string;
  fullTypeName: string;
  scale: number | string;
  precision: number | string;
  typeModifiers: string[];
  nullable: boolean;
  defaultValue: string;
  virtual: boolean;
  comment: string;
  ordinalPosition: number;
  maxLength: number | string;
  charsetName: string;
  collationName: string;
  genExpression: string;
  autoIncrement: boolean;
  unsigned: boolean;
  zerofill: boolean;
  enumValues: string[];
  stored: boolean;
  onUpdateCurrentTimestamp: boolean;
  extraInfo: string;
  charUsed: 'BYTE' | 'CHAR';
  hidden: boolean;
  warning: string;
  keyType: 'PRI' | 'UNI' | 'MUL';
  secondPrecision?: number | string;
  dayPrecision?: number | string;
  yearPrecision?: number | string;
}

export interface IServerTableIndex {
  schemaName: string;
  tableName: string;
  name: string;
  type: string;
  comment: string;
  global: boolean;
  unique: boolean;
  primary: boolean;
  visible: boolean;
  columnNames: string[];
  additionalInfo: string;
  compressInfo: string;
  computeStatistics: boolean;
  nonUnique: boolean;
  cardinality: number;
  createTime: number;
  updateTime: number;
  owner: string;
  collation: string;
  parserName: string;
  keyBlockSize: number;
  warning: string;
  algorithm: string;
  ordinalPosition: number;
  available: boolean;
  columnGroups?: IColumnStoreServerType[];
}

export interface IServerTableConstraint {
  schemaName: string;
  tableName: string;
  ordinalPosition: number;
  name: string;
  type: string;
  columnNames: string[];
  referenceSchemaName: string;
  referenceTableName: string;
  referenceColumnNames: string[];
  comment: string;
  checkClause: string;
  validate: boolean;
  deferability: TableConstraintDefer;
  matchType: 'SIMPLE' | 'FULL' | 'PARTIAL' | 'DEFAULT';
  onUpdateRule: TableForeignConstraintOnUpdateType;
  onDeleteRule: TableForeignConstraintOnDeleteType;
  createTime: number;
  updateTime: number;
  owner: string;
  warning: string;
  enabled: boolean;
}

export interface IServerTablePartitionDefinition {
  name: string;
  type: string;
  maxValues: string[];
  valuesList: string[][];
  comment: string;
  maxRows: number;
  minRows: number;
  ordinalPosition: number;
  parentPartitionDefinition?: IServerTablePartitionDefinition
}

/**
 * 延迟状态
 */
export enum TableConstraintDefer {
  /**
   * 约束不能延迟
   */
  NOT = 'NOT_DEFERRABLE',
  /**
   * 可延迟约束的可延迟检查
   */
  DEFERRABLE_DEFER = 'INITIALLY_DEFERRED',
  /**
   * 可延迟约束的立即检查
   */
  DEFERRABLE_IMMEDIATE = 'INITIALLY_IMMEDIATE',
}

export enum TableForeignConstraintOnDeleteType {
  CASCADE = 'CASCADE',
  NO_ACTION = 'NO_ACTION',
  SET_NULL = 'SET_NULL',
  /**
   * oracle 没这个，效果同 no action
   */
  RESTRICT = 'RESTRICT',
}

export enum TableForeignConstraintOnUpdateType {
  CASCADE = 'CASCADE',
  NO_ACTION = 'NO_ACTION',
  SET_NULL = 'SET_NULL',
  /**
   * oracle 没这个，效果同 no action
   */
  RESTRICT = 'RESTRICT',
}

/**
 * 表操作的相关权限: 目前与库权限保持一致
 */
export enum TablePermissionType {
  QUERY = 'QUERY',
  CHANGE = 'CHANGE',
  EXPORT = 'EXPORT',
}

export enum UnauthorizedPermissionTypeInSQLExecute {
  ODC_TABLE = 'ODC_TABLE',
  ODC_DATABASE = 'ODC_DATABASE',
}

export interface IUnauthorizedDBResources {
  unauthorizedPermissionTypes: (DatabasePermissionType & TablePermissionType)[];
  dataSourceId: number;
  projectId: number;
  projectName: string;
  databaseId: number;
  databaseName: string;
  tableName: string;
  tableId: number;
  applicable: boolean;
  type: UnauthorizedPermissionTypeInSQLExecute;
}
export interface IColumnStoreServerType {
  allColumns?: boolean;
  eachColumn?: boolean;
  groupName?: string;
  columnNames?: string[];
}

export enum ColumnStoreType {
  COLUMN = 'each column',
  ROW = 'all column',
}

export enum DBDefaultStoreType {
  ROW = 'row',
  COLUMN = 'column',
  COMPOUND = 'compound',
}
