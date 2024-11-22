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

import { getDataSourceModeConfig } from '@/common/datasource';
import { dropObject } from '@/common/network/database';
import { getTableInfo, syncExternalTableFiles } from '@/common/network/table';
import { actionTypes } from '@/component/Acess';
import { copyObj } from '@/component/TemplateInsertModal';
import { DbObjectType, DragInsertType, ResourceTreeNodeMenuKeys, TaskType } from '@/d.ts';
import { ITableModel } from '@/page/Workspace/components/CreateTable/interface';
import { PropsTab, TopTab } from '@/page/Workspace/components/TablePage';
import {
  openExternalTableTableViewPage,
  openCreateTablePage,
  openNewSQLPage,
  openTableViewPage,
} from '@/store/helper/page';
import modalStore from '@/store/modal';
import pageStore from '@/store/page';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import tracert from '@/util/tracert';
import { PlusOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { hasTableChangePermission, hasTableExportPermission } from '../index';
import { IMenuItemConfig } from '../type';
import { isSupportExport } from './helper';
import { isLogicalDatabase } from '@/util/database';
import { DatabasePermissionType } from '@/d.ts/database';
import { ReactComponent as RefreshSvg } from '@/svgr/refresh.svg';
import request from '@/util/request';
import DatabaseStore from '@/store/sessionManager/database';

export const externalTableMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.ExternalTableRoot]: [
    {
      key: 'REFRESH',
      text: '刷新',
      icon: RefreshSvg,
      actionType: actionTypes.read,
      async run(session, node) {
        if (isLogicalDatabase(session?.odcDatabase)) {
          await session.database.getLogicTableList();
          return;
        }
        await session.database.getTableList(true);
        message.success('刷新成功');
      },
    },
  ],
  [ResourceNodeType.ExternalTable]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      ellipsis: true,
      text: '查看外表结构',

      run(session, node) {
        openExternalTableTableViewPage(
          (node.data as ITableModel)?.info?.tableName,
          TopTab.PROPS,
          PropsTab.DDL,
          session?.odcDatabase?.id,
          node?.data?.info?.tableId,
        );
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_DATA,
      text: '查看外表数据',
      ellipsis: true,
      isHide: (session) => {
        return isLogicalDatabase(session?.odcDatabase);
      },
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
        openExternalTableTableViewPage(
          tableName,
          TopTab.DATA,
          propsTab,
          session?.odcDatabase?.id,
          node?.data?.info?.tableId,
        );
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.EXTERNAL_TABLE_SYNCHRONIZATION_TABLE,
      text: '同步外表文件',
      ellipsis: true,
      hasDivider: true,
      isHide: (session) => {
        return isLogicalDatabase(session?.odcDatabase);
      },
      async run(session, node) {
        const tableName = (node.data as ITableModel)?.info?.tableName;
        const res = await syncExternalTableFiles(
          session.sessionId,
          session.database.dbName,
          tableName,
        );
        if (res) {
          message.success('同步成功');
        } else {
          message.error('同步失败，请稍后再试');
        }
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
      isHide: (session) => {
        return isLogicalDatabase(session?.odcDatabase);
      },
      async run(session, node) {
        const tableName = (node.data as ITableModel)?.info?.tableName;
        const table = await getTableInfo(
          tableName,
          session.database.dbName,
          session.sessionId,
          true,
        );
        if (table) {
          downloadPLDDL(tableName, 'TABLE', table.info?.DDL, session.database.dbName);
        }
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
      isHide: (session) => {
        return isLogicalDatabase(session?.odcDatabase);
      },
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
          isHide: (session) => {
            return isLogicalDatabase(session?.odcDatabase);
          },
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
              await session.database.getTableList(true);
              message.success(
                formatMessage({
                  id: 'workspace.window.createTable.modal.delete.success',
                  defaultMessage: '删除外表成功',
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
        await session.database.loadTable(table.info, true);
      },
    },
  ],

  [ResourceNodeType.ExternalTableColumnRoot]: [
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
        openExternalTableTableViewPage(
          tableName,
          TopTab.PROPS,
          PropsTab.COLUMN,
          session?.odcDatabase?.id,
          node?.data?.info?.tableId,
        );
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
        await session.database.loadTable(table.info, true);
      },
    },
  ],
};
