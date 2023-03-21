import { formatMessage } from '@/util/intl';
import { Column } from '@alipay/ob-react-data-grid';
import { uniq } from 'lodash';
import { useMemo } from 'react';
import { WrapSelectEditor } from '../../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../../EditableTable/Editors/TextEditor';
import { TableColumn, TablePrimaryConstraint } from '../../interface';
import { useDeferColumn, useEnableColumn } from '../baseColumn';

export function useColumns(
  columns: TableColumn[],
): Column<TablePrimaryConstraint, TablePrimaryConstraint>[] {
  const enableColumn = useEnableColumn();
  const deferColumn = useDeferColumn();
  const validColumns = useMemo(() => {
    return uniq(columns?.filter((column) => !!column.name?.trim()).map((column) => column.name));
  }, [columns]);
  const ColumnsMultipleSelect = useMemo(() => {
    return WrapSelectEditor(validColumns);
  }, [columns]);
  return [
    {
      key: 'name',
      name: formatMessage({
        id: 'odc.CreateTable.Columns.columns.Name',
      }), //名称
      resizable: true,
      editable: true,
      editor: TextEditor,
    },

    {
      key: 'columns',
      name: formatMessage({ id: 'odc.TableConstraint.Primary.columns.Column' }), //列
      resizable: true,
      editable: true,
      filterable: false,
      editor: ColumnsMultipleSelect,
      formatter: ({ row }) => {
        return <span>{row.columns?.join?.(',')}</span>;
      },
    },

    enableColumn,
    deferColumn,
  ].filter(Boolean);
}
