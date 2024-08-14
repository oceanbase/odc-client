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
import { syncObject } from '@/common/network/database';
import { IManagerResourceType } from '@/d.ts';
import { DBObjectSyncStatus, IDatabase } from '@/d.ts/database';
import { openNewDefaultPLPage, openNewSQLPage, openOBClientPage } from '@/store/helper/page';
import login from '@/store/login';
import modal from '@/store/modal';
import setting from '@/store/setting';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { getLocalFormatDateTime } from '@/util/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const databaseMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.Database]: [
    {
      key: 'NEW_SQL',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.database.OpenTheSqlWindow',
          defaultMessage: '打开 SQL 窗口',
        }), //打开 SQL 窗口
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
        formatMessage({
          id: 'odc.TreeNodeMenu.config.database.OpenTheAnonymousBlockWindow',
          defaultMessage: '打开匿名块窗口',
        }), //打开匿名块窗口
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
        formatMessage({
          id: 'odc.TreeNodeMenu.config.database.OpenTheCommandLineWindow',
          defaultMessage: '打开命令行窗口',
        }), //打开命令行窗口
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
          defaultMessage: '数据导出',
        }) /*'数据导出'*/,
      ],

      ellipsis: true,
      children: [
        {
          key: 'TASK_EXPORT',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.0A419755',
              defaultMessage: '导出',
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
              defaultMessage: '导出结果集',
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
          defaultMessage: '数据研发',
        }) /*'数据研发'*/,
      ],

      ellipsis: true,
      children: [
        {
          key: 'TASK_IMPORT',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.2CFE4C42',
              defaultMessage: '导入',
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
              defaultMessage: '模拟数据',
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
              defaultMessage: '数据库变更',
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
              defaultMessage: '无锁结构变更',
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
              defaultMessage: '影子表同步',
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
              defaultMessage: '结构比对',
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
          defaultMessage: '定时任务',
        }) /*'定时任务'*/,
      ],

      ellipsis: true,
      hasDivider:
        setting.configurations['odc.database.default.enableGlobalObjectSearch'] === 'true',
      isHide(_, node) {
        return isClient();
      },
      children: [
        {
          key: 'TASK_SQL_PLAN',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.82D835BA',
              defaultMessage: 'SQL 计划',
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
              defaultMessage: '分区计划',
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
              defaultMessage: '数据归档',
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
              defaultMessage: '数据清理',
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
    {
      key: 'SYNC_METADATA',
      text: (node) => {
        const database: IDatabase = node.data;
        if (database.objectSyncStatus === DBObjectSyncStatus.SYNCING) {
          return (
            <>
              <LoadingOutlined style={{ color: 'var(--odc-color1-color)' }} />
              <span style={{ paddingLeft: 4 }}>
                {formatMessage({
                  id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.A32BC9F9',
                  defaultMessage: '元数据同步中，请等待…',
                })}
              </span>
            </>
          );
        }
        return formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.8485C0D3',
          defaultMessage: '元数据同步',
        });
      },
      subText: (node) => {
        const database: IDatabase = node.data;
        if (!database.objectLastSyncTime) return;
        return (
          <div style={{ fontSize: 12, color: 'var(--text-color-hint)' }}>
            {formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.1599957C',
              defaultMessage: '上次同步时间:',
            })}
            {getLocalFormatDateTime(database?.objectLastSyncTime)}
          </div>
        );
      },
      ellipsis: true,
      isHide(_, node) {
        return setting.configurations['odc.database.default.enableGlobalObjectSearch'] === 'false';
      },
      run(session, node, databaseFrom, pollingDatabase) {
        const database: IDatabase = node.data;
        message.loading({
          content: formatMessage({
            id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.A32BC9F9',
            defaultMessage: '元数据同步中，请等待…',
          }),
          duration: 1,
        });
        syncObject(IManagerResourceType.database, database?.id).then((res) => {
          if (res) {
            pollingDatabase();
          }
        });
      },
    },
  ],
};
