import { deleteFunction, getFunctionByFuncName } from '@/common/network';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { ConnectionMode, DbObjectType, IFunction, PageType } from '@/d.ts';
import { PropsTab, TopTab } from '@/page/Workspace/components/FunctionPage';
import { openFunctionEditPageByFuncName, openFunctionViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import EventBus from 'eventbusjs';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const functionMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.FunctionRoot]: [
    {
      key: 'CREATE',
      text: ['新建函数'],
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateFunctionModalVisible(true, session?.sessionId, session?.database?.dbName);
      },
    },
  ],
  [ResourceNodeType.Function]: [
    {
      key: 'OVERVIEW',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.See',
        }),
      ],
      run(session, node) {
        const func: IFunction = node.data;
        openFunctionViewPage(
          func?.funName,
          TopTab.PROPS,
          PropsTab.DDL,
          session?.sessionId,
          session?.database?.dbName,
        );
      },
    },

    {
      key: 'EDIT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing' }), //编辑
      ],
      actionType: actionTypes.update,
      async run(session, node) {
        const func: IFunction = node.data;
        await openFunctionEditPageByFuncName(
          func?.funName,
          session?.sessionId,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'COMPILE',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Compile' }), //编译
      ],
      isHide(session, node) {
        const isMySQL = session.connection.dialectType === ConnectionMode.OB_MYSQL;
        return isMySQL;
      },
      async run(session, node) {
        const func: IFunction = node.data;
        await openFunctionEditPageByFuncName(
          func?.funName,
          session?.sessionId,
          session?.database?.dbName,
        );
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: func.funName,
            params: {
              action: 'COMPILE',
            },
          });
        });
      },
    },
    {
      key: 'DEBUG',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Debugging',
        }),
      ],
      isHide(session, node) {
        return !session?.supportFeature?.enablePLDebug;
      },
      async run(session, node) {
        const func: IFunction = node.data;
        if (func.status === 'INVALID') {
          message.info(
            formatMessage({
              id: 'odc.ResourceTree.config.treeNodesActions.InvalidObjectDebuggingIsNot',
            }),
          );

          return;
        }
        await openFunctionEditPageByFuncName(
          func?.funName,
          session?.sessionId,
          session?.database?.dbName,
        );
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: func.funName,
            params: {
              action: 'DEBUG',
            },
          });
        });
      },
    },
    {
      key: 'RUN',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Run',
        }),
      ],
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const func: IFunction = node.data;
        await openFunctionEditPageByFuncName(
          func?.funName,
          session?.sessionId,
          session?.database?.dbName,
        );
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: node.title,
            params: {
              action: 'EXEC',
            },
          });
        });
      },
    },

    {
      key: 'EXPORT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Export' }), //导出
      ],
      run(session, node) {
        const func: IFunction = node.data;
        modal.changeExportModal(true, {
          type: DbObjectType.function,
          name: func.funName,
        });
      },
    },
    {
      key: 'DOWNLOAD',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download' }), //下载
      ],
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
        formatMessage({ id: 'odc.ResourceTree.actions.Delete' }), //删除
      ],
      actionType: actionTypes.delete,
      run(session, node) {
        const func: IFunction = node.data;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createFunction.modal.delete',
            },

            {
              name: func?.funName,
            },
          ),
          okText: formatMessage({ id: 'app.button.ok' }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            await deleteFunction(func?.funName, session?.sessionId, session?.database?.dbName);
            await session.database.getFunctionList();

            message.success(
              formatMessage({
                id: 'odc.components.ResourceTree.TriggerTree.DeletedSuccessfully',
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
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      actionType: actionTypes.create,
      async run(session, node) {
        await session.database.getFunctionList();
      },
    },
  ],
};
