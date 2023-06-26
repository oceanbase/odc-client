import { IDatasource } from '@/d.ts/datasource';
import { formatMessage } from '@/util/intl';
import { Column } from '@alipay/ob-react-data-grid';
import { uniq } from 'lodash';
import { useMemo } from 'react';
import { WrapSelectEditor } from '../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../EditableTable/Editors/TextEditor';
import { useTableConfig } from '../config';
import {
  TableColumn,
  TableIndex,
  TableIndexMehod,
  TableIndexScope,
  TableIndexType,
} from '../interface';
import { WrapReverseCheckboxFormatetr } from '../RdgFomatter/CheckboxFormatter';
import WrapValueFormatter from '../RdgFomatter/ValueFormatter';

export function useColumns(
  columns: TableColumn[],
  connection: IDatasource,
): Column<TableIndex, TableIndex>[] {
  const config = useTableConfig(connection?.dialectType);
  const methodOptions = {
    [TableIndexMehod.NONE]: formatMessage({
      id: 'odc.CreateTable.TableIndex.columns.Empty',
    }), //空
    [TableIndexMehod.HASH]: 'HASH',
    [TableIndexMehod.BTREE]: 'BTREE',
  };

  const visibleCheckbox = useMemo(() => {
    return WrapReverseCheckboxFormatetr('visible');
  }, []);
  const scopeSelect = useMemo(() => {
    return WrapSelectEditor([TableIndexScope.GLOBAL, TableIndexScope.LOCAL], false);
  }, []);
  const methodSelect = useMemo(() => {
    return WrapSelectEditor(
      Object.entries(methodOptions).map(([key, text]) => {
        return {
          text,
          value: key,
        };
      }),
      false,
    );
  }, []);
  const methodFormatter = useMemo(() => {
    return WrapValueFormatter((row) => {
      return methodOptions[row['method']];
    });
  }, []);
  const typeSelect = useMemo(() => {
    return WrapSelectEditor(
      config.enableIndexesFullTextType
        ? [TableIndexType.FULLTEXT, TableIndexType.UNIQUE, TableIndexType.NORMAL]
        : [TableIndexType.UNIQUE, TableIndexType.NORMAL],
      false,
    );
  }, []);
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
      key: 'scope',
      name: formatMessage({ id: 'odc.CreateTable.TableIndex.columns.Scope' }), //范围
      resizable: true,
      editable: true,
      editor: scopeSelect,
      width: 120,
    },

    {
      key: 'method',
      name: formatMessage({ id: 'odc.CreateTable.TableIndex.columns.Method' }), //方法
      resizable: true,
      editable: true,
      filterable: false,
      editor: methodSelect,
      formatter: methodFormatter,
      width: 100,
    },

    {
      key: 'type',
      name: formatMessage({ id: 'odc.CreateTable.TableIndex.columns.Type' }), //类型
      resizable: true,
      editable: true,
      filterable: false,
      editor: typeSelect,
      width: 120,
    },

    {
      key: 'columns',
      name: formatMessage({ id: 'odc.CreateTable.TableIndex.columns.Column' }), //列
      resizable: true,
      editable: true,
      filterable: false,
      editor: ColumnsMultipleSelect,
      formatter: ({ row }) => {
        return <span>{row.columns?.join?.(',')}</span>;
      },
    },

    {
      key: 'visible',
      name: formatMessage({
        id: 'odc.CreateTable.TableIndex.columns.Invisible',
      }), //不可见
      resizable: true,
      filterable: false,
      editor: TextEditor,
      editable: false,
      formatter: visibleCheckbox,
      width: 100,
    },
  ];
}
