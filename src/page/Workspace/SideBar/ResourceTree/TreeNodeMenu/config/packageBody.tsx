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
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { ConnectionMode, DbObjectType, IFunction, IPackage, IProcedure } from '@/d.ts';
import { TopTab } from '@/page/Workspace/components/PackagePage';
import {
  openFunctionOrProcedureFromPackage,
  openPackageBodyPage,
  openPackageViewPage,
} from '@/store/helper/page';
import { triggerActionAfterPLPageCreated } from '@/util/events';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';
import { getDataSourceModeConfig } from '@/common/datasource';

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
        openPackageViewPage(pkgInfo?.packageName, TopTab.BODY, true, session?.odcDatabase?.id);
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
        await openPackageBodyPage(pkg?.packageName, bodysql, session?.odcDatabase?.id);
      },
    },
    {
      key: 'COMPILE',
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.ResourceTree.actions.Compile' }), //编译
      ],
      isHide(session, node) {
        return !getDataSourceModeConfig(session?.connection?.type)?.features?.compile;
      },
      async run(session, node) {
        const pkgInfo: IPackage = node.data;
        const { pkgPage, isNew } = await openPackageBodyPage(
          pkgInfo?.packageName,
          pkgInfo?.packageBody?.basicInfo?.ddl,
          session?.odcDatabase?.id,
        );
        triggerActionAfterPLPageCreated(pkgPage, 'compile', isNew);
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
            if (!(await dropObject(packageName, DbObjectType.package_body, session?.sessionId))) {
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
        openPackageViewPage(node.pkg?.packageName, TopTab.BODY, true, session?.odcDatabase?.id);
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
        await openPackageBodyPage(pkg?.packageName, bodysql, session?.odcDatabase?.id);
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
        const { plPage, isNew } = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.funName,
          PLType.FUNCTION,
          plSchema,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );

        triggerActionAfterPLPageCreated(plPage, 'debug', isNew);
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
        const { plPage, isNew } = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.funName,
          PLType.FUNCTION,
          plSchema,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );

        triggerActionAfterPLPageCreated(plPage, 'run', isNew);
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
        openPackageViewPage(node.pkg?.packageName, TopTab.BODY, true, session?.odcDatabase?.id);
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
        await openPackageBodyPage(pkg?.packageName, bodysql, session?.odcDatabase?.id);
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
        const { plPage, isNew } = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.proName,
          PLType.PROCEDURE,
          plSchema,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
        triggerActionAfterPLPageCreated(plPage, 'debug', isNew);
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
        const { plPage, isNew } = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.proName,
          PLType.PROCEDURE,
          plSchema,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
        triggerActionAfterPLPageCreated(plPage, 'run', isNew);
      },
    },
  ],
};
