import type { TablePaginationConfig, TableProps } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { FixedType } from 'rc-table/es/interface';

export enum CommonTableMode {
  BIG = 'BIG',
  SMALL = 'SMALL',
}
export enum CommonTableBodyMode {
  BIG = 'BIG',
  SMALL = 'SAMLL',
}
export interface ITableInstance {
  reload: (args?: ITableLoadOptions) => void;
  resetSelectedRows: () => void;
}
export interface ITitleContent {
  tabs?: {
    value?: string | number;
    options: ITabOption[];
    onChange?: (value: string) => void;
  };
  title?: string;
  description?: string;
  enabledReload?: boolean;
  wrapperClass?: string;
}
export interface IFilterContent {
  filters?: (
    | {
        name: string;
        title?: string;
        defaultValue?: string | number;
        hidden?: boolean;
        dropdownWidth?: boolean | number;
        options: {
          label: React.ReactNode;
          value: any;
          disabled?: boolean;
        }[];
      }
    | { render: (props: ITableLoadOptions) => React.ReactNode }
  )[];
  // 支持 显隐切换
  filterValue?: Record<string, any>;
  enabledSearch?: boolean;
  searchPlaceholder?: string;
  onChange?: (args?: ITableLoadOptions) => void;
}

export enum IOperationOptionType {
  button = 'button',
  icon = 'icon',
  dropdown = 'dropdown',
  custom = 'custom',
}
export interface IOperationOption {
  tooltip?: string;
  type: IOperationOptionType;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  render?: () => React.ReactNode;
  isPrimary?: boolean;
  visible?: boolean;
  disabled?: boolean;
  overlay?: React.ReactElement | (() => React.ReactElement);
  onClick?: (args?: ITableLoadOptions) => void;
}
export interface IOperationContent {
  options: IOperationOption[];
}
export interface IRowSelecter<T> extends TableRowSelection<T> {
  options: {
    okText: string;
    onOk: (keys: React.Key[]) => void;
  }[];
}
export interface ITabOption {
  label: React.ReactNode;
  value: any;
  disabled?: boolean;
}
export interface ITableLoadOptions {
  filters?: ITableFilter;
  searchValue?: string;
  sorter?: ITableSorter;
  pagination?: ITablePagination;
  pageSize?: number;
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
export type ITableFilter = Record<string, any>;
export { FixedType, TableProps, TablePaginationConfig };
