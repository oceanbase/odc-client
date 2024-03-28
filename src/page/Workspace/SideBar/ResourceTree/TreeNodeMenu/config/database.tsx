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

import { ConnectionMode } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { openNewDefaultPLPage, openNewSQLPage, openOBClientPage } from '@/store/helper/page';
import login from '@/store/login';
import setting from '@/store/setting';
import modal from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { isClient } from '@/util/env';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';
import tracert from '@/util/tracert';
import { getDataSourceModeConfig } from '@/common/datasource';

export const databaseMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.Database]: [
    {
      key: 'NEW_SQL',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.database.OpenTheSqlWindow' }), //打开 SQL 窗口
      ],
      ellipsis: true,
      run(session, node, databaseFrom) {
        const database: IDatabase = node.data;
        tracert.click('a3112.b41896.c330992.d367627');
        openNewSQLPage(node.cid, databaseFrom);
      },
    },
    {
      key: 'NEW_PL',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.database.OpenTheAnonymousBlockWindow' }), //打开匿名块窗口
      ],
      isHide(_, node) {
        const database: IDatabase = node.data;
        return !getDataSourceModeConfig(database?.dataSource?.type)?.features?.anonymousBlock;
      },
      ellipsis: true,
      run(session, node, databaseFrom) {
        const database: IDatabase = node.data;
        openNewDefaultPLPage(null, node.cid, database?.name, databaseFrom);
      },
    },
    {
      key: 'NEW_OBCLIENT',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.database.OpenTheCommandLineWindow' }), //打开命令行窗口
      ],
      isHide(_, node) {
        return !login.isPrivateSpace() || !setting.enableOBClient;
      },
      ellipsis: true,
      run(session, node) {
        const database: IDatabase = node.data;
        openOBClientPage(database?.dataSource?.id, database?.id);
      },
    },
    {
      key: 'TASK_EXPORT_MENU',
      text: [
        formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.503FF376',
        }) /*'数据导出'*/,
      ],
      ellipsis: true,
      children: [
        {
          key: 'TASK_EXPORT',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.0A419755',
            }) /*'导出'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return !setting.enableDBExport;
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeExportModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_EXPORT_RESULT_SET',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.42C44540',
            }) /*'导出结果集'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return !setting.enableDBExport;
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeCreateResultSetExportTaskModal(true, {
              databaseId: database?.id,
            });
          },
        },
      ],
    },
    {
      key: 'TASK_DATA_DEVELOP',
      text: [
        formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.9552E3A1',
        }) /*'数据研发'*/,
      ],
      ellipsis: true,
      children: [
        {
          key: 'TASK_IMPORT',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.2CFE4C42',
            }) /*'导入'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return !setting.enableDBImport;
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeImportModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_MOCKDATA',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.59BFC33A',
            }) /*'模拟数据'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return !setting.enableMockdata;
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeDataMockerModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_ASYNC',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.E6CFD4DD',
            }) /*'数据库变更'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return !setting.enableAsyncTask;
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeCreateAsyncTaskModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_ONLINE_SCHEMA_CHANGE',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.6844939F',
            }) /*'无锁结构变更'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return !setting.enableOSC;
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeCreateDDLAlterTaskModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_SHADOW',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.1ACCD0B1',
            }) /*'影子表同步'*/,
          ],
          ellipsis: true,
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeShadowSyncVisible(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_STRUCTURE_COMPARISON',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.3DDBBFA6',
            }) /*'结构比对'*/,
          ],
          ellipsis: true,
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeStructureComparisonModal(true, {
              databaseId: database?.id,
            });
          },
        },
      ],
    },
    {
      key: 'TASK_CYCLE_MENU',
      text: [
        formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.36AA3D8E',
        }) /*'定时任务'*/,
      ],
      ellipsis: true,
      children: [
        {
          key: 'TASK_SQL_PLAN',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.82D835BA',
            }) /*'SQL 计划'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return isClient();
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeCreateSQLPlanTaskModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_PARTITION_PLAN',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.481C5DF5',
            }) /*'分区计划'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return isClient();
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changePartitionModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_DATA_ARCHIVE',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.983B20EC',
            }) /*'数据归档'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return isClient();
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeDataArchiveModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'TASK_DATA_DELETE',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.51FA0E16',
            }) /*'数据清理'*/,
          ],
          ellipsis: true,
          isHide(_, node) {
            return isClient();
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeDataClearModal(true, {
              databaseId: database?.id,
            });
          },
        },
      ],
    },
  ],
};
