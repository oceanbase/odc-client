import React from 'react';
import { ITableModel } from '../../CreateTable/interface';

interface ITablePageContext {
  table: Partial<ITableModel>;
  editMode?: boolean;
  onRefresh: () => void;
  showExecuteModal?: (sql: any, tableName: any, onSuccess) => Promise<boolean>;
}
const TablePageContext = React.createContext<ITablePageContext>({
  table: null,
  onRefresh: () => {},
  editMode: false,
});

export default TablePageContext;
