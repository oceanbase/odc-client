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

import SessionStore from '@/store/sessionManager/session';
import React from 'react';
import {
  TableCheckConstraint,
  TableColumn,
  TableForeignConstraint,
  TableIndex,
  TableInfo,
  TablePartition,
  TablePrimaryConstraint,
  TableUniqueConstraint,
} from './interface';

interface ITableContextProps {
  info?: TableInfo;
  setInfo?: (newInfo: TableInfo) => void;
  columns?: TableColumn[];
  setColumns?: (newColumns: TableColumn[]) => void;
  indexes?: TableIndex[];
  setIndexes?: (newIndexes: TableIndex[]) => void;
  partitions?: Partial<TablePartition>;
  setPartitions?: (newPartition: Partial<TablePartition>) => void;
  primaryConstraints?: TablePrimaryConstraint[];
  setPrimaryConstraints?: (newConstraints: TablePrimaryConstraint[]) => void;
  uniqueConstraints?: TableUniqueConstraint[];
  setUniqueConstraints?: (newPartition: TableUniqueConstraint[]) => void;
  foreignConstraints?: TableForeignConstraint[];
  setForeignConstraints?: (newPartition: TableForeignConstraint[]) => void;
  checkConstraints?: TableCheckConstraint[];
  setCheckConstraints?: (newPartition: TableCheckConstraint[]) => void;
  session?: SessionStore;
}

function voidFunc(v: any) {}

const TableContext = React.createContext<ITableContextProps>({
  info: { tableName: '', collation: '', character: '', comment: '' },
  setInfo: voidFunc,
  columns: [],
  setColumns: voidFunc,
  indexes: [],
  setIndexes: voidFunc,
  partitions: null,
  setPartitions: voidFunc,
  primaryConstraints: [],
  setPrimaryConstraints: voidFunc,
  uniqueConstraints: [],
  setUniqueConstraints: voidFunc,
  foreignConstraints: [],
  setForeignConstraints: voidFunc,
  checkConstraints: [],
  setCheckConstraints: voidFunc,
});

export default TableContext;
