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
import { getType } from '@/common/network/type';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { DbObjectType, IType, PageType, TypePropsTab } from '@/d.ts';
import { openBatchCompilePLPage, openTypeViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import pageStore from '@/store/page';
import BatchCompileSvg from '@/svgr/batch-compile-all.svg';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { PlusOutlined, QuestionCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';
export const typeMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.TypeRoot]: [
    {
      key: 'CREATE',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.NewType',
        }),
      ],
      actionType: actionTypes.create,
      icon: PlusOutlined,
      run(session, node) {
        modal.changeCreateTypeModalVisible(
          true,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'REFRESH',
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.Refresh',
        }), //刷新
      ],

      icon: ReloadOutlined,
      actionType: actionTypes.read,
      async run(session, node) {
        await session.database.getTypeList();
      },
    },
  ],
  [ResourceNodeType.Type]: [
    {
      key: 'OVERVIEW',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.ViewType',
        }),
      ],
      run(session, node) {
        const type: IType = node.data;
        openTypeViewPage(
          type?.typeName,
          TypePropsTab.DDL,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },
    {
      key: 'EXPORT',
      text: formatMessage({
        id: 'odc.src.page.Workspace.SideBar.ResourceTree.TreeNodeMenu.config.Export',
      }), //'导出'
      ellipsis: true,
      run(session, node) {
        const type: IType = node.data;
        modal.changeExportModal(true, {
          type: DbObjectType.type,
          name: type?.typeName,
          databaseId: session?.database?.databaseId,
        });
      },
    },
    {
      key: 'DOWNLOAD',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.Download',
        }), //下载
      ],

      hasDivider: true,
      async run(session, node) {
        const type: IType = node.data;
        const obj = await getType(
          type?.typeName,
          false,
          session?.database?.dbName,
          session?.sessionId,
        );
        const ddl = obj?.ddl;
        if (ddl) {
          downloadPLDDL(type?.typeName, PLType.TYPE, ddl, session?.database?.dbName);
        }
      },
    },
    {
      key: 'DELETE',
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.Delete',
        }), //删除
      ],

      actionType: actionTypes.delete,
      run(session, node) {
        const type: IType = node.data;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'odc.components.ResourceTree.TypeTree.AreYouSureYouWant',
            },
            {
              title: type?.typeName,
            },
          ),
          // `确定要删除类型${title}吗？`
          okText: formatMessage({
            id: 'app.button.ok',
          }),
          cancelText: formatMessage({
            id: 'app.button.cancel',
          }),
          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            const isSuccess = await dropObject(
              type?.typeName,
              DbObjectType.type,
              session?.sessionId,
            );
            if (!isSuccess) {
              return;
            }
            await session?.database?.getTypeList();
            message.success(
              formatMessage({
                id: 'odc.components.ResourceTree.TypeTree.DeletedSuccessfully',
              }),
              // 删除成功
            );

            const openedPages = pageStore?.pages.filter(
              (p) =>
                p.title === type?.typeName && (p.type === PageType.TYPE || p.type === PageType.PL),
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
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.ResourceTree.actions.Refresh',
        }), //刷新
      ],

      actionType: actionTypes.create,
      async run(session, node) {
        await session.database.getTypeList();
      },
    },
  ],
};
