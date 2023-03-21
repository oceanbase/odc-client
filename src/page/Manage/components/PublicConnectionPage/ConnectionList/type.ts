import { ConnectionFilterStatus, ConnectionMode, ConnectType } from '@/d.ts';

export enum ConnectionFilterActions {
  READ_AND_WRITE = 'connect',
  READ_ONLY = 'readonlyconnect',
  ALL = 'ALL',
}

export interface ITableFilter {
  label?: string[];
  clusterName?: string[];
  tenantName?: string[];
  dialectType?: ConnectionMode;
  type?: ConnectType;
  status?: ConnectionFilterStatus;
  permittedAction?: ConnectionFilterActions;
}

export interface ITableSorter {
  column: {
    dataIndex: string;
  };

  columnKey: string;
  order: string;
}

export interface ITablePagination {
  current: number;
  pageSize: number;
}
