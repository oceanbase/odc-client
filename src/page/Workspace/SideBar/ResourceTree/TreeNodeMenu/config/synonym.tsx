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
import { getSynonym } from '@/common/network/synonym';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import { DbObjectType, ISynonym, ResourceTreeNodeMenuKeys, SynonymType } from '@/d.ts';
import { openSynonymViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import page from '@/store/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { PlusOutlined, QuestionCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';
import { isSupportExport } from './helper';
function getMenu(synonymType: SynonymType): IMenuItemConfig[] {
  return [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      ellipsis: true,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.ViewSynonyms' }), //查看同义词
      ],
      run(session, node) {
        const synonym: Partial<ISynonym> = node.data;
        openSynonymViewPage(
          synonym.synonymName,
          synonymType,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_SYNONYM,
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.sequence.Delete',
        }),
      ],

      actionType: actionTypes.delete,
      hasDivider: true,
      async run(session, node) {
        const synonym: Partial<ISynonym> = node.data;
        Modal.confirm({
          title: formatMessage(
            {
              id: 'odc.components.ResourceTree.SynonymTree.AreYouSureYouWant',
            },
            { synonymName: synonym?.synonymName },
          ), // `确定要删除同义词${synonymName}吗？`
          okText: formatMessage({ id: 'app.button.ok' }),

          cancelText: formatMessage({
            id: 'app.button.cancel',
          }),

          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            const isSuccess =
              synonymType === SynonymType.COMMON
                ? await dropObject(synonym?.synonymName, DbObjectType.synonym, session?.sessionId)
                : await dropObject(
                    synonym?.synonymName,
                    DbObjectType.public_synonym,
                    session?.sessionId,
                  );
            if (!isSuccess) {
              return;
            }
            synonymType === SynonymType.COMMON
              ? await session.database?.getSynonymList()
              : await session.database?.getPublicSynonymList();

            message.success(
              formatMessage({
                id: 'odc.components.ResourceTree.SynonymTree.SynonymDeletedSuccessfully',
              }),
              // 删除同义词成功
            );
            // TODO：如果当前有视图详情页面，需要关闭

            const openedPage = page?.pages.find(
              (p) => p.params.synonymName === synonym?.synonymName,
            );

            if (openedPage) {
              page?.close(openedPage.key);
            }
          },
        });
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.EXPORT_TABLE,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.Export' }), //导出
      ellipsis: true,
      isHide: (session) => {
        return !isSupportExport(session);
      },
      run(session, node) {
        const synonym: Partial<ISynonym> = node.data;
        modal.changeExportModal(true, {
          type:
            synonymType === SynonymType.PUBLIC ? DbObjectType.public_synonym : DbObjectType.synonym,
          name: synonym?.synonymName,
          databaseId: session?.database.databaseId,
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.Download' }), //下载
      ellipsis: true,
      hasDivider: true,
      async run(session, node) {
        const synonym: Partial<ISynonym> = node.data;
        const obj = await getSynonym(
          synonym?.synonymName,
          synonymType,
          session.sessionId,
          session?.database?.dbName,
        );
        if (obj) {
          downloadPLDDL(synonym?.synonymName, PLType.SYNONYM, obj.ddl, session?.database?.dbName);
        }
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_SYNONYM,
      ellipsis: true,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.sequence.Refresh',
        }),
      ],
      async run(session, node) {
        synonymType === SynonymType.COMMON
          ? await session.database?.getSynonymList()
          : await session.database?.getPublicSynonymList();
      },
    },
  ];
}
export const synonymMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.SynonymRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_SYNONYM,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.CreateSynonym' }), //新建同义词
      ],
      icon: PlusOutlined,
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateSynonymModalVisible(
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
        await session.database.getSynonymList();
      },
    },
  ],
  [ResourceNodeType.PublicSynonymRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_SYNONYM,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.CreateSynonym' }), //新建同义词
      ],
      icon: PlusOutlined,
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateSynonymModalVisible(
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
        await session.database.getPublicSynonymList();
      },
    },
  ],
  [ResourceNodeType.Synonym]: getMenu(SynonymType.COMMON),
  [ResourceNodeType.PublicSynonym]: getMenu(SynonymType.PUBLIC),
};
