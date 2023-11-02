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
import { getSequence } from '@/common/network/sequence';
import { actionTypes } from '@/component/Acess';
import { DbObjectType, ISequence, ResourceTreeNodeMenuKeys } from '@/d.ts';
import { openSequenceViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import page from '@/store/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { PlusOutlined, QuestionCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';
import { isSupportExport } from './helper';

export const sequenceMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.SequenceRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_SEQUENCE,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.sequence.CreateASequence',
        }),
      ],
      icon: PlusOutlined,
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateSequenceModalVisible(true, {
          databaseId: session?.odcDatabase?.id,
          dbName: session?.database?.dbName,
        });
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
        await session.database.getSequenceList();
      },
    },
  ],
  [ResourceNodeType.Sequence]: [
    {
      ellipsis: true,
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.ViewSequence' })],
      run(session, node) {
        const sequence: ISequence = node.data;
        openSequenceViewPage(
          sequence?.name,
          undefined,
          session?.odcDatabase?.id,
          session?.database?.dbName,
        );
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.UPDATE_SEQUENCE,
      ellipsis: true,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Modify' })],
      actionType: actionTypes.update,
      async run(session, node) {
        const sequenceInfo: ISequence = node.data;
        const sequence = await getSequence(
          sequenceInfo?.name,
          session?.sessionId,
          session?.database?.dbName,
        );
        if (sequence) {
          modal.changeCreateSequenceModalVisible(true, {
            isEdit: true,
            data: sequence,
            databaseId: session?.odcDatabase?.id,
            dbName: session?.database?.dbName,
          });
        }
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_SEQUENCE,
      ellipsis: true,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Delete' })],
      actionType: actionTypes.delete,
      hasDivider: true,
      run(session, node) {
        const sequenceInfo: ISequence = node.data;
        Modal.confirm({
          title: formatMessage(
            { id: 'workspace.window.createSequence.modal.delete' },
            { name: sequenceInfo?.name },
          ),
          okText: formatMessage({ id: 'app.button.ok' }),
          cancelText: formatMessage({ id: 'app.button.cancel' }),
          centered: true,
          icon: <QuestionCircleFilled />,
          onOk: async () => {
            const isSuccess = await dropObject(
              sequenceInfo?.name,
              DbObjectType.sequence,
              session?.sessionId,
            );
            if (!isSuccess) {
              return;
            }
            await session?.database?.getSequenceList();
            message.success(
              formatMessage({
                id: 'workspace.window.createSequence.delete.success',
              }),
            );

            // TODO：如果当前有视图详情页面，需要关闭
            const openedPage = page?.pages.find(
              (p) => p.params.sequenceName === sequenceInfo?.name,
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
      ellipsis: true,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Export' }), //导出
      isHide: (session) => {
        return !isSupportExport(session);
      },
      run(session, node) {
        const sequenceInfo: ISequence = node.data;
        modal.changeExportModal(true, {
          type: DbObjectType.sequence,
          name: sequenceInfo?.name,
          databaseId: session?.database.databaseId,
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      ellipsis: true,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Download' }), //下载
      hasDivider: true,
      async run(session, node) {
        const sequenceInfo: ISequence = node.data;
        const obj = await getSequence(
          sequenceInfo?.name,
          session?.sessionId,
          session?.database?.dbName,
        );
        if (obj) {
          downloadPLDDL(sequenceInfo?.name, 'SEQUENCE', obj.ddl, session?.database?.dbName);
        }
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_SEQUENCE,
      ellipsis: true,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Refresh' })],
      async run(session, node) {
        await session.database.getSequenceList();
      },
    },
  ],
};
