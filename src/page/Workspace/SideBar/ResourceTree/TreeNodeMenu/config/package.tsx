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

import { getExportObjects, getPackageBodyCreateSQL } from '@/common/network';
import { dropObject } from '@/common/network/database';
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
import BatchCompileSvg from '@/svgr/batch-compile-all.svg';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { PlusOutlined, QuestionCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const packageMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.PackageRoot]: [
    {
      key: 'BATCH_COMPILE',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.package.BatchCompilation' }), //批量编译
      ],
      actionType: actionTypes.create,
      icon: BatchCompileSvg,
      run(session, node) {
        openBatchCompilePLPage(
          PageType.BATCH_COMPILE_PACKAGE,
          DbObjectType.package,
          formatMessage({ id: 'odc.components.ResourceTree.Bag' }),
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'CREATE',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.CreateAPackage',
        }),
      ],

      actionType: actionTypes.create,
      icon: PlusOutlined,
      run(session, node) {
        modal.changeCreatePackageModalVisible(
          true,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      icon: ReloadOutlined,
      actionType: actionTypes.read,
      async run(session, node) {
        await session.database.getPackageList();
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
      ellipsis: true,
      async run(session, node) {
        const pkg: IPackage = node.data;
        const sql = await getPackageBodyCreateSQL(
          pkg.packageName,
          session?.sessionId,
          session?.database?.dbName,
        );
        openCreatePackageBodyPage(sql, session?.odcDatabase?.id, session?.database?.dbName);
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
      ellipsis: true,
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const pkg: IPackage = await session?.database?.loadPackage(pkgInfo.packageName);
        const sql = pkg?.packageHead?.basicInfo?.ddl || '';
        const bodysql = pkg?.packageBody?.basicInfo?.ddl || '';
        await openPackageHeadPage(pkg?.packageName, sql, session?.odcDatabase?.id);
        if (bodysql) {
          await openPackageBodyPage(pkg?.packageName, bodysql, session?.odcDatabase?.id);
        }
      },
    },

    {
      key: 'EXPORT',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Export' }), //导出
      ],
      ellipsis: true,
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const pkgBodyList = await getExportObjects(
          session?.database?.databaseId,
          DbObjectType.package_body,
          session?.connection?.id,
        );
        modal.changeExportModal(true, {
          type: DbObjectType.package,
          name: pkgInfo?.packageName,
          exportPkgBody: !!pkgBodyList[DbObjectType.package_body]?.find(
            (item) => item === pkgInfo.packageName,
          ),
          databaseId: session?.database.databaseId,
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

      ellipsis: true,
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
            if (!(await dropObject(pkg.packageName, DbObjectType.package, session?.sessionId))) {
              return;
            }
            await session?.database?.getPackageList();
            message.success(
              formatMessage({
                id: 'workspace.window.createPackage.modal.delete.success',
              }),
            );

            const openedPages = pageStore.pages.filter(
              (p) =>
                p.params.packageName === pkg.packageName &&
                session?.database?.databaseId === p.params.databaseId,
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
      ellipsis: true,
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

      ellipsis: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        openPackageViewPage(pkgInfo?.packageName, TopTab.HEAD, true, session?.odcDatabase?.id);
      },
    },
    {
      key: 'EDIT',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.config.treeNodesActions.Editing',
        }),
      ],

      ellipsis: true,
      actionType: actionTypes.update,
      hasDivider: true,
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const pkg: IPackage = await session?.database?.loadPackage(pkgInfo.packageName);
        const sql = pkg?.packageHead?.basicInfo?.ddl || '';
        await openPackageHeadPage(pkg?.packageName, sql, session?.odcDatabase?.id);
      },
    },

    {
      key: 'DOWNLOAD',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Download' }), //下载
      ],
      ellipsis: true,
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

      ellipsis: true,
      actionType: actionTypes.delete,
      run(session, node, databaseFrom) {
        packageMenusConfig[ResourceNodeType.Package]
          .find((item) => item.key === 'DELETE')
          ?.run?.(session, node, databaseFrom);
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
      ],
      ellipsis: true,
      actionType: actionTypes.create,
      async run(session, node) {
        const pkg: IPackage = node.data;
        await session.database.loadPackage(pkg.packageName);
      },
    },
  ],
};
