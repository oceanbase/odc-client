import {
  TableColumn,
  TablePrimaryConstraint,
} from '@/page/Workspace/components/CreateTable/interface';
import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export function useColumns(columns: TableColumn[], mode: ConnectionMode) {
  return [
    {
      key: 'name',
      name: formatMessage({
        id: 'src.page.Workspace.components.MaterializedViewPage.Constraints.C0B77838',
        defaultMessage: '主键约束名称',
      }), //名称
      resizable: true,
    },

    {
      key: 'columns',
      name: formatMessage({
        id: 'odc.TableConstraint.Primary.columns.Column',
        defaultMessage: '列',
      }), //列
      resizable: true,
      filterable: false,
      formatter: ({ row }) => {
        return <span>{row.columns?.join?.(',')}</span>;
      },
    },
  ];
}
