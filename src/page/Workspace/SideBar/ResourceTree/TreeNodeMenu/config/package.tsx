import { deletePackage, getExportObjects, getPackageBodyCreateSQL } from '@/common/network';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { DbObjectType, IPackage, PageType } from '@/d.ts';
import { TopTab } from '@/page/Workspace/components/PackagePage';
import {
  openBatchCompilePLPage,
  openCreatePackageBodyPage,
  openPackageBodyPage,
  openPackageHeadPage,
  openPackageViewPage,
} from '@/store/helper/page';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const packageMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.PackageRoot]: [
    {
      key: 'CREATE',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.CreateAPackage',
        }),
      ],
      actionType: actionTypes.create,

      run(session, node) {
        modal.changeCreatePackageModalVisible(true, session?.sessionId, session?.database?.dbName);
      },
    },
    {
      key: 'BATCH_COMPILE',
      text: ['批量编译'],
      actionType: actionTypes.create,
      run(session, node) {
        openBatchCompilePLPage(
          PageType.BATCH_COMPILE_PACKAGE,
          DbObjectType.package,
          formatMessage({ id: 'odc.components.ResourceTree.Bag' }),
          session?.connection?.id,
          session?.database?.dbName,
        );
      },
    },
  ],
  [ResourceNodeType.Package]: [
    {
      key: 'CREATE_BODY',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.CreateAPackage.1',
        }),
      ],
      actionType: actionTypes.create,

      async run(session, node) {
        const pkg: IPackage = node.data;
        const sql = await getPackageBodyCreateSQL(
          pkg.packageName,
          session?.sessionId,
          session?.database?.dbName,
        );
        openCreatePackageBodyPage(sql, session?.sessionId, session?.database?.dbName);
      },
    },
    {
      key: 'EDIT_HEAD_BODY',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.EditThePackageHeader',
        }),
      ],
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const pkg: IPackage = await session?.database?.loadPackage(pkgInfo.packageName);
        const sql = pkg?.packageHead?.basicInfo?.ddl || '';
        const bodysql = pkg?.packageBody?.basicInfo?.ddl || '';
        await openPackageHeadPage(
          pkg?.packageName,
          sql,
          session?.connection?.id,
          session?.database?.dbName,
        );
        await openPackageBodyPage(
          pkg?.packageName,
          bodysql,
          session?.connection?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: 'EXPORT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Export' }), //导出
      ],
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const pkgBodyList = await getExportObjects(
          session?.database?.dbName,
          DbObjectType.package_body,
          session?.connection?.id,
        );
        modal.changeExportModal(true, {
          type: DbObjectType.package,
          name: pkgInfo?.packageName,
          exportPkgBody: !!pkgBodyList[DbObjectType.package_body]?.find(
            (item) => item === pkgInfo.packageName,
          ),
        });
      },
    },

    {
      key: 'DELETE',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Delete',
        }),
      ],
      actionType: actionTypes.delete,
      run(session, node) {
        const pkg: IPackage = node.data;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'workspace.window.createPackage.modal.delete',
            },

            {
              name: pkg?.packageName,
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
              !(await deletePackage(pkg.packageName, session?.sessionId, session?.database?.dbName))
            ) {
              return;
            }
            await session?.database?.getPackageList();
            message.success(
              formatMessage({
                id: 'workspace.window.createPackage.modal.delete.success',
              }),
            );

            const openedPages = pageStore.pages.filter(
              (p) => p.params.packageName === pkg.packageName,
            );
            if (openedPages.length) {
              for (let p of openedPages) {
                await pageStore.close(p.key);
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
        const pkg: IPackage = node.data;
        await session.database.loadPackage(pkg.packageName);
      },
    },
  ],
  [ResourceNodeType.PackageHead]: [
    {
      key: 'VIEW',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.See',
        }),
      ],
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        openPackageViewPage(
          pkgInfo?.packageName,
          TopTab.HEAD,
          true,
          session?.database?.dbName,
          session?.sessionId,
        );
      },
    },
    {
      key: 'EDIT',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Editing',
        }),
      ],
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const pkg: IPackage = await session?.database?.loadPackage(pkgInfo.packageName);
        const sql = pkg?.packageHead?.basicInfo?.ddl || '';
        await openPackageHeadPage(
          pkg?.packageName,
          sql,
          session?.connection?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: 'DOWNLOAD',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download' }), //下载
      ],
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const obj = await session?.database?.loadPackage(pkgInfo?.packageName);
        const ddl = obj?.packageHead?.basicInfo?.ddl;
        const name = pkgInfo?.packageName + '.head';
        if (ddl) {
          downloadPLDDL(name, PLType.PKG_HEAD, ddl, session?.database?.dbName);
        }
      },
    },

    {
      key: 'DELETE',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Delete',
        }),
      ],
      actionType: actionTypes.delete,
      run(session, node) {
        packageMenusConfig[ResourceNodeType.Package]
          .find((item) => item.key === 'DELETE')
          ?.run?.(session, node);
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      actionType: actionTypes.create,
      async run(session, node) {
        const pkg: IPackage = node.data;
        await session.database.loadPackage(pkg.packageName);
      },
    },
  ],
};
