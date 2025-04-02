import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Column } from '@oceanbase-odc/ob-react-data-grid';
import { uniq } from 'lodash';
import { useMemo } from 'react';
import { WrapSelectEditor } from '../../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../../EditableTable/Editors/TextEditor';
import {
  TableColumn,
  TablePrimaryConstraint,
} from '@/page/Workspace/components/CreateTable/interface';
import {
  useDeferColumn,
  useEnableColumn,
} from '@/page/Workspace/components/CreateTable/TableConstraint/baseColumn';

export function useColumns(
  columns: any[],
  mode: ConnectionMode,
): Column<TablePrimaryConstraint, TablePrimaryConstraint>[] {
  const enableColumn = useEnableColumn(mode);
  const deferColumn = useDeferColumn(mode);
  const validColumns = useMemo(() => {
    return uniq(
      columns
        ?.filter((column: any) => !!column.aliasName?.trim())
        .map((column) => column.aliasName),
    );
  }, [columns]);
  const ColumnsMultipleSelect = useMemo(() => {
    return WrapSelectEditor(validColumns);
  }, [columns]);
  return [
    {
      key: 'name',
      name: '主键约束名称',
      resizable: true,
      editable: false,
    },
    {
      key: 'columns',
      name: formatMessage({
        id: 'odc.TableConstraint.Primary.columns.Column',
        defaultMessage: '列',
      }), //列
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
