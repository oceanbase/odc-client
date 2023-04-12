import {
  DbObjectType,
  IPartitionType,
  ISequence,
  ISynonym,
  ITableColumn,
  IView,
  MenusType,
  TableTreeNode,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import Icon, { FolderOpenFilled } from '@ant-design/icons';
// @ts-ignore
import SequenceSvg from '@/svgr/menuSequence.svg';
// @ts-ignore
import SynonymSvg from '@/svgr/menuSynonym.svg';
// @ts-ignore
import ViewSvg from '@/svgr/menuView.svg';
// @ts-ignore
import IndexSvg from '@/svgr/index.svg';
// @ts-ignore
import PartitionSvg from '@/svgr/Partition.svg';

import TableOutlined from '@/svgr/menuTable.svg';

import { fieldIconMap } from '@/constant';
import { convertDataTypeToDataShowType } from '@/util/utils';
import { ITableModel, TableColumn, TableIndex } from '../../CreateTable/interface';

// 树节点构造
const TREE_NODES = {
  TABLE: {
    getConfig(node: Partial<ITableModel>, options?: { [key: string]: any }) {
      const r = {
        title: node.info.tableName,
        key: options.key,
        type: TableTreeNode.TABLE,
        origin: node,
        icon: (
          <TableOutlined
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: DbObjectType.table as MenusType,
        },
        children: node.columns?.length ? [] : null,
      };
      if (r.children) {
        r.children.push(TREE_NODES.COLUMN_SET.getConfig(node, options));
        r.children.push(TREE_NODES.TABLE_INDEX_SET.getConfig(node, options));
        if (node.partitions) {
          r.children.push(TREE_NODES.TABLE_PARTITION_SET.getConfig(node, options));
        }
        r.children.push(TREE_NODES.TABLE_CONSTRAINTS_SET.getConfig(node, options));
      }
      return r;
    },
  },

  VIEW: {
    getConfig(node: Partial<IView>, options?: { [key: string]: any }) {
      const r = {
        title: node.viewName,
        key: options.key,
        type: TableTreeNode.TABLE,
        origin: node,
        icon: (
          <Icon
            type="view"
            component={ViewSvg}
            style={{
              color: 'var(--icon-color-1)',
              position: 'relative',
              top: 1,
            }}
          />
        ),
        menu: {
          type: DbObjectType.view as MenusType,
        },
        children: [],
      };
      r.children.push(TREE_NODES.VIEW_COLUMN_SET.getConfig(node, options));
      return r;
    },
  },
  VIEW_COLUMN_SET: {
    getConfig(node: Partial<IView>, options?: { [key: string]: any }) {
      const key = `${options.key}-column`;
      const r = {
        title: formatMessage({ id: 'workspace.tree.table.column' }),
        key,
        type: TableTreeNode.COLUMN,
        origin: node,
        icon: (
          <FolderOpenFilled
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tableColumnSet',
          options: null,
        },
        children: [],
      };

      if (node.columns?.length) {
        node.columns.forEach((column: ITableColumn, index: number) => {
          r.children.push(
            TREE_NODES.VIEW_COLUMN.getConfig(column, {
              ...options,
              key: `${key}-${index}`,
            }),
          );
        });
      }
      return r;
    },
  },
  VIEW_COLUMN: {
    getConfig(node: Partial<ITableColumn>, options?: { [key: string]: any }) {
      const r = {
        title: node.name,
        key: options.key,
        type: 'COLUMN',
        origin: node,
        isLeaf: true,
        icon: convertDataTypeToDataShowType(node.type, options.dataTypes) && (
          <Icon
            component={fieldIconMap[convertDataTypeToDataShowType(node.type, options.dataTypes)]}
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tableColumn',
          options: null,
          disabled: false,
        },
      };
      r.menu.disabled = true;
      r.menu.options = {
        disableCreate: true,
      };

      return r;
    },
  },

  SEQUENCE: {
    getConfig(node: Partial<ISequence>, options?: { [key: string]: any }) {
      return {
        title: node.name,
        key: options.key,
        type: 'SEQUENCE',
        origin: node,
        icon: (
          <Icon
            component={SequenceSvg}
            style={{
              color: 'var(--icon-color-5)',
            }}
          />
        ),
        menu: {
          type: 'sequence' as MenusType,
        },
      };
    },
  },

  SYNONYM: {
    getConfig(node: Partial<ISynonym>, options?: { [key: string]: any }) {
      return {
        title: node.synonymName,
        key: options.key,
        type: 'SYNONYM',
        origin: node,
        icon: (
          <Icon
            component={SynonymSvg}
            style={{
              color: 'var(--icon-color-5)',
            }}
          />
        ),
        menu: {
          type: 'synonym' as MenusType,
        },
      };
    },
  },

  COLUMN_SET: {
    getConfig(node: Partial<ITableModel>, options?: { [key: string]: any }) {
      const key = `${options.key}-column`;
      const r = {
        title: formatMessage({ id: 'workspace.tree.table.column' }),
        key,
        type: TableTreeNode.COLUMN,
        origin: node,
        icon: (
          <FolderOpenFilled
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tableColumnSet',
          options: null,
        },
        children: [],
      };

      if (node.columns?.length) {
        node.columns.forEach((column: TableColumn, index: number) => {
          r.children.push(
            TREE_NODES.COLUMN.getConfig(column, {
              ...options,
              key: `${key}-${index}`,
            }),
          );
        });
      }
      return r;
    },
  },

  COLUMN: {
    getConfig(node: Partial<TableColumn>, options?: { [key: string]: any }) {
      const r = {
        title: node.name,
        key: options.key,
        type: 'COLUMN',
        origin: node,
        isLeaf: true,
        icon: convertDataTypeToDataShowType(node.type, options.dataTypes) && (
          <Icon
            component={fieldIconMap[convertDataTypeToDataShowType(node.type, options.dataTypes)]}
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tableColumn',
          options: null,
          disabled: false,
        },
      };
      r.menu.options = {
        disableColumnRename: true,
      };

      return r;
    },
  },

  TABLE_INDEX_SET: {
    getConfig(node: Partial<ITableModel>, options?: { [key: string]: any }) {
      const key = `${options.key}-index`;
      const r = {
        title: formatMessage({ id: 'workspace.tree.table.index' }),
        key,
        type: TableTreeNode.INDEX,
        origin: node,
        icon: (
          <FolderOpenFilled
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tableIndexSet',
        },
        children: [],
      };

      if (node.indexes?.length) {
        node.indexes.forEach((indexe: Partial<TableIndex>, index: number) => {
          r.children.push(
            TREE_NODES.TABLE_INDEX.getConfig(indexe, {
              ...options,
              key: `${key}-${index}`,
            }),
          );
        });
      }
      return r;
    },
  },

  TABLE_INDEX: {
    getConfig(node: Partial<TableIndex>, options?: { [key: string]: any }) {
      const r = {
        title: node.name,
        key: options.key,
        type: TableTreeNode.INDEX,
        origin: node,
        isLeaf: true,
        icon: (
          <Icon
            component={IndexSvg}
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tableIndex',
          options: {
            disableIndexEdit: true,
            disableIndexRename: true,
          },
        },
      };
      return r;
    },
  },

  TABLE_PARTITION_SET: {
    getConfig(node: Partial<ITableModel>, options?: { [key: string]: any }) {
      const key = `${options.key}-partition`;
      const r = {
        title: formatMessage({ id: 'workspace.tree.table.partition' }),
        key,
        type: TableTreeNode.PARTITION,
        origin: node,
        icon: (
          <FolderOpenFilled
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tablePartitionSet',
        },
        children: [],
      };

      if (node.partitions) {
        switch (node.partitions.partType) {
          case IPartitionType.HASH: {
            r.children.push(
              TREE_NODES.TABLE_PARTITION.getConfig(
                {
                  partName: node.partitions.partType,
                  partType: node.partitions.partType,
                },
                {
                  ...options,
                  key: `${key}-hash`,
                },
              ),
            );
            break;
          }
          case IPartitionType.KEY: {
            r.children.push(
              TREE_NODES.TABLE_PARTITION.getConfig(
                {
                  partName: node.partitions.partType,
                  partType: node.partitions.partType,
                },
                {
                  ...options,
                  key: `${key}-key`,
                },
              ),
            );
            break;
          }
          case IPartitionType.LIST: {
            node.partitions.partitions.forEach((p) => {
              r.children.push(
                TREE_NODES.TABLE_PARTITION.getConfig(
                  {
                    partName: p.name,
                    partType: IPartitionType.LIST,
                  },
                  {
                    ...options,
                    key: `${key}-${p.ordinalPosition}`,
                  },
                ),
              );
            });
            break;
          }
          case IPartitionType.LIST_COLUMNS: {
            node.partitions.partitions.forEach((p) => {
              r.children.push(
                TREE_NODES.TABLE_PARTITION.getConfig(
                  {
                    partName: p.name,
                    partType: IPartitionType.LIST_COLUMNS,
                  },
                  {
                    ...options,
                    key: `${key}-${p.ordinalPosition}`,
                  },
                ),
              );
            });
            break;
          }
          case IPartitionType.RANGE: {
            node.partitions.partitions.forEach((p) => {
              r.children.push(
                TREE_NODES.TABLE_PARTITION.getConfig(
                  {
                    partName: p.name,
                    partType: IPartitionType.RANGE,
                  },
                  {
                    ...options,
                    key: `${key}-${p.ordinalPosition}`,
                  },
                ),
              );
            });
            break;
          }
          case IPartitionType.RANGE_COLUMNS: {
            node.partitions.partitions.forEach((p) => {
              r.children.push(
                TREE_NODES.TABLE_PARTITION.getConfig(
                  {
                    partName: p.name,
                    partType: IPartitionType.RANGE_COLUMNS,
                  },
                  {
                    ...options,
                    key: `${key}-${p.ordinalPosition}`,
                  },
                ),
              );
            });
            break;
          }
        }
      }
      return r;
    },
  },

  TABLE_PARTITION: {
    getConfig(
      node: { partName: string; partType: IPartitionType },
      options?: { [key: string]: any },
    ) {
      const r = {
        title: node.partName || node.partType,
        key: options.key,
        type: TableTreeNode.PARTITION,
        origin: node,
        isLeaf: true,
        icon: (
          <Icon
            component={PartitionSvg}
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tablePartition',
          disabled: true,
          options: {
            disablePartitionCreate: !(
              node.partType !== IPartitionType.HASH && node.partType !== IPartitionType.KEY
            ),
            disablePartitionSplit: !(
              node.partType !== IPartitionType.HASH && node.partType !== IPartitionType.KEY
            ),
            disablePartitionRename: true,
          },
        },
      };
      return r;
    },
  },

  TABLE_CONSTRAINTS_SET: {
    getConfig(node: Partial<ITableModel>, options?: { [key: string]: any }) {
      const key = `${options.key}-constraint`;
      const r = {
        title: formatMessage({ id: 'workspace.tree.table.constraint' }),
        key,
        type: TableTreeNode.CONSTRAINT,
        origin: node,
        icon: (
          <FolderOpenFilled
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        menu: {
          type: 'tableConstraintsSet',
          // 控制onCreateColumn是否被隐藏
          options: {
            disableConstraintCreate: true,
          },
        },
        children: [],
      };

      node.checkConstraints?.forEach((c) => {
        r.children.push(
          TREE_NODES.TABLE_CONSTRAINT.getConfig(c, {
            ...options,
            key: `${key}-checkConstraints-${c.ordinalPosition}`,
          }),
        );
      });
      node.uniqueConstraints?.forEach((c) => {
        r.children.push(
          TREE_NODES.TABLE_CONSTRAINT.getConfig(c, {
            ...options,
            key: `${key}-uniqueConstraints-${c.ordinalPosition}`,
          }),
        );
      });
      node.foreignConstraints?.forEach((c) => {
        r.children.push(
          TREE_NODES.TABLE_CONSTRAINT.getConfig(c, {
            ...options,
            key: `${key}-foreignConstraints-${c.ordinalPosition}`,
          }),
        );
      });
      node.primaryConstraints?.forEach((c) => {
        r.children.push(
          TREE_NODES.TABLE_CONSTRAINT.getConfig(c, {
            ...options,
            key: `${key}-primaryConstraints-${c.ordinalPosition}`,
          }),
        );
      });
      return r;
    },
  },

  TABLE_CONSTRAINT: {
    getConfig(node: { name: string }, options?: { [key: string]: any }) {
      const r = {
        title: node.name,
        key: options.key,
        type: TableTreeNode.CONSTRAINT,
        origin: node,
        icon: (
          <Icon
            component={IndexSvg}
            style={{
              color: '#3FA3FF',
            }}
          />
        ),
        isLeaf: true,
        menu: {
          type: 'tableConstraint',
          options: {
            disableConstraintEdit: true,
            disableConstraintCreate: true,
            disableConstraintRename: true,
          },
        },
      };
      return r;
    },
  },
};

export default TREE_NODES;
