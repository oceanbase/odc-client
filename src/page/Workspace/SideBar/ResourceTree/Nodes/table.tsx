import { fieldIconMap } from '@/constant';
import { DbObjectType, IPartitionType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
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
import IndexSvg from '@/svgr/index.svg';
import TableOutlined from '@/svgr/menuTable.svg';
import PartitionSvg from '@/svgr/Partition.svg';

export function TableTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const tables = dbSession?.database?.tables;
  const treeData: TreeDataNode = {
    title: '表',
    key: `${dbName}-table`,
    type: ResourceNodeType.TableRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (tables) {
    const dataTypes = dbSession?.dataTypes;
    treeData.children = tables.map((table) => {
      const tableKey = `${dbSession?.database?.tableVersion}-${dbName}-table-${table.info.tableName}`;
      let columnRoot: TreeDataNode;
      if (table.columns) {
        columnRoot = {
          title: '列',
          type: ResourceNodeType.TableColumnRoot,
          key: `${tableKey}-column`,
          sessionId: dbSession?.sessionId,
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
              data: c,
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
          title: '索引',
          type: ResourceNodeType.TableIndexRoot,
          key: `${tableKey}-index`,
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
        title: '分区',
        type: ResourceNodeType.TablePartitionRoot,
        key: `${tableKey}-partition`,
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
          title: '约束',
          type: ResourceNodeType.TableConstraintRoot,
          key: `${tableKey}-constraint`,
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
