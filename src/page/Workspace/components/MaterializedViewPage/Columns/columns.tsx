import { formatMessage } from '@/util/intl';

export function useColumns() {
  const columns = [
    {
      key: 'name',
      name: formatMessage({
        id: 'src.page.Workspace.components.MaterializedViewPage.Columns.81E9C43F',
        defaultMessage: '列名称',
      }),
      resizable: true,
    },

    {
      key: 'type',
      name: formatMessage({
        id: 'workspace.window.createTable.column.dataType',
        defaultMessage: '数据类型',
      }),
      resizable: true,
      filterable: false,
    },

    {
      key: 'comment',
      name: formatMessage({
        id: 'src.page.Workspace.components.MaterializedViewPage.Columns.60269134',
        defaultMessage: '列注释',
      }),
      resizable: true,
      filterable: false,
    },
  ].filter(Boolean);
  return columns;
}
