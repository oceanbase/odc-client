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
import { getView } from '@/common/network/view';
import { actionTypes } from '@/component/Acess';
import { copyObj } from '@/component/TemplateInsertModal';
import { DbObjectType, DragInsertType, IView, ResourceTreeNodeMenuKeys } from '@/d.ts';
import { PropsTab, TopTab } from '@/page/Workspace/components/ViewPage';
import { openCreateViewPage, openViewViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import page from '@/store/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import {
  PlusOutlined,
  QuestionCircleFilled,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { hasTableChangePermission, hasTableExportPermission } from '../index';
import { IMenuItemConfig } from '../type';
import { isSupportExport } from './helper';
import { openGlobalSearch } from '../../const';

export const viewMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.ViewRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_VIEW,
      icon: PlusOutlined,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.view.CreateAView',
          defaultMessage: '新建视图',
        }),
      ],
      actionType: actionTypes.create,
      run(session, node) {
        openCreateViewPage(session?.odcDatabase?.id);
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
        await session.database.getViewList();
      },
    },
  ],

  [ResourceNodeType.View]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.view.ViewViewProperties',
          defaultMessage: '查看视图属性',
        }),
      ],
      ellipsis: true,
      run(session, node) {
        const view = node.data as IView;
        openViewViewPage(
          view.viewName,
          TopTab.PROPS,
          PropsTab.INFO,
          session?.odcDatabase?.id,
          session?.database?.dbName,
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
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.view.ViewViewData',
          defaultMessage: '查看视图数据',
        }),
      ],
      ellipsis: true,
      hasDivider: true,
      run(session, node) {
        const view = node.data as IView;
        openViewViewPage(
          view.viewName,
          TopTab.DATA,
          PropsTab.INFO,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.EXPORT_TABLE,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.view.Export', defaultMessage: '导出' }), //导出
      ellipsis: true,
      disabled: (session, node) => {
        return !hasTableExportPermission(session, node);
      },
      isHide: (session) => {
        return !isSupportExport(session);
      },
      run(session, node) {
        const view = node.data as IView;
        modal.changeExportModal(true, {
          type: DbObjectType.view,
          name: view.viewName,
          databaseId: session?.database.databaseId,
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.view.Download', defaultMessage: '下载' }), //下载
      ellipsis: true,
      async run(session, node) {
        const view = node.data as IView;
        const viewObj = await getView(view.viewName, session.sessionId, session.database?.dbName);
        if (viewObj) {
          downloadPLDDL(view.viewName, 'VIEW', viewObj.ddl, session?.database?.dbName);
        }
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.COPY,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.view.Copy', defaultMessage: '复制' }), //复制
      ],
      ellipsis: true,
      hasDivider: true,
      children: [
        {
          key: ResourceTreeNodeMenuKeys.COPY_NAME,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.ObjectName',
              defaultMessage: '对象名',
            }), //对象名
          ],
          async run(session, node) {
            const view = node.data as IView;
            copyObj(view?.viewName, DbObjectType.view, DragInsertType.NAME, session.sessionId);
          },
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_SELECT,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.SelectStatement',
              defaultMessage: 'Select 语句',
            }),

            //SELECT 语句
          ],
          async run(session, node) {
            const view = node.data as IView;
            copyObj(view?.viewName, DbObjectType.view, DragInsertType.SELECT, session.sessionId);
          },
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_INSERT,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.InsertStatement',
              defaultMessage: 'Insert 语句',
            }),

            //INSERT 语句
          ],
          async run(session, node) {
            const view = node.data as IView;
            copyObj(view?.viewName, DbObjectType.view, DragInsertType.INSERT, session.sessionId);
          },
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_UPDATE,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.UpdateStatement',
              defaultMessage: 'Update 语句',
            }),

            //UPDATE 语句
          ],
          async run(session, node) {
            const view = node.data as IView;
            copyObj(view?.viewName, DbObjectType.view, DragInsertType.UPDATE, session.sessionId);
          },
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_DELETE,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.DeleteStatement',
              defaultMessage: 'Delete 语句',
            }),

            //DELETE 语句
          ],
          async run(session, node) {
            const view = node.data as IView;
            copyObj(view?.viewName, DbObjectType.view, DragInsertType.DELETE, session.sessionId);
          },
        },
      ],
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_TABLE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.view.Delete', defaultMessage: '删除' })],
      ellipsis: true,
      actionType: actionTypes.delete,
      disabled: (session, node) => {
        return !hasTableChangePermission(session, node);
      },
      run(session, node) {
        const view = node.data as IView;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createView.model.delete',
              defaultMessage: '是否确定删除视图 {name} ？',
            },
            { name: view.viewName },
          ),
          okText: formatMessage({ id: 'app.button.ok', defaultMessage: '确定' }),
          cancelText: formatMessage({ id: 'app.button.cancel', defaultMessage: '取消' }),
          icon: <QuestionCircleFilled />,
          centered: true,
          onOk: async () => {
            const isSuccess = await dropObject(view.viewName, DbObjectType.view, session.sessionId);
            if (!isSuccess) {
              return;
            }
            await session.database.getViewList();
            message.success(
              formatMessage({
                id: 'odc.components.ResourceTree.ViewTree.TheViewHasBeenDeleted',
                defaultMessage: '删除视图成功',
              }),
            );

            // TODO：如果当前有视图详情页面，需要关闭
            const openedPage = page!.pages.find((p) => p.params.viewName === view.viewName);
            if (openedPage) {
              page!.close(openedPage.key);
            }
          },
        });
      },
    },
  ],
};
