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
import { getFunctionByFuncName } from '@/common/network';
import { dropObject } from '@/common/network/database';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { DbObjectType, IFunction, PageType } from '@/d.ts';
import { PropsTab, TopTab } from '@/page/Workspace/components/FunctionPage';
import {
  openBatchCompilePLPage,
  openFunctionEditPageByFuncName,
  openFunctionViewPage,
} from '@/store/helper/page';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import { ReactComponent as BatchCompileSvg } from '@/svgr/batch-compile-all.svg';
import { triggerActionAfterPLPageCreated } from '@/util/events';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { PlusOutlined, QuestionCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { hasChangePermission, hasExportPermission } from '../index';
import { IMenuItemConfig } from '../type';
import { isSupportExport, isSupportPLEdit } from './helper';

export const functionMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.FunctionRoot]: [
    {
      key: 'BATCH_COMPILE',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.function.BatchCompilation',
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
          PageType.BATCH_COMPILE_FUNCTION,
          DbObjectType.function,
          formatMessage({ id: 'odc.components.ResourceTree.Function', defaultMessage: '函数' }),
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'CREATE',
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.function.CreateAFunction',
          defaultMessage: '新建函数',
        }), //新建函数
      ],
      icon: PlusOutlined,
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateFunctionModalVisible(
          true,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
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
        await session.database.getFunctionList();
      },
    },
  ],

  [ResourceNodeType.Function]: [
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
        const func: IFunction = node.data;
        openFunctionViewPage(
          func?.funName,
          TopTab.PROPS,
          PropsTab.DDL,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: 'EDIT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing', defaultMessage: '编辑' }), //编辑
      ],
      disabled: (session, node) => {
        return !isSupportPLEdit(session);
      },
      actionType: actionTypes.update,
      ellipsis: true,
      async run(session, node) {
        const func: IFunction = node.data;
        await openFunctionEditPageByFuncName(
          func?.funName,
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
        const func: IFunction = node.data;
        const { plPage, isNew } = await openFunctionEditPageByFuncName(
          func?.funName,
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

      ellipsis: true,
      isHide(session, node) {
        return !session?.supportFeature?.enablePLDebug;
      },
      async run(session, node) {
        const func: IFunction = node.data;
        if (func.status === 'INVALID') {
          message.info(
            formatMessage({
              id: 'odc.ResourceTree.config.treeNodesActions.InvalidObjectDebuggingIsNot',
              defaultMessage: '无效对象，不支持调试',
            }),
          );

          return;
        }
        const { plPage, isNew } = await openFunctionEditPageByFuncName(
          func?.funName,
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

      ellipsis: true,
      actionType: actionTypes.update,
      hasDivider: true,
      isHide(session, node) {
        return !getDataSourceModeConfig(session?.connection?.type)?.features?.plRun;
      },
      async run(session, node) {
        const func: IFunction = node.data;
        const { plPage, isNew } = await openFunctionEditPageByFuncName(
          func?.funName,
          session?.sessionId,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );

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
        const func: IFunction = node.data;
        modal.changeExportModal(true, {
          type: DbObjectType.function,
          name: func.funName,
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
        const func: IFunction = node.data;
        const obj = await getFunctionByFuncName(
          func?.funName,
          false,
          session?.sessionId,
          session?.database?.dbName,
        );
        const ddl = obj?.ddl;
        if (ddl) {
          downloadPLDDL(func?.funName, PLType.FUNCTION, ddl, session?.database?.dbName);
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
        const func: IFunction = node.data;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createFunction.modal.delete',
              defaultMessage: '是否确定删除函数 {name} ？',
            },

            {
              name: func?.funName,
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
              func?.funName,
              DbObjectType.function,
              session?.sessionId,
            );
            if (!isSuccess) {
              return;
            }
            await session.database.getFunctionList();

            message.success(
              formatMessage({
                id: 'odc.components.ResourceTree.TriggerTree.DeletedSuccessfully',
                defaultMessage: '删除成功',
              }),
              // 删除成功
            );

            const openedPages = pageStore?.pages.filter(
              (p) =>
                p.title === func?.funName && (p.type == PageType.FUNCTION || p.type == PageType.PL),
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
        await session.database.getFunctionList();
      },
    },
  ],
};
