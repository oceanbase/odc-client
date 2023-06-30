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
