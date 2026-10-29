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
