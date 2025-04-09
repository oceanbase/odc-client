import { formatMessage } from '@/util/intl';

export function useColumns() {
  const columns = [
    {
      key: 'name',
      name: '列名称',
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
      name: '列注释',
      resizable: true,
      filterable: false,
    },
  ].filter(Boolean);
  return columns;
}
