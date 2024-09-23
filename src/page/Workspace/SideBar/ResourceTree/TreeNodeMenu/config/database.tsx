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
import { IManagerResourceType, TaskPageType, TaskType } from '@/d.ts';
import { DatabasePermissionType, DBObjectSyncStatus, IDatabase } from '@/d.ts/database';
import { openNewDefaultPLPage, openNewSQLPage, openOBClientPage } from '@/store/helper/page';
import { default as login, default as userStore } from '@/store/login';
import modal from '@/store/modal';
import setting from '@/store/setting';
import { isLogicalDatabase } from '@/util/database';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { getLocalFormatDateTime } from '@/util/utils';
import { LoadingOutlined } from '@ant-design/icons';
import { message, Tooltip, Typography } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

const { Text } = Typography;

const isPrivateSpace = userStore?.isPrivateSpace();

/**
 * 菜单展示权限包裹方法
 * @param needPermissionTypeList 需要的权限点
 * @param permissionList 当前权限点
 * @param menuNode 当前菜单名称
 */
export const menuAccessWrap = (
  needPermissionTypeList: DatabasePermissionType[],
  permissionList: DatabasePermissionType[],
  menuNode: React.ReactNode,
) => {
  /* 不需要权限控制 */
  if (!needPermissionTypeList?.length) {
    return menuNode;
  }
  /* 需要的每一个权限点都存在于当前拥有的权限中 */
  if (needPermissionTypeList.every((element) => permissionList.includes(element))) {
    return menuNode;
  }
  return (
    <Tooltip
      title={formatMessage({
        id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.3B3090CC',
        defaultMessage: '暂无权限',
      })}
      placement="right"
    >
      <Text type="secondary" onClick={(e) => e.stopPropagation()}>
        <div style={{ width: '100%' }}>{menuNode}</div>
      </Text>
    </Tooltip>
  );
};

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
      isHide: (_, node) => {
        return isLogicalDatabase(node?.data);
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
        return (
          !getDataSourceModeConfig(database?.dataSource?.type)?.features?.anonymousBlock ||
          isLogicalDatabase(database)
        );
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
        return !login.isPrivateSpace() || !setting.enableOBClient || isLogicalDatabase(node.data);
      },
      ellipsis: true,
      run(session, node) {
        const database: IDatabase = node.data;
        openOBClientPage(database?.dataSource?.id, database?.id) || isLogicalDatabase(database);
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
      isHide(_, node) {
        const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
        return (
          isLogicalDatabase(node.data) ||
          config?.features?.task?.every(
            (i) => ![TaskType.EXPORT, TaskType.EXPORT_RESULT_SET]?.includes(i),
          )
        );
      },
      children: [
        {
          key: 'TASK_EXPORT',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.0A419755',
              defaultMessage: '导出',
            }) /*'导出'*/,
          ],

          needAccessTypeList: [DatabasePermissionType.EXPORT],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return !setting.enableDBExport || !config?.features?.task?.includes(TaskType.EXPORT);
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

          needAccessTypeList: [DatabasePermissionType.EXPORT],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              !setting.enableDBExport ||
              !config?.features?.task?.includes(TaskType.EXPORT_RESULT_SET)
            );
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              !setting.enableDBImport ||
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.IMPORT)
            );
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              !setting.enableMockdata ||
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.DATAMOCK)
            );
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              !setting.enableAsyncTask ||
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.ASYNC)
            );
          },
          run(session, node, databaseFrom) {
            const database: IDatabase = node.data;
            modal.changeCreateAsyncTaskModal(true, {
              databaseId: database?.id,
            });
          },
        },
        {
          key: 'MULTIPLE_ASYNC',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.C0230CDC',
              defaultMessage: '多库变更',
            }),
          ],
          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.MULTIPLE_ASYNC)
            );
          },
          run(session, node) {
            const database: IDatabase = node.data;
            modal.changeMultiDatabaseChangeModal(true, {
              projectId: database?.project?.id,
              orderedDatabaseIds: [[database?.id]],
            });
          },
        },
        {
          key: 'TASK_ASYNC',
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.11F98E6B',
              defaultMessage: '逻辑库变更',
            }),
          ],
          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            return !isLogicalDatabase(node.data);
          },
          run(session, node, databaseFrom) {
            modal.changeLogicialDatabaseModal(true, {
              projectId: node?.data?.odcDatabase?.project?.id,
              databaseId: node?.data?.id,
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              !setting.enableOSC ||
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.ONLINE_SCHEMA_CHANGE)
            );
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

          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              isLogicalDatabase(node.data) || !config?.features?.task?.includes(TaskType.SHADOW)
            );
          },

          needAccessTypeList: [DatabasePermissionType.CHANGE],
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.STRUCTURE_COMPARISON)
            );
          },
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
      hasDivider(node) {
        return (
          setting.configurations['odc.database.default.enableGlobalObjectSearch'] === 'true' &&
          !isLogicalDatabase(node?.data) &&
          (isClient() || isPrivateSpace)
        );
      },
      isHide(_, node) {
        return isClient() || isLogicalDatabase(node?.data);
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              isClient() ||
              isLogicalDatabase(node?.data) ||
              !config?.features?.task?.includes(TaskType.SQL_PLAN)
            );
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              isClient() ||
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.PARTITION_PLAN)
            );
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              isClient() ||
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.DATA_ARCHIVE)
            );
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

          needAccessTypeList: [DatabasePermissionType.CHANGE],
          ellipsis: true,
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              isClient() ||
              isLogicalDatabase(node.data) ||
              !config?.features?.task?.includes(TaskType.DATA_DELETE)
            );
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
      key: 'APPLY_DATABASE_PERMISSION_MENU',
      text: [
        formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.628998D2',
          defaultMessage: '权限申请',
        }),
      ],
      ellipsis: true,
      hasDivider:
        setting.configurations['odc.database.default.enableGlobalObjectSearch'] === 'true',
      isHide(_, node) {
        return isClient() || isPrivateSpace || isLogicalDatabase(node.data);
      },
      children: [
        {
          key: TaskPageType.APPLY_DATABASE_PERMISSION,
          text: [
            formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.B508546B',
              defaultMessage: '申请库权限',
            }),
          ],
          ellipsis: true,
          run(session, node) {
            const database: IDatabase = node.data;
            modal.changeApplyDatabasePermissionModal(true, {
              projectId: database?.project?.id,
              databaseId: database?.id,
            });
          },
          isHide(_, node) {
            const config = getDataSourceModeConfig(node?.data?.dataSource?.type);
            return (
              isClient() ||
              isPrivateSpace ||
              !config?.features?.task?.includes(TaskType.APPLY_DATABASE_PERMISSION)
            );
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
        return (
          setting.configurations['odc.database.default.enableGlobalObjectSearch'] === 'false' ||
          isLogicalDatabase(node.data)
        );
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
