import { actionTypes } from '@/component/Acess';
import { ResourceTreeNodeMenuKeys } from '@/d.ts';
import { formatMessage } from '@/util/intl';
export const synonymMenusConfig = {
  synonym: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.ViewSynonyms' }), //查看同义词
      ],
    },

    {
      key: ResourceTreeNodeMenuKeys.CREATE_SYNONYM,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.CreateSynonym' }), //新建同义词
      ],
      actionType: actionTypes.create,
      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_SYNONYM,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.sequence.Delete',
        }),
      ],

      actionType: actionTypes.delete,
      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.EXPORT_TABLE,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.Export' }), //导出
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.synonym.Download' }), //下载
      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.REFRESH_SYNONYM,
      text: [
        formatMessage({
          id: 'odc.TreeNodeMenu.config.sequence.Refresh',
        }),
      ],
    },
  ],
};
