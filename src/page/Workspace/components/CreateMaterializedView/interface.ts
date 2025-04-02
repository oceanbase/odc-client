import { ColumnStoreType } from '@/d.ts/table';
import { RefreshMethod, RefreshScheduleUnit } from '@/d.ts';
import type { Dayjs } from 'dayjs';

export enum MaterializedViewTabType {
  INFO = 'info',
  COLUMN = 'column',
  INDEX = 'index',
  CONSTRAINT = 'constranint',
  PARTITION = 'partition',
}

export interface MaterializedViewInfo {
  name: string;
  columnGroups?: ColumnStoreType[];
  refreshMethod: RefreshMethod;
  parallelismDegree?: number;
  refreshSchedule?: {
    // false用于前端选择值，取值为false时，refreshSchedule为空，不会传给服务端
    startStrategy?: StartStrategy | false;
    interval?: number;
    startWith?: Dayjs | number;
    unit?: RefreshScheduleUnit;
  };
  enableQueryRewrite?: boolean;
  enableQueryComputation?: boolean;
}

export enum TableSelectorNode {
  database = 'database',
  tableRoot = 'tableRoot',
  table = 'table',
  materializedViewRoot = 'materializedViewRoot',
  materializedView = 'materializedView',
}

export interface MvColumns {
  aliasName: string;
  columnName: string;
  dbName: string;
  tableName: string;
  tableOrViewAliasName: string;
  viewName: string;
}

export interface MviewUnits {
  dbName: string;
  tableName: string;
  viewName: string;
  aliasName: string;
}

export enum StartStrategy {
  START_AT = 'START_AT',
  START_NOW = 'START_NOW',
}
