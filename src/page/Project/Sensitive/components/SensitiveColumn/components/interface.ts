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

import { IDataType } from '@/d.ts';
import { ESensitiveColumnType } from '@/d.ts/sensitiveColumn';

export type TreeNode = {
  title: string;
  key: string;
  databaseId: number;
  icon: JSX.Element;
  children: TreeNode[];
};
export type SelectNodeChild = {
  title: string;
  key: string;
  type: ESensitiveColumnType;
  columnType: string;
  dataTypeUnits: IDataType[];
};
export type SelectNode = {
  databaseId: number;
  databaseKey: string;
  databaseTitle: string;
  tableKey: string;
  tableTitle: string;
  type: ESensitiveColumnType;
  children: SelectNodeChild[];
};
export type DatabaseColumn = {
  dataTypeUnits: IDataType[];
  databaseId: number;
  databaseName: string;
  table2Columns: {
    [key in string | number]: any[];
  };
  view2Columns: {
    [key in string | number]: any[];
  };
};
export interface ManualFormProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: () => void;
}
