import { actionTypes } from '@/component/Acess';
import { ResourceTreeNodeMenuKeys } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export const sequenceMenusConfig = {
  sequence: [
    {
      key: ResourceTreeNodeMenuKeys.CREATE_SEQUENCE,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.sequence.CreateASequence',
        }),
      ],

      hasDivider: true,
      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.ViewSequence' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.UPDATE_SEQUENCE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Modify' })],
      actionType: actionTypes.update,
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_SEQUENCE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Delete' })],
      actionType: actionTypes.delete,
      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.EXPORT_TABLE,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Export' }), //导出
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Download' }), //下载
      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_SEQUENCE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.sequence.Refresh' })],
    },
  ],
};
