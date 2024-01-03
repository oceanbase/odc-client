/*
 * Copyright 2024 OceanBase
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
import {
  TableCheckConstraint,
  TableForeignConstraint,
  TablePrimaryConstraint,
  TableUniqueConstraint,
} from '../../../components/CreateTable/interface';
import { ResourceNodeType, TreeDataNode } from '../type';

import { IDatabase } from '@/d.ts/database';
import { PropsTab, TopTab } from '@/page/Workspace/components/TablePage';
import { openTableViewPage } from '@/store/helper/page';
import { ReactComponent as IndexSvg } from '@/svgr/index.svg';
import { ReactComponent as TableOutlined } from '@/svgr/menuTable.svg';
import { ReactComponent as PartitionSvg } from '@/svgr/Partition.svg';

export function TableTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const tables = dbSession?.database?.tables;
  const treeData: TreeDataNode = {
    title: formatMessage({ id: 'odc.ResourceTree.Nodes.table.Table' }), //表
    key: `${database?.id}-${dbName}-table`,
    type: ResourceNodeType.TableRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (tables) {
    const dataTypes = dbSession?.dataTypes;
    treeData.children = tables.map((table) => {
      const tableKey = `${database.id}-${dbSession?.database?.tableVersion}-${dbName}-table-${table.info.tableName}`;
      let columnRoot: TreeDataNode;
      if (table.columns) {
        columnRoot = {
          title: formatMessage({ id: 'odc.ResourceTree.Nodes.table.Column' }), //列
          type: ResourceNodeType.TableColumnRoot,
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
      let indexRoot: TreeDataNode;
      if (table.indexes?.length) {
        indexRoot = {
          title: formatMessage({ id: 'odc.ResourceTree.Nodes.table.Index' }), //索引
          type: ResourceNodeType.TableIndexRoot,
          key: `${tableKey}-index`,
          data: table,
          icon: (
            <FolderOpenFilled
              style={{
                color: '#3FA3FF',
              }}
            />
          ),

          sessionId: dbSession?.sessionId,
          children: table.indexes?.map((c) => {
            return {
              title: c.name,
              key: `${tableKey}-index-${c.name}`,
              type: ResourceNodeType.TableIndex,
              data: c,
              icon: (
                <Icon
                  component={IndexSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),

              sessionId: dbSession?.sessionId,
              isLeaf: true,
            };
          }),
        };
      }

      let partitionRoot: TreeDataNode = {
        title: formatMessage({ id: 'odc.ResourceTree.Nodes.table.Partition' }), //分区
        type: ResourceNodeType.TablePartitionRoot,
        key: `${tableKey}-partition`,
        data: table,
        sessionId: dbSession?.sessionId,
        icon: (
          <FolderOpenFilled
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
      };
      /**
       * 处理分区
       */
      switch (table.partitions?.partType) {
        case IPartitionType.HASH: {
          partitionRoot.children = [
            {
              title: 'HASH',
              key: `${tableKey}-partition-hash`,
              isLeaf: true,
              // @ts-ignore
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),

              type: ResourceNodeType.TablePartition,
            },
          ];

          break;
        }
        case IPartitionType.KEY: {
          partitionRoot.children = [
            {
              title: 'KEY',
              key: `${tableKey}-partition-key`,
              isLeaf: true,
              // @ts-ignore
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),

              type: ResourceNodeType.TablePartition,
            },
          ];

          break;
        }
        case IPartitionType.LIST: {
          partitionRoot.children = table.partitions.partitions.map((p) => {
            return {
              title: p.name,
              key: `${tableKey}-partition-list-${p.name}`,
              isLeaf: true,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),

              type: ResourceNodeType.TablePartition,
            };
          });
          break;
        }
        case IPartitionType.LIST_COLUMNS: {
          partitionRoot.children = table.partitions.partitions.map((p) => {
            return {
              title: p.name,
              key: `${tableKey}-partition-listColumns-${p.name}`,
              isLeaf: true,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),

              type: ResourceNodeType.TablePartition,
            };
          });
          break;
        }
        case IPartitionType.RANGE: {
          partitionRoot.children = table.partitions.partitions.map((p) => {
            return {
              title: p.name,
              key: `${tableKey}-partition-range-${p.name}`,
              isLeaf: true,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),

              type: ResourceNodeType.TablePartition,
            };
          });
          break;
        }
        case IPartitionType.RANGE_COLUMNS: {
          partitionRoot.children = table.partitions.partitions.map((p) => {
            return {
              title: p.name,
              key: `${tableKey}-partition-rangeColumns-${p.name}`,
              isLeaf: true,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),

              type: ResourceNodeType.TablePartition,
            };
          });
          break;
        }
        default: {
          partitionRoot = null;
        }
      }

      let constraintRoot: TreeDataNode;

      let constraint: (
        | TableCheckConstraint
        | TablePrimaryConstraint
        | TableUniqueConstraint
        | TableForeignConstraint
      )[] = []
        .concat(table.checkConstraints)
        .concat(table.uniqueConstraints)
        .concat(table.foreignConstraints)
        .concat(table.primaryConstraints)
        .filter(Boolean);

      if (constraint.length) {
        constraintRoot = {
          title: formatMessage({ id: 'odc.ResourceTree.Nodes.table.Constraints' }), //约束
          type: ResourceNodeType.TableConstraintRoot,
          key: `${tableKey}-constraint`,
          data: table,
          sessionId: dbSession?.sessionId,
          icon: (
            <FolderOpenFilled
              style={{
                color: '#3FA3FF',
              }}
            />
          ),

          children: constraint.map((c) => {
            return {
              title: c.name,
              type: ResourceNodeType.TableConstraint,
              isLeaf: true,
              data: table,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={IndexSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),

              key: `${tableKey}-constraint-${c.name}`,
            };
          }),
        };
      }

      return {
        title: table.info.tableName,
        key: tableKey,
        type: ResourceNodeType.Table,
        data: table,
        dbObjectType: DbObjectType.table,
        doubleClick(session, node, databaseFrom) {
          openTableViewPage(
            table.info.tableName,
            TopTab.PROPS,
            PropsTab.DDL,
            session?.odcDatabase?.id,
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
        children: table.columns
          ? [columnRoot, indexRoot, partitionRoot, constraintRoot].filter(Boolean)
          : null,
      };
    });
  }

  return treeData;
}
