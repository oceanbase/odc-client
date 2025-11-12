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
import { getProcedureByProName } from '@/common/network';
import { dropObject } from '@/common/network/database';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { DbObjectType, IProcedure, PageType } from '@/d.ts';
import { PropsTab, TopTab } from '@/page/Workspace/components/ProcedurePage';
import {
  openBatchCompilePLPage,
  openProcedureEditPageByProName,
  openProcedureViewPage,
} from '@/store/helper/page';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import { ReactComponent as BatchCompileSvg } from '@/svgr/batch-compile-all.svg';
import { triggerActionAfterPLPageCreated } from '@/util/events';
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
import { hasChangePermission, hasExportPermission } from '../index';
import { IMenuItemConfig } from '../type';
import { isSupportExport, isSupportPLEdit } from './helper';
import { openGlobalSearch } from '../../const';

export const procedureMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.ProcedureRoot]: [
    {
      key: 'BATCH_COMPILE',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.procedure.BatchCompilation',
          defaultMessage: '批量编译',
        }), //批量编译
      ],
      actionType: actionTypes.create,
      icon: BatchCompileSvg,
      isHide(session, node) {
        return !getDataSourceModeConfig(session?.connection?.type)?.features?.compile;
      },
      run(session, node) {
        openBatchCompilePLPage(
          PageType.BATCH_COMPILE_PROCEDURE,
          DbObjectType.procedure,
          formatMessage({
            id: 'odc.components.ResourceTree.StoredProcedure',
            defaultMessage: '存储过程',
          }),
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'CREATE',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.procedure.CreateAStoredProcedure',
          defaultMessage: '新建存储过程',
        }), //新建存储过程
      ],
      icon: PlusOutlined,
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateProcedureModalVisible(
          true,
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
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh', defaultMessage: '刷新' }), //刷新
      ],
      icon: ReloadOutlined,
      actionType: actionTypes.read,
      async run(session, node) {
        await session.database.getProcedureList();
      },
    },
  ],

  [ResourceNodeType.Procedure]: [
    {
      key: 'OVERVIEW',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.See',
          defaultMessage: '查看',
        }),
      ],

      ellipsis: true,
      run(session, node) {
        const proc: IProcedure = node.data;
        openProcedureViewPage(
          proc?.proName,
          TopTab.PROPS,
          PropsTab.DDL,
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
      key: 'EDIT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing', defaultMessage: '编辑' }), //编辑
      ],
      ellipsis: true,
      actionType: actionTypes.update,
      async run(session, node) {
        const proc: IProcedure = node.data;
        await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
      },
    },
    {
      key: 'COMPILE',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Compile', defaultMessage: '编译' }), //编译
      ],
      ellipsis: true,
      isHide(session, node) {
        return !getDataSourceModeConfig(session?.connection?.type)?.features?.compile;
      },
      async run(session, node) {
        const proc: IProcedure = node.data;
        const { plPage, isNew } = await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
        triggerActionAfterPLPageCreated(plPage, 'compile', isNew);
      },
    },
    {
      key: 'DEBUG',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Debugging',
          defaultMessage: '调试',
        }),
      ],

      isHide(session, node) {
        return !session?.supportFeature?.enablePLDebug;
      },
      ellipsis: true,
      async run(session, node) {
        const proc: IProcedure = node.data;
        if (proc.status === 'INVALID') {
          message.info(
            formatMessage({
              id: 'odc.ResourceTree.config.treeNodesActions.InvalidObjectDebuggingIsNot',
              defaultMessage: '无效对象，不支持调试',
            }),
          );

          return;
        }
        const { plPage, isNew } = await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );

        triggerActionAfterPLPageCreated(plPage, 'debug', isNew);
      },
    },
    {
      key: 'RUN',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Run',
          defaultMessage: '运行',
        }),
      ],

      isHide(session, node) {
        return !getDataSourceModeConfig(session?.connection?.type)?.features?.plRun;
      },
      ellipsis: true,
      actionType: actionTypes.update,
      hasDivider: true,

      async run(session, node) {
        const proc: IProcedure = node.data;
        const { plPage, isNew } = await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
        if (!plPage) {
          return;
        }
        triggerActionAfterPLPageCreated(plPage, 'run', isNew);
      },
    },

    {
      key: 'EXPORT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Export', defaultMessage: '导出' }), //导出
      ],
      ellipsis: true,
      disabled: (session) => {
        return !hasExportPermission(session);
      },
      isHide: (session) => {
        return !isSupportExport(session);
      },
      run(session, node) {
        const proc: IProcedure = node.data;
        modal.changeExportModal(true, {
          type: DbObjectType.procedure,
          name: proc.proName,
          databaseId: session?.database.databaseId,
        });
      },
    },
    {
      key: 'DOWNLOAD',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download', defaultMessage: '下载' }), //下载
      ],
      ellipsis: true,
      hasDivider: true,
      async run(session, node) {
        const proc: IProcedure = node.data;
        const obj = await getProcedureByProName(
          proc?.proName,
          false,
          session?.sessionId,
          session?.database?.dbName,
        );
        const ddl = obj?.ddl;
        if (ddl) {
          downloadPLDDL(proc?.proName, PLType.PROCEDURE, ddl, session?.database?.dbName);
        }
      },
    },

    {
      key: 'DELETE',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Delete', defaultMessage: '删除' }), //删除
      ],
      ellipsis: true,
      actionType: actionTypes.delete,
      disabled: (session) => {
        return !hasChangePermission(session);
      },
      run(session, node) {
        const proc: IProcedure = node.data;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createFunction.modal.delete',
              defaultMessage: '是否确定删除函数 {name} ？',
            },

            {
              name: proc?.proName,
            },
          ),
          okText: formatMessage({ id: 'app.button.ok', defaultMessage: '确定' }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
            defaultMessage: '取消',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            const isSuccess = await dropObject(
              proc?.proName,
              DbObjectType.procedure,
              session?.sessionId,
            );
            await session.database.getProcedureList();

            message.success(
              formatMessage({
                id: 'workspace.window.createProcedure.modal.delete.success',
                defaultMessage: '删除存储过程成功',
              }),
            );

            const openedPages = pageStore?.pages.filter(
              (p) =>
                p.title === proc?.proName &&
                (p.type == PageType.PROCEDURE || p.type == PageType.PL),
            );

            if (openedPages?.length) {
              for (let page of openedPages) {
                await pageStore.close(page.key);
              }
            }
          },
        });
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh', defaultMessage: '刷新' }), //刷新
      ],
      ellipsis: true,
      actionType: actionTypes.create,
      async run(session, node) {
        await session.database.getProcedureList();
      },
    },
  ],
};
