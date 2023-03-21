import { actionTypes } from '@/component/Acess';
import { DbObjectType, ResourceTreeNodeMenuKeys } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export const viewMenusConfig = {
  [DbObjectType.view]: [
    {
      key: ResourceTreeNodeMenuKeys.BROWSER_SCHEMA,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.view.ViewViewProperties' })],
    },

    {
      key: ResourceTreeNodeMenuKeys.BROWSER_DATA,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.view.ViewViewData' })],
      hasDivider: true,
    },

    {
      key: ResourceTreeNodeMenuKeys.CREATE_VIEW,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.view.CreateAView' })],
      hasDivider: true,
      actionType: actionTypes.create,
    },

    {
      key: ResourceTreeNodeMenuKeys.EXPORT_TABLE,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.view.Export' }), //导出
    },
    {
      key: ResourceTreeNodeMenuKeys.DOWNLOAD,
      text: formatMessage({ id: 'odc.TreeNodeMenu.config.view.Download' }), //下载
    },
    {
      key: ResourceTreeNodeMenuKeys.COPY,
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.view.Copy' }), //复制
      ],
      hasDivider: true,
      children: [
        {
          key: ResourceTreeNodeMenuKeys.COPY_NAME,
          text: [
            formatMessage({ id: 'odc.TreeNodeMenu.config.view.ObjectName' }), //对象名
          ],
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_SELECT,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.SelectStatement',
            }),

            //SELECT 语句
          ],
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_INSERT,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.InsertStatement',
            }),

            //INSERT 语句
          ],
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_UPDATE,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.UpdateStatement',
            }),

            //UPDATE 语句
          ],
        },

        {
          key: ResourceTreeNodeMenuKeys.COPY_DELETE,
          text: [
            formatMessage({
              id: 'odc.TreeNodeMenu.config.view.DeleteStatement',
            }),

            //DELETE 语句
          ],
        },
      ],
    },

    {
      key: ResourceTreeNodeMenuKeys.DELETE_TABLE,
      text: [formatMessage({ id: 'odc.TreeNodeMenu.config.view.Delete' })],
      actionType: actionTypes.delete,
    },
  ],
};
