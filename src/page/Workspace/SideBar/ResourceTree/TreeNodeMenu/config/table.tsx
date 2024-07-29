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

import { dropObject } from '@/common/network/database';
import { getTableInfo } from '@/common/network/table';
import { actionTypes } from '@/component/Acess';
import { copyObj } from '@/component/TemplateInsertModal';
import { DbObjectType, DragInsertType, ResourceTreeNodeMenuKeys, TaskType } from '@/d.ts';
import { ITableModel } from '@/page/Workspace/components/CreateTable/interface';
import { PropsTab, TopTab } from '@/page/Workspace/components/TablePage';
import { openCreateTablePage, openNewSQLPage, openTableViewPage } from '@/store/helper/page';
import modalStore from '@/store/modal';
import pageStore from '@/store/page';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { PlusOutlined, QuestionCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { hasTableExportPermission, hasTableChangePermission } from '../index';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';
import { getDataSourceModeConfig } from '@/common/datasource';
import tracert from '@/util/tracert';
import { isSupportExport } from './helper';
export const tableMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.TableRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_TABLE,
      icon: PlusOutlined,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.New',
          defaultMessage: '新建',
        }),
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Table',
          defaultMessage: '表',
        }),
      ],

      actionType: actionTypes.create,
      async run(session, node) {
        openCreateTablePage(session?.odcDatabase?.id);
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.Refresh',
          defaultMessage: '刷新',
        }), //刷新
      ],

      icon: ReloadOutlined,
      actionType: actionTypes.read,
      async run(session, node) {
        await session.database.getTableList();
      },
    },
  ],

  [ResourceNodeType.Table]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.ViewTableStructure',
          defaultMessage: '查看表结构',
        }),
      ],

      run(session, node) {
        openTableViewPage(
          (node.data as ITableModel)?.info?.tableName,
          TopTab.PROPS,
          PropsTab.DDL,
          session?.odcDatabase?.id,
        );
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_DATA,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.ViewTableData',
          defaultMessage: '查看表数据',
        }),
      ],

      ellipsis: true,
      hasDivider: true,
      run(session, node) {
        const tableName = (node.data as ITableModel)?.info?.tableName;
        const exsitPage = pageStore.pages.find((page) => {
          return page.params.tableName === tableName;
        });
        let propsTab = PropsTab.INFO;
        if (exsitPage?.params) {
          /**
           * 假如已经打开了对应的tab，那么子tab要维持原样
           * aone/issue/30543531
           */
          const { topTab: oldTopTab, propsTab: oldPropsTab } = exsitPage.params;
          if (oldTopTab === TopTab.DATA) {
            propsTab = oldPropsTab;
          }
        }
        openTableViewPage(tableName, TopTab.DATA, propsTab, session?.odcDatabase?.id);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.IMPORT_TABLE,
      text: formatMessage({
        id: 'odc.TreeNodeMenu.config.table.Import',
        defaultMessage: '导入',
      }) /*导入*/,
      actionType: actionTypes.update,
      ellipsis: true,
      disabled: (session, node) => {
        return !hasTableChangePermission(session, node);
      },
      isHide: (session) => {
        return (
          !setting.enableDBImport ||
          !getDataSourceModeConfig(session?.connection?.type)?.features?.task?.includes(
            TaskType.IMPORT,
          )
        );
      },
      run(session, node) {
        modalStore.changeImportModal(true, {
          table: node.data,
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.EXPORT_TABLE,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Export',
          defaultMessage: '导出',
        }), //导出
      ],

      ellipsis: true,
      disabled: (session, node) => {
        return !hasTableExportPermission(session, node);
      },
      isHide: (session) => {
        return !isSupportExport(session);
      },
      run(session, node) {
        const table = node.data as ITableModel;
        modalStore.changeExportModal(true, {
          type: DbObjectType.table,
          name: table?.info?.tableName,
          databaseId: session?.database.databaseId,
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      text: formatMessage({
        id: 'odc.TreeNodeMenu.config.table.Download',
        defaultMessage: '下载',
      }),
      //下载
      ellipsis: true,
      async run(session, node) {
        const tableName = (node.data as ITableModel)?.info?.tableName;
        const table = await getTableInfo(tableName, session.database.dbName, session.sessionId);
        if (table) {
          downloadPLDDL(tableName, 'TABLE', table.info?.DDL, session.database.dbName);
        }
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.MOCK_DATA,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.AnalogData',
          defaultMessage: '模拟数据',
        }), // 模拟数据
      ],

      ellipsis: true,
      disabled: (session, node) => {
        return !hasTableChangePermission(session, node);
      },
      isHide: (session) => {
        return (
          !setting.enableMockdata ||
          !getDataSourceModeConfig(session?.connection?.type)?.features?.task?.includes(
            TaskType.DATAMOCK,
          )
        );
      },
      actionType: actionTypes.update,
      hasDivider: true,
      run(session, node) {
        const tableName = (node.data as ITableModel)?.info?.tableName;
        modalStore.changeDataMockerModal(true, {
          tableName,
          databaseId: session?.database?.databaseId,
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.OPEN_TABLE_SQLWINDOW,
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.OpenTheSQLWindow',
          defaultMessage: '打开 SQL 窗口',
        }), //'打开 SQL 窗口'
      ],
      run(session, node) {
        tracert.click('a3112.b41896.c330992.d367627');
        openNewSQLPage(session?.database?.databaseId);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.COPY,
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Copy',
          defaultMessage: '复制',
        }), //复制
      ],

      children: [
        {
          key: ResourceTreeNodeMenuKeys.COPY_NAME,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.ObjectName',
              defaultMessage: '对象名',
            }), //对象名
          ],

          run(session, node) {
            const table = node.data as ITableModel;
            copyObj(
              table?.info?.tableName,
              DbObjectType.table,
              DragInsertType.NAME,
              session.sessionId,
            );
          },
        },
        {
          key: ResourceTreeNodeMenuKeys.COPY_SELECT,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.SelectStatement',
              defaultMessage: 'Select 语句',
            }),

            //SELECT 语句
          ],

          run(session, node) {
            const table = node.data as ITableModel;
            copyObj(
              table?.info?.tableName,
              DbObjectType.table,
              DragInsertType.SELECT,
              session.sessionId,
            );
          },
        },
        {
          key: ResourceTreeNodeMenuKeys.COPY_INSERT,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.InsertStatement',
              defaultMessage: 'Insert 语句',
            }),

            //INSERT 语句
          ],

          run(session, node) {
            const table = node.data as ITableModel;
            copyObj(
              table?.info?.tableName,
              DbObjectType.table,
              DragInsertType.INSERT,
              session.sessionId,
            );
          },
        },
        {
          key: ResourceTreeNodeMenuKeys.COPY_UPDATE,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.UpdateStatement',
              defaultMessage: 'Update 语句',
            }),

            //UPDATE 语句
          ],

          run(session, node) {
            const table = node.data as ITableModel;
            copyObj(
              table?.info?.tableName,
              DbObjectType.table,
              DragInsertType.UPDATE,
              session.sessionId,
            );
          },
        },
        {
          key: ResourceTreeNodeMenuKeys.COPY_DELETE,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.table.DeleteStatement',
              defaultMessage: 'Delete 语句',
            }),

            //DELETE 语句
          ],

          run(session, node) {
            const table = node.data as ITableModel;
            copyObj(
              table?.info?.tableName,
              DbObjectType.table,
              DragInsertType.DELETE,
              session.sessionId,
            );
          },
        },
      ],

      hasDivider: true,
    },
    {
      key: ResourceTreeNodeMenuKeys.DELETE_TABLE,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Delete',
          defaultMessage: '删除',
        }),
      ],

      actionType: actionTypes.delete,
      ellipsis: true,
      disabled: (session, node) => {
        return !hasTableChangePermission(session, node);
      },
      run(session, node) {
        const table = node.data as ITableModel;
        const tableName = table?.info?.tableName;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createTable.modal.delete',
              defaultMessage: '是否确定删除 {name} ？',
            },
            {
              name: tableName,
            },
          ),
          okText: formatMessage({
            id: 'app.button.ok',
            defaultMessage: '确定',
          }),
          cancelText: formatMessage({
            id: 'app.button.cancel',
            defaultMessage: '取消',
          }),
          icon: <QuestionCircleFilled />,
          centered: true,
          onOk: async () => {
            const success = await dropObject(tableName, DbObjectType.table, session.sessionId);
            if (success) {
              await session.database.getTableList();
              message.success(
                formatMessage({
                  id: 'workspace.window.createTable.modal.delete.success',
                  defaultMessage: '删除表成功',
                }),
              );
              const openedPage = pageStore!.pages.find((p) => p.params.tableName === tableName);
              if (openedPage) {
                pageStore!.close(openedPage.key);
              }
            }
          },
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.REFRESH_TABLE,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Refresh',
          defaultMessage: '刷新',
        }),
      ],

      ellipsis: true,
      async run(session, node) {
        const table = node.data as ITableModel;
        await session.database.loadTable(table.info);
      },
    },
  ],

  [ResourceNodeType.TableColumnRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_COLUMNS,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.ViewColumns',
          defaultMessage: '查看列',
        }),
      ],

      ellipsis: true,
      run(session, node) {
        const table = node.data as ITableModel;
        const tableName = table?.info?.tableName;
        openTableViewPage(tableName, TopTab.PROPS, PropsTab.COLUMN, session?.odcDatabase?.id);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.REFRESH_COLUMNS,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Refresh',
          defaultMessage: '刷新',
        }),
      ],

      ellipsis: true,
      async run(session, node) {
        const table = node.data as ITableModel;
        await session.database.loadTable(table.info);
      },
    },
  ],

  [ResourceNodeType.TableIndexRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_INDEXES,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.ViewIndexes',
          defaultMessage: '查看索引',
        }),
      ],

      ellipsis: true,
      run(session, node) {
        const table = node.data as ITableModel;
        const tableName = table?.info?.tableName;
        openTableViewPage(tableName, TopTab.PROPS, PropsTab.INDEX, session?.odcDatabase?.id);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.REFRESH_INDEXES,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Refresh',
          defaultMessage: '刷新',
        }),
      ],

      ellipsis: true,
      async run(session, node) {
        const table = node.data as ITableModel;
        await session.database.loadTable(table.info);
      },
    },
  ],

  [ResourceNodeType.TablePartitionRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_PARTITIONS,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.ViewPartitions',
          defaultMessage: '查看分区',
        }),
      ],

      ellipsis: true,
      run(session, node) {
        const table = node.data as ITableModel;
        const tableName = table?.info?.tableName;
        openTableViewPage(tableName, TopTab.PROPS, PropsTab.PARTITION, session?.odcDatabase?.id);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.REFRESH_PARTITIONS,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Refresh',
          defaultMessage: '刷新',
        }),
      ],

      ellipsis: true,
      async run(session, node) {
        const table = node.data as ITableModel;
        await session.database.loadTable(table.info);
      },
    },
  ],

  [ResourceNodeType.TableConstraintRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_CONSTRAINTS,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.ViewConstraints',
          defaultMessage: '查看约束',
        }),
      ],

      ellipsis: true,
      run(session, node) {
        const table = node.data as ITableModel;
        const tableName = table?.info?.tableName;
        openTableViewPage(tableName, TopTab.PROPS, PropsTab.CONSTRAINT, session?.odcDatabase?.id);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.REFRESH_CONSTRAINTS,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.table.Refresh',
          defaultMessage: '刷新',
        }),
      ],

      ellipsis: true,
      async run(session, node) {
        const table = node.data as ITableModel;
        await session.database.loadTable(table.info);
      },
    },
  ],
};
