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

import { IPartitionType } from '@/d.ts';
import {
  ColumnStoreType,
  TableConstraintDefer,
  TableForeignConstraintOnDeleteType,
  TableForeignConstraintOnUpdateType,
  TablePermissionType,
} from '@/d.ts/table';

export enum TableTabType {
  INFO = 'info',
  COLUMN = 'column',
  INDEX = 'index',
  CONSTRAINT = 'constranint',
  PARTITION = 'partition',
}

export interface ITableModel {
  info: TableInfo;
  columns: TableColumn[];
  indexes: TableIndex[];
  partitions: Partial<TablePartition>;
  subpartitions?: TablePartition;
  primaryConstraints: TablePrimaryConstraint[];
  uniqueConstraints: TableUniqueConstraint[];
  foreignConstraints: TableForeignConstraint[];
  checkConstraints: TableCheckConstraint[];
  authorizedPermissionTypes?: TablePermissionType[];
}
export interface TableInfo {
  tableName: string;
  character?: string;
  collation?: string;
  comment: string;
  DDL?: string;
  updateTime?: number;
  createTime?: number;
  owner?: string;
  rowCount?: number;
  tableSize?: string;
  authorizedPermissionTypes?: TablePermissionType[];
  columnGroups: ColumnStoreType[];
  isLogicalTable?: boolean;
  tableId?: number;
  databaseId?: number;
}

export interface TableColumn {
  name: string;
  type: string;
  /**
   * 笼统的长度，在数字代表有多少位，在char里可以代表字节，也可以代表长度，也可以是 10 byte这样的写法，比较随机
   */
  width: string | number;
  /**
   * 小数点有效位数
   */
  scale: string | number;
  notNull: boolean;
  autoIncrement: boolean;
  /**
   * 是否为虚拟列
   */
  generated: boolean;
  /**
   * 虚拟类型：存储
   */
  stored?: boolean;
  comment: string;
  character: string;
  collation: string;
  /**
   * 无符号整数
   */
  unsigned: boolean;
  /**
   * 数值类型填充0
   */
  zerofill: boolean;
  /**
   * 时间类型是否根据当前时间更新
   */
  currentTime: boolean;
  /**
   * 枚举类型的值
   */
  enumMembers: string[];
  /**
   * 缺省值，表达式
   */
  defaultValueOrExpr?: string;
  ordinalPosition?: number;
  secondPrecision?: number | string;
  dayPrecision?: number | string;
  yearPrecision?: number | string;
  tableName?: string;
}

export interface TableIndex {
  name: string;
  /**
   * 索引方法
   */
  method: TableIndexMehod;
  /**
   * 索引类型
   */
  type: TableIndexType;
  /**
   * 范围
   */
  scope: TableIndexScope;
  columns: string[];
  /**
   * 索引是否可见，可以用来开关索引
   */
  visible: boolean;
  ordinalPosition: number;
  /**
   *  是否有效
   */
  available?: boolean;
  columnGroups: ColumnStoreType[];
}

export type TableConstraint =
  | TablePrimaryConstraint
  | TableUniqueConstraint
  | TableForeignConstraint
  | TableCheckConstraint;

interface BaseConstraint {
  name: string;
  enable?: boolean;
  defer?: TableConstraintDefer;
  ordinalPosition?: number;
}
export interface TablePrimaryConstraint extends BaseConstraint {
  columns: string[];
}

export interface TableUniqueConstraint extends BaseConstraint {
  columns: string[];
}

export interface TableForeignConstraint extends BaseConstraint {
  columns: string[];
  schemaname: string;
  tableName: string;
  /**
   * 被关联的父表字段
   */
  parentColumns: string;
  /**
   * 删除策略
   */
  onDelete: TableForeignConstraintOnDeleteType;
  onUpdate: TableForeignConstraintOnUpdateType;
}

export interface TableCheckConstraint extends BaseConstraint {
  check: string;
}

export enum TableIndexMehod {
  NONE = 'NONE',
  BTREE = 'BTREE',
  HASH = 'HASH',
  FULLTEXT = 'FULLTEXT',
}

export enum TableIndexType {
  FULLTEXT = 'FULLTEXT',
  UNIQUE = 'UNIQUE',
  NORMAL = 'NORMAL',
}

export enum TableIndexScope {
  GLOBAL = 'GLOBAL',
  LOCAL = 'LOCAL',
}

export interface ITableRangePartition {
  columns: { columnName: string }[];
  columnName: string;
  expression: string;
  partType: IPartitionType.RANGE;
  partitions: {
    name: string;
    value: string;
    /***
     * 只用做编辑的时候做标注
     */
    isNew?: boolean;
    ordinalPosition?: number;
    key?: string;
    /* 二级分区才会有 */
    parentName?: string;
    valueForColumnDisplay?: string;
  }[];
  subPartitions?: TablePartition;
  subpartitionTemplated?: boolean;
}

export interface ITableListPartition {
  columns: { columnName: string }[];
  columnName: string;
  expression: string;
  partType: IPartitionType.LIST;
  partitions: {
    name: string;
    value: string;
    isNew?: boolean;
    ordinalPosition?: number;
    key?: string;
    parentName?: string;
    valueForColumnDisplay?: string;
  }[];
  subPartitions?: TablePartition;
  subpartitionTemplated?: boolean;
}

export interface ITableHashPartition {
  columnName: string;
  expression: string;
  partType: IPartitionType.HASH;
  partNumber: number;
  partitions?: {
    name: string;
    ordinalPosition?: number;
    key?: string;
    parentName?: string;
  }[];
  subPartitions?: TablePartition;
  subpartitionTemplated?: boolean;
}

export interface ITableKeyPartition {
  columns: { columnName: string }[];
  partType: IPartitionType.KEY;
  partNumber: number;
  partitions?: {
    name: string;
    ordinalPosition?: number;
    key?: string;
    parentName?: string;
  }[];
  subPartitions?: TablePartition;
  subpartitionTemplated?: boolean;
}

export interface ITableRangeColumnsPartition {
  partType: IPartitionType.RANGE_COLUMNS;
  columns: { columnName: string }[];
  partitions?: {
    name: string;
    value: Record<string, string>;
    isNew?: boolean;
    ordinalPosition?: number;
    key?: string;
    parentName?: string;
    valueForColumnDisplay?: string;
  }[];
  subPartitions?: TablePartition;
  subpartitionTemplated?: boolean;
}

export interface ITableListColumnsPartition {
  partType: IPartitionType.LIST_COLUMNS;
  columns: { columnName: string }[];
  partitions?: {
    name: string;
    value: Record<string, string>[];
    isNew?: boolean;
    ordinalPosition?: number;
    key?: string;
    parentName?: string;
    valueForColumnDisplay?: string;
  }[];
  subPartitions?: TablePartition;
  subpartitionTemplated?: boolean;
}
export type TablePartition =
  | ITableHashPartition
  | ITableKeyPartition
  | ITableListColumnsPartition
  | ITableListPartition
  | ITableRangeColumnsPartition
  | ITableRangePartition;
