import { deleteProcedure, getProcedureByProName } from '@/common/network';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { ConnectionMode, DbObjectType, IProcedure, PageType } from '@/d.ts';
import { PropsTab, TopTab } from '@/page/Workspace/components/ProcedurePage';
import {
  openBatchCompilePLPage,
  openProcedureEditPageByProName,
  openProcedureViewPage,
} from '@/store/helper/page';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import EventBus from 'eventbusjs';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const procedureMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.ProcedureRoot]: [
    {
      key: 'CREATE',
      text: ['新建存储过程'],
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateProcedureModalVisible(
          true,
          session?.sessionId,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'BATCH_COMPILE',
      text: ['批量编译'],
      actionType: actionTypes.create,
      run(session, node) {
        openBatchCompilePLPage(
          PageType.BATCH_COMPILE_PROCEDURE,
          DbObjectType.procedure,
          formatMessage({ id: 'odc.components.ResourceTree.StoredProcedure' }),
          session?.connection?.id,
          session?.database?.dbName,
        );
      },
    },
  ],
  [ResourceNodeType.Procedure]: [
    {
      key: 'OVERVIEW',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.See',
        }),
      ],
      run(session, node) {
        const proc: IProcedure = node.data;
        openProcedureViewPage(
          proc?.proName,
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
        const proc: IProcedure = node.data;
        await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.connection?.id,
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
        const proc: IProcedure = node.data;
        await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.connection?.id,
        );
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: proc.proName,
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
        const proc: IProcedure = node.data;
        if (proc.status === 'INVALID') {
          message.info(
            formatMessage({
              id: 'odc.ResourceTree.config.treeNodesActions.InvalidObjectDebuggingIsNot',
            }),
          );

          return;
        }
        await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.connection?.id,
        );
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: proc.proName,
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
        const proc: IProcedure = node.data;
        await openProcedureEditPageByProName(
          proc?.proName,
          session?.sessionId,
          session?.database?.dbName,
          session?.connection?.id,
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
        const proc: IProcedure = node.data;
        modal.changeExportModal(true, {
          type: DbObjectType.procedure,
          name: proc.proName,
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
        formatMessage({ id: 'odc.ResourceTree.actions.Delete' }), //删除
      ],
      actionType: actionTypes.delete,
      run(session, node) {
        const proc: IProcedure = node.data;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createFunction.modal.delete',
            },

            {
              name: proc?.proName,
            },
          ),
          okText: formatMessage({ id: 'app.button.ok' }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            await deleteProcedure(proc?.proName, session?.sessionId, session?.database?.dbName);
            await session.database.getProcedureList();

            message.success(
              formatMessage({
                id: 'workspace.window.createProcedure.modal.delete.success',
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
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      actionType: actionTypes.create,
      async run(session, node) {
        await session.database.getProcedureList();
      },
    },
  ],
};
