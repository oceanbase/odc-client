import { deletePackageBody } from '@/common/network';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { ConnectionMode, IFunction, IPackage, IProcedure } from '@/d.ts';
import { TopTab } from '@/page/Workspace/components/PackagePage';
import {
  openFunctionOrProcedureFromPackage,
  openPackageBodyPage,
  openPackageViewPage,
} from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import EventBus from 'eventbusjs';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const packageBodyMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.PackageBody]: [
    {
      key: 'OVERVIEW',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.See',
        }),
      ],
      run(session, node) {
        const pkgInfo: IPackage = node.data;
        openPackageViewPage(
          pkgInfo?.packageName,
          TopTab.BODY,
          true,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
      },
    },

    {
      key: 'EDIT',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing' }), //编辑
      ],
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const pkg: IPackage = await session?.database?.loadPackage(pkgInfo.packageName);
        const bodysql = pkg?.packageBody?.basicInfo?.ddl || '';
        await openPackageBodyPage(
          pkg?.packageName,
          bodysql,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'COMPILE',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Compile' }), //编译
      ],
      isHide(session, node) {
        const isMySQL = session.connection.dialectType === ConnectionMode.OB_MYSQL;
        return isMySQL;
      },
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const pKey = await openPackageBodyPage(
          pkgInfo?.packageName,
          pkgInfo?.packageBody?.basicInfo?.ddl,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: pKey,
            params: {
              action: 'COMPILE',
            },
          });
        });
      },
    },
    {
      key: 'DOWNLOAD',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download' }), //下载
      ],
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const obj: IPackage = await session?.database?.loadPackage(pkgInfo?.packageName);
        const ddl = obj?.packageBody?.basicInfo?.ddl;
        const name = pkgInfo?.packageName + '.body';
        if (ddl) {
          downloadPLDDL(name, PLType.PKG_BODY, ddl, session?.database?.dbName);
        }
      },
    },

    {
      key: 'DELETE',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Delete' }), //删除
      ],
      actionType: actionTypes.delete,
      run(session, node) {
        const pkgInfo: IPackage = node.data;
        const packageName = pkgInfo?.packageName;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.PackageBody.modal.delete',
            },

            {
              name: packageName,
            },
          ),

          okText: formatMessage({
            id: 'app.button.ok',
          }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            if (
              !(await deletePackageBody(packageName, session?.sessionId, session?.database?.dbName))
            ) {
              return;
            }
            message.success(
              formatMessage({
                id: 'workspace.window.PackageBody.modal.delete.success',
              }),
            );
            await session.database?.getPackageList();
            if (
              session.database.packages.find((pkg) => {
                return pkg.packageName === packageName;
              })
            ) {
              await session.database?.loadPackage(packageName);
            }
          },
        });
      },
    },
    {
      key: 'REFRESH',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      actionType: actionTypes.create,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const packageName = pkgInfo?.packageName;
        await session.database.loadPackage(packageName);
      },
    },
  ],
  [ResourceNodeType.PackageBodyFunction]: [
    {
      key: 'OVERVIEW',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.See',
        }),
      ],
      run(session, node) {
        openPackageViewPage(
          node.pkg?.packageName,
          TopTab.BODY,
          true,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
      },
    },
    {
      key: 'EDIT',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing' }), //编辑
      ],
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const pkgInfo = node.pkg;
        const pkg: IPackage = await session?.database?.loadPackage(pkgInfo.packageName);
        const bodysql = pkg?.packageBody?.basicInfo?.ddl || '';
        await openPackageBodyPage(
          pkg?.packageName,
          bodysql,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: 'DEBUG',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Debugging',
        }),
      ],
      isHide(session, node) {
        return !session?.supportFeature?.enablePLDebug;
      },
      async run(session, node) {
        const pkgInfo = node.pkg;
        const funcdata: IFunction & { key: string } = node.data;
        const packageName = pkgInfo?.packageName;
        const targetPackage = session.database?.packages.find(
          (pkg) => pkg.packageName === packageName,
        );
        const { functions = [] } = targetPackage.packageBody;

        const plSchema = functions.find((func) => funcdata.key.indexOf(func.key) !== -1);

        plSchema.ddl = targetPackage.packageBody.basicInfo.ddl; // 补充字段 packageName

        plSchema.packageName = packageName;
        const scriptId = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.funName,
          PLType.FUNCTION,
          plSchema,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );

        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: plSchema.key,
            params: {
              action: 'DEBUG',
            },
          });
        });
      },
    },
    {
      key: 'RUN',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Run',
        }),
      ],
      actionType: actionTypes.update,
      async run(session, node) {
        const pkgInfo = node.pkg;
        const funcdata: IFunction & { key: string } = node.data;
        const packageName = pkgInfo.packageName;
        const targetPackage = session?.database?.packages.find(
          (pkg) => pkg.packageName === packageName,
        );
        const { functions = [], procedures = [] } = targetPackage.packageBody;

        const plSchema = functions.find((func) => funcdata.key.indexOf(func.key) !== -1);
        plSchema.ddl = targetPackage.packageBody.basicInfo.ddl; // 补充字段 packageName

        plSchema.packageName = packageName;
        const scriptId = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.funName,
          PLType.FUNCTION,
          plSchema,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );

        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: plSchema.key,
            params: {
              action: 'EXEC',
            },
          });
        });
      },
    },
  ],
  [ResourceNodeType.PackageBodyProcedure]: [
    {
      key: 'OVERVIEW',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.See',
        }),
      ],
      run(session, node) {
        openPackageViewPage(
          node.pkg?.packageName,
          TopTab.BODY,
          true,
          session?.database?.dbName,
          session?.odcDatabase?.id,
        );
      },
    },
    {
      key: 'EDIT',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Editing' }), //编辑
      ],
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const pkgInfo = node.pkg;
        const pkg: IPackage = await session?.database?.loadPackage(pkgInfo.packageName);
        const bodysql = pkg?.packageBody?.basicInfo?.ddl || '';
        await openPackageBodyPage(
          pkg?.packageName,
          bodysql,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: 'DEBUG',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Debugging',
        }),
      ],
      isHide(session, node) {
        return !session?.supportFeature?.enablePLDebug;
      },
      async run(session, node) {
        const pkgInfo = node.pkg;
        const procdata: IProcedure & { key: string } = node.data;
        const packageName = pkgInfo?.packageName;
        const targetPackage = session.database?.packages.find(
          (pkg) => pkg.packageName === packageName,
        );
        const { procedures = [] } = targetPackage.packageBody;

        const plSchema = procedures.find((p) => procdata.key.indexOf(p.key) !== -1);

        plSchema.ddl = targetPackage.packageBody.basicInfo.ddl; // 补充字段 packageName

        plSchema.packageName = packageName;
        const scriptId = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.proName,
          PLType.PROCEDURE,
          plSchema,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );

        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: plSchema.key,
            params: {
              action: 'DEBUG',
            },
          });
        });
      },
    },
    {
      key: 'RUN',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Run',
        }),
      ],
      actionType: actionTypes.update,
      async run(session, node) {
        const pkgInfo = node.pkg;
        const procdata: IProcedure & { key: string } = node.data;
        const packageName = pkgInfo.packageName;
        const targetPackage = session?.database?.packages.find(
          (pkg) => pkg.packageName === packageName,
        );
        const { procedures = [] } = targetPackage.packageBody;

        const plSchema = procedures.find((p) => procdata.key.indexOf(p.key) !== -1);
        plSchema.ddl = targetPackage.packageBody.basicInfo.ddl; // 补充字段 packageName

        plSchema.packageName = packageName;
        const scriptId = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.proName,
          PLType.PROCEDURE,
          plSchema,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );

        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: plSchema.key,
            params: {
              action: 'EXEC',
            },
          });
        });
      },
    },
  ],
};
