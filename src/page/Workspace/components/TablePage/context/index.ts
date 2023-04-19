import SessionStore from '@/store/sessionManager/session';
import React from 'react';
import { ITableModel } from '../../CreateTable/interface';

interface ITablePageContext {
  table: Partial<ITableModel>;
  editMode?: boolean;
  session?: SessionStore;
  onRefresh: () => void;
  showExecuteModal?: (sql: any, tableName: any, onSuccess) => Promise<boolean>;
}
const TablePageContext = React.createContext<ITablePageContext>({
  table: null,
  onRefresh: () => {},
  editMode: false,
});

export default TablePageContext;
