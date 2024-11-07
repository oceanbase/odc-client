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

import { fieldIconMap } from '@/constant';
import { DbObjectType, IPartitionType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import { convertDataTypeToDataShowType } from '@/util/utils';
import Icon, { FolderOpenFilled } from '@ant-design/icons';

import { ResourceNodeType, TreeDataNode } from '../type';

import { IDatabase } from '@/d.ts/database';
import { PropsTab, TopTab } from '@/page/Workspace/components/TablePage';
import { openTableViewPage } from '@/store/helper/page';
import { ReactComponent as TableOutlined } from '@/svgr/menuTable.svg';
import logger from '@/util/logger';

export function ExternalTableTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const tables = dbSession?.database?.externalTableTables;
  const treeData: TreeDataNode = {
    title: '外表',
    key: `${database?.id}-${dbName}-externalTable`,
    type: ResourceNodeType.ExternalTableRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (tables) {
    const dataTypes = dbSession?.dataTypes;
    /**
     * 检测重复table
     */
    let visited = new Set();

    treeData.children = tables
      // 无权限的表过滤掉， 就像无权限的库一样
      // .filter((table) => table?.info?.authorizedPermissionTypes?.length > 0)??
      .map((table) => {
        if (visited.has(table.info?.tableName)) {
          logger.error('table name is duplicated', table.info?.tableName);
          return;
        }
        visited.add(table.info?.tableName);
        const tableKey = `${database.id}-${dbSession?.database?.tableVersion}-${dbName}-externalTable-${table?.info?.tableName}`;
        let columnRoot: TreeDataNode;

        if (table.columns) {
          columnRoot = {
            title: formatMessage({
              id: 'odc.ResourceTree.Nodes.table.Column',
              defaultMessage: '列',
            }), //列
            type: ResourceNodeType.ExternalTableColumnRoot,
            key: `${tableKey}-column`,
            sessionId: dbSession?.sessionId,
            data: table,
            icon: (
              <FolderOpenFilled
                style={{
                  color: '#3FA3FF',
                }}
              />
            ),

            children: table.columns?.map((c) => {
              return {
                title: c.name,
                key: `${tableKey}-column-${c.name}`,
                type: ResourceNodeType.TableColumn,
                sessionId: dbSession?.sessionId,
                icon: convertDataTypeToDataShowType(c.type, dataTypes) && (
                  <Icon
                    component={fieldIconMap[convertDataTypeToDataShowType(c.type, dataTypes)]}
                    style={{
                      color: '#3FA3FF',
                    }}
                  />
                ),

                isLeaf: true,
              };
            }),
          };
        }

        return {
          title: table?.info?.tableName,
          key: tableKey,
          type: ResourceNodeType.ExternalTable,
          data: table,
          dbObjectType: DbObjectType.table,
          doubleClick(session, node, databaseFrom) {
            openTableViewPage(
              table.info.tableName,
              TopTab.PROPS,
              PropsTab.DDL,
              session?.odcDatabase?.id,
              node?.data?.info?.tableId,
            );
          },
          icon: (
            <TableOutlined
              style={{
                color: '#3FA3FF',
              }}
            />
          ),

          sessionId: dbSession?.sessionId,
          isLeaf: false,
          children: table.columns ? [columnRoot].filter(Boolean) : null,
        };
      })
      .filter(Boolean);
  }

  return treeData;
}
