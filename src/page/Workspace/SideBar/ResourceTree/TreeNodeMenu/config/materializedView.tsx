import { actionTypes } from '@/component/Acess';
import { copyObj } from '@/component/TemplateInsertModal';
import { DbObjectType, DragInsertType, IView, ResourceTreeNodeMenuKeys } from '@/d.ts';
import { PropsTab, TopTab } from '@/page/Workspace/components/MaterializedViewPage';
import { message, Modal } from 'antd';
import { openNewSQLPage } from '@/store/helper/page';
import tracert from '@/util/tracert';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/database/sqlExport';
import {
  PlusOutlined,
  QuestionCircleFilled,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ResourceNodeType } from '../../type';
import { hasTableChangePermission, hasTableExportPermission } from '../index';
import { IMenuItemConfig } from '../type';
import { isSupportExport } from './helper';
import { openGlobalSearch } from '../../const';
import { openMaterializedViewViewPage, openCreateMaterializedViewPage } from '@/store/helper/page';
import { getMaterializedView } from '@/common/network/materializedView/index';
import modalStore from '@/store/modal';
import { dropObject } from '@/common/network/database';
import pageStore from '@/store/page';

export const materializedViewConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.MaterializedViewRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_MATERIALIZED_VIEW,
      icon: PlusOutlined,
      text: formatMessage({
        id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.956E7805',
        defaultMessage: '新建物化视图',
      }),
      actionType: actionTypes.create,
      run(session, node) {
        openCreateMaterializedViewPage(session?.odcDatabase?.id);
      },
    },
    {
      key: 'GLOBAL_SEARCH',
      text: [
        formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.B034F159',
          defaultMessage: '全局搜索',
        }),
      ],
      icon: SearchOutlined,
      actionType: actionTypes.read,
      run(session, node) {
        openGlobalSearch(node);
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh', defaultMessage: '刷新' }), //刷新
      ],
      icon: ReloadOutlined,
      actionType: actionTypes.read,
      async run(session, node) {
        await session.database.getMaterializedViewList();
      },
    },
  ],

  [ResourceNodeType.MaterializedView]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      text: formatMessage({
        id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.CDD2E445',
        defaultMessage: '查看物化视图属性',
      }),
      ellipsis: true,
      run(session, node) {
        openMaterializedViewViewPage(
          node?.data?.info?.name,
          TopTab.PROPS,
          PropsTab.DDL,
          session?.odcDatabase?.id,
          session?.odcDatabase?.name,
        );
      },
    },
    {
      key: 'GLOBAL_SEARCH',
      text: [
        formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.B034F159',
          defaultMessage: '全局搜索',
        }),
      ],
      icon: SearchOutlined,
      actionType: actionTypes.read,
      run(session, node) {
        openGlobalSearch(node);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_DATA,
      text: formatMessage({
        id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.BDEC9A66',
        defaultMessage: '查看物化视图数据',
      }),
      ellipsis: true,
      hasDivider: true,
      run(session, node) {
        openMaterializedViewViewPage(
          node?.data?.info?.name,
          TopTab.DATA,
          PropsTab.DDL,
          session?.odcDatabase?.id,
          session?.odcDatabase?.name,
        );
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.view.Download', defaultMessage: '下载' }), //下载
      ellipsis: true,
      async run(session, node) {
        const materializedViewName = node?.data?.info?.name;
        const materializedView = await getMaterializedView({
          sessionId: session.sessionId,
          dbName: session.database.dbName,
          materializedViewName,
        });
        if (materializedView) {
          downloadPLDDL(
            materializedViewName,
            'TABLE',
            materializedView?.info?.ddl,
            session.database.dbName,
          );
        }
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.COPY,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.view.Copy', defaultMessage: '复制' }), //复制
      ],
      ellipsis: true,
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
            const materializedViewName = node?.data?.info?.name;
            copyObj(
              materializedViewName,
              DbObjectType.materialized_view,
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
          ],

          run(session, node) {
            const materializedViewName = node?.data?.info?.name;
            copyObj(
              materializedViewName,
              DbObjectType.materialized_view,
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
            const materializedViewName = node?.data?.info?.name;
            copyObj(
              materializedViewName,
              DbObjectType.materialized_view,
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
            const materializedViewName = node?.data?.info?.name;
            copyObj(
              materializedViewName,
              DbObjectType.materialized_view,
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
            const materializedViewName = node?.data?.info?.name;
            copyObj(
              materializedViewName,
              DbObjectType.materialized_view,
              DragInsertType.DELETE,
              session.sessionId,
            );
          },
        },
      ],
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
      hasDivider: true,
      run(session, node) {
        tracert.click('a3112.b41896.c330992.d367627');
        openNewSQLPage(session?.database?.databaseId);
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DELETE_TABLE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.view.Delete', defaultMessage: '删除' })],
      ellipsis: true,
      actionType: actionTypes.delete,
      disabled: (session, node) => {
        return !hasTableChangePermission(session, node);
      },
      async run(session, node) {
        const materializedViewName = node?.data?.info?.name;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createTable.modal.delete',
              defaultMessage: '是否确定删除 {name} ？',
            },
            {
              name: materializedViewName,
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
            const materializedViewName = node?.data?.info?.name;
            const success = await dropObject(
              materializedViewName,
              DbObjectType.materialized_view,
              session.sessionId,
            );
            if (success) {
              await session.database.getMaterializedViewList();
              message.success(
                formatMessage({
                  id: 'src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.C87931E7',
                  defaultMessage: '删除物化视图成功',
                }),
              );
              const openedPage = pageStore!.pages.find(
                (p) => p.params.materializedViewName === materializedViewName,
              );
              if (openedPage) {
                pageStore!.close(openedPage.key);
              }
            }
          },
        });
      },
    },
  ],

  [ResourceNodeType.MaterializedViewColumnRoot]: [
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
        const materializedViewName = node?.data?.info?.name;
        openMaterializedViewViewPage(
          materializedViewName,
          TopTab.PROPS,
          PropsTab.COLUMN,
          session?.odcDatabase?.id,
          session?.odcDatabase?.name,
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
        const materializedViewInfo = node?.data?.info;
        await session.database.loadMaterializedView(materializedViewInfo);
      },
    },
  ],

  [ResourceNodeType.MaterializedViewIndexRoot]: [
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
        const materializedViewName = node?.data?.info?.name;
        openMaterializedViewViewPage(
          materializedViewName,
          TopTab.PROPS,
          PropsTab.INDEX,
          session?.odcDatabase?.id,
          session?.odcDatabase?.name,
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
        const materializedViewInfo = node?.data?.info;
        await session.database.loadMaterializedView(materializedViewInfo);
      },
    },
  ],

  [ResourceNodeType.MaterializedViewPartitionRoot]: [
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
        const materializedViewName = node?.data?.info?.name;
        openMaterializedViewViewPage(
          materializedViewName,
          TopTab.PROPS,
          PropsTab.PARTITION,
          session?.odcDatabase?.id,
          session?.odcDatabase?.name,
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
        const materializedViewInfo = node?.data?.info;
        await session.database.loadMaterializedView(materializedViewInfo);
      },
    },
  ],

  [ResourceNodeType.MaterializedViewConstraintRoot]: [
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
        const materializedViewName = node?.data?.info?.name;
        openMaterializedViewViewPage(
          materializedViewName,
          TopTab.PROPS,
          PropsTab.CONSTRAINT,
          session?.odcDatabase?.id,
          session?.odcDatabase?.name,
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
        const materializedViewInfo = node?.data?.info;
        await session.database.loadMaterializedView(materializedViewInfo);
      },
    },
  ],
};
