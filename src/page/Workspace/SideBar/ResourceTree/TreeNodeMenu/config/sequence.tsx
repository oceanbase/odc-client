import { deleteSequence, getSequence } from '@/common/network/sequence';
import { actionTypes } from '@/component/Acess';
import { DbObjectType, ISequence, ResourceTreeNodeMenuKeys } from '@/d.ts';
import { openSequenceViewPage } from '@/store/helper/page';
import modal from '@/store/modal';
import page from '@/store/page';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const sequenceMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.SequenceRoot]: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_SEQUENCE,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.sequence.CreateASequence',
        }),
      ],
      actionType: actionTypes.create,
      run(session, node) {
        modal.changeCreateSequenceModalVisible(true, {
          sessionId: session?.sessionId,
          dbName: session?.database?.dbName,
        });
      },
    },
  ],
  [ResourceNodeType.Sequence]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.ViewSequence' })],
      run(session, node) {
        const sequence: ISequence = node.data;
        openSequenceViewPage(
          sequence?.name,
          undefined,
          session?.sessionId,
          session?.database?.dbName,
        );
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.UPDATE_SEQUENCE,
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
            sessionId: session?.sessionId,
            dbName: session?.database?.dbName,
          });
        }
      },
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_SEQUENCE,
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
            await deleteSequence(sequenceInfo?.name, session?.sessionId, session?.database?.dbName);
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
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Export' }), //导出
      run(session, node) {
        const sequenceInfo: ISequence = node.data;
        modal.changeExportModal(true, {
          type: DbObjectType.sequence,
          name: sequenceInfo?.name,
        });
      },
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
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
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Refresh' })],
      async run(session, node) {
        await session.database.getSequenceList();
      },
    },
  ],
};
