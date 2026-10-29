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

import { TableItem, TableItemInDB } from './interface';

/**
 * 按库将表分组返回：
 * 可用来获取:用户授权的提交参数
 * @param tables
 * @returns
 */
export const groupTableByDataBase = (tables: TableItem[]): { tableId: number }[] => {
  return tables.map((item) => {
    return {
      tableId: item.tableId,
    };
  });
};

/**
 * 按库将表分组返回：
 * 可用来获取:工单授权的提交参数
 * @param tables
 * @returns
 */
export const groupTableIdsByDataBase = (tables: TableItem[]): number[] => {
  return [...new Set(tables?.map((i) => i.tableId))];
};
/**
 * 和groupTableByDataBase配合使用
 * 可将groupTableByDataBase按库分组后的值拍平为TableItem
 * 就可以直接set到TableSeletor上了
 * @param tables
 * @returns
 */
export const flatTableByGroupedParams = (
  tables: { databaseId: number; tableList: TableItemInDB[] }[],
): TableItem[] => {
  if (!tables) {
    return [];
  }
  const result: TableItem[] = [];
  tables.forEach(({ databaseId, tableList }) => {
    tableList?.forEach((item) => {
      item?.name && result.push({ databaseId, tableName: item.name, tableId: item.id });
    });
  });
  return result;
};
