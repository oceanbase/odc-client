import { ResultSetColumn } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import React from 'react';

const ResultContext = React.createContext<{
  originColumns: ResultSetColumn[];
  originRows: Record<string, any>[];
  rowKey: string;
  sqlId: string;
  sessionId: string;
  isEditing: boolean;
  session?: SessionStore;
  /**
   * 是否为列模式
   */
  isColumnMode?: boolean;
  downloadObjectData?: (columnName: string, row: any) => void;
  getDonwloadUrl?: (columnKey: any, row: any) => Promise<string>;
}>({
  originColumns: [],
  originRows: [],
  rowKey: '_rowIndex',
  sqlId: '',
  sessionId: null,
  isEditing: false,
  isColumnMode: false,
});

export default ResultContext;
