import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Column } from '@oceanbase-odc/ob-react-data-grid';
import { useMemo } from 'react';
import { WrapSelectEditor } from '../../../EditableTable/Editors/SelectEditor';
import { Select, Tooltip } from 'antd';
import { TablePrimaryConstraint } from '@/page/Workspace/components/CreateTable/interface';
import {
  useDeferColumn,
  useEnableColumn,
} from '@/page/Workspace/components/CreateTable/TableConstraint/baseColumn';
const Option = Select.Option;

export function useColumns(
  columns: any[],
  mode: ConnectionMode,
): Column<TablePrimaryConstraint, TablePrimaryConstraint>[] {
  const enableColumn = useEnableColumn(mode);
  const deferColumn = useDeferColumn(mode);

  const customRenderOptions = (item) => {
    return (
      <Option
        key={item.aliasName ? item.aliasName?.trim() : item.columnName}
        value={item.aliasName ? item.aliasName?.trim() : item.columnName}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>{item.columnName}</span>
          <Tooltip title={item.aliasName}>
            <span
              style={{
                color: 'var(--text-color-placeholder)',
                marginLeft: '6px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.aliasName}
            </span>
          </Tooltip>
        </div>
      </Option>
    );
  };

  const ColumnsMultipleSelect = useMemo(() => {
    return WrapSelectEditor(columns, true, customRenderOptions);
  }, [columns]);

  return [
    {
      key: 'name',
      name: formatMessage({
        id: 'src.page.Workspace.components.CreateMaterializedView.Constraint.Primary.BD5072E1',
        defaultMessage: '主键约束名称',
      }),
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
