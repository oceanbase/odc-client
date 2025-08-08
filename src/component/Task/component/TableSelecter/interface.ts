import { IDatabase } from '@/d.ts/database';
import { DataNode, EventDataNode } from 'antd/lib/tree';

export type TableItem = { databaseId: number; tableName: string; tableId?: number };

export interface tableTreeEventDataNode extends EventDataNode<DataNode> {
  isLogicalDatabase: boolean;
}

export interface TableSelecterRef {
  loadDatabases: () => Promise<void>;
  loadTables: (dbId: number) => Promise<{
    tables: LoadTableItems[];
    externalTables: LoadTableItems[];
    views: LoadTableItems[];
    materializedViews: LoadTableItems[];
  }>;
  expandTable: (dbId: number) => void;
  getAllLoadedTables: () => TableItemInDB[];
}

export type LoadTableItems = {
  name: string;
  id: number;
  databaseId: number;
};

export type TableItemInDB = {
  name: string;
  id: number;
};

/**
 * 库以及它下面的表的信息
 */
export interface IDataBaseWithTable extends IDatabase {
  /**
   * 表列表
   */
  tableList: TableItemInDB[];
  hasGetTableList?: boolean;
  externalTablesList: TableItemInDB[];
  viewList: TableItemInDB[];
  materializedViewList: TableItemInDB[];
}
