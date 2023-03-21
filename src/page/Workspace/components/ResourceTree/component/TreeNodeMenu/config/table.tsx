import { actionTypes } from '@/component/Acess';
import { DbObjectType, ResourceTreeNodeMenuKeys } from '@/d.ts';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { IOptions } from '../type';

export const tableMenusConfig = {
  [DbObjectType.table]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.ViewTableStructure',
        }),
      ],
    },

    {
      key: ResourceTreeNodeMenuKeys.BROWSER_DDL,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.ViewDdl' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.BROWSER_DATA,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.ViewTableData' })],
      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.CREATE_TABLE,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.table.New' }),
        formatMessage({ id: 'odc.TreeNodeMenu.config.table.Table' }),
      ],

      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.IMPORT_TABLE,
      text: formatMessage({
        id: 'odc.TreeNodeMenu.config.table.Import',
      }) /*导入*/,
      actionType: actionTypes.update,
      isHide: (options: IOptions) => {
        return !setting.enableDBImport;
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.EXPORT_TABLE,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.table.Export' }), //导出
      ],
      isHide: (options: IOptions) => {
        return !setting.enableDBExport;
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.table.Download' }), //下载
    },
    {
      key: ResourceTreeNodeMenuKeys.MOCK_DATA,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.table.AnalogData' }), // 模拟数据
      ],
      isHide: (options: IOptions) => {
        return !setting.enableMockdata;
      },
      actionType: actionTypes.update,
      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.OPEN_SQL_WINDOW,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.table.OpenTheSqlWindow' }), //打开 SQL 窗口
      ],
    },

    {
      key: ResourceTreeNodeMenuKeys.COPY,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.table.Copy' }), //复制
      ],
      children: [
        {
          key: ResourceTreeNodeMenuKeys.COPY_NAME,
          text: [
            formatMessage({ id: 'odc.TreeNodeMenu.config.table.ObjectName' }), //对象名
          ],
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_SELECT,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.SelectStatement',
            }),

            //SELECT 语句
          ],
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_INSERT,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.InsertStatement',
            }),

            //INSERT 语句
          ],
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_UPDATE,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.UpdateStatement',
            }),

            //UPDATE 语句
          ],
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_DELETE,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.DeleteStatement',
            }),

            //DELETE 语句
          ],
        },
      ],

      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.RENAME_TABLE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Rename' })],
      actionType: actionTypes.update,
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_TABLE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Delete' })],
      actionType: actionTypes.delete,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_TABLE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },
  ],

  tableColumnSet: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_COLUMNS,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.ViewColumns' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.CREATE_COLUMN,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.CreateColumn' })],
      isHide: (options: IOptions) => {
        return options?.disableCreate || false;
      },
      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_COLUMNS,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },
  ],

  tableColumn: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_COLUMN,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.CreateColumn' })],
      hasDivider: true,
      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_COLUMN,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.DeleteAColumn' })],
      actionType: actionTypes.delete,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_COLUMNS,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.RENAME_COLUMN,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.RenameAColumn' })],
      isHide: (options: IOptions) => {
        return options.disableColumnRename;
      },
      actionType: actionTypes.update,
    },
  ],

  tableIndexSet: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_INDEXES,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.ViewIndexes' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_INDEXES,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },
  ],

  tableIndex: [
    {
      key: ResourceTreeNodeMenuKeys.EDIT_INDEX,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.EditIndex' })],
      isHide: (options: IOptions) => {
        return options.disableIndexEdit;
      },
      actionType: actionTypes.update,
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_INDEX,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.DeleteAnIndex' })],
      actionType: actionTypes.delete,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_INDEXES,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.RENAME_INDEX,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.RenameAnIndex' })],
      isHide: (options: IOptions) => {
        return options.disableIndexRename;
      },
      actionType: actionTypes.update,
    },
  ],

  tablePartitionSet: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_PARTITIONS,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.ViewPartitions' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.CREATE_PARTITION,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.CreatePartition' })],
      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_PARTITIONS,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },
  ],

  tablePartition: [
    {
      key: ResourceTreeNodeMenuKeys.EDIT_PARTITION,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.ViewPartitions' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.CREATE_PARTITION,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.CreatePartition' })],
      isHide: (options: IOptions) => {
        return options.disablePartitionCreate;
      },
      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.SPLIT_PARTITION,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.PartitionSplitting',
        }),
      ],

      hasDivider: true,
      isHide: (options: IOptions) => {
        return options.disablePartitionSplit;
      },
      actionType: actionTypes.update,
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_PARTITION,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.DeleteAPartition' })],
      isHide: (options: IOptions) => {
        return options.disablePartitionCreate;
      },
      actionType: actionTypes.delete,
    },

    {
      key: ResourceTreeNodeMenuKeys.RENAME_PARTITION,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.RenameAPartition' })],
      isHide: (options: IOptions) => {
        return options.disablePartitionRename;
      },
      actionType: actionTypes.update,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_PARTITIONS,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },
  ],

  tableConstraintsSet: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_CONSTRAINTS,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.ViewConstraints' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.CREATE_CONSTRAINT,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.CreateAnIndex' })],
      isHide: (options: IOptions) => {
        return options.disableConstraintCreate;
      },
      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_CONSTRAINTS,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },
  ],

  tableConstraint: [
    {
      key: ResourceTreeNodeMenuKeys.EDIT_CONSTRAINT,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.EditConstraints' })],
      isHide: (options: IOptions) => {
        return options.disableConstraintEdit;
      },
      actionType: actionTypes.update,
    },

    {
      key: ResourceTreeNodeMenuKeys.CREATE_CONSTRAINT,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.CreateConstraint' })],
      hasDivider: true,
      isHide: (options: IOptions) => {
        return options.disableConstraintCreate;
      },
      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_CONSTRAINT,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.DeleteConstraint' })],
      actionType: actionTypes.delete,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_CONSTRAINTES,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.Refresh' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.RENAME_CONSTRAINT,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.table.RenameConstraints' })],
      isHide: (options: IOptions) => {
        return options.disableConstraintRename;
      },
      actionType: actionTypes.update,
    },
  ],
};
