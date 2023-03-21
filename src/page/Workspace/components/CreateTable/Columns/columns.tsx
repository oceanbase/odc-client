import { ConnectionMode, IDataType } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { dataTypesIns } from '@/util/dataType';
import { formatMessage } from '@/util/intl';
import { Column } from '@alipay/ob-react-data-grid';
import { isNil } from 'lodash';
import { useContext, useMemo } from 'react';
import { InputNumberEditor } from '../../EditableTable/Editors/NumberEditor';
import { SelectEditor } from '../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../EditableTable/Editors/TextEditor';
import TablePageContext from '../../TablePage/context';
import { TableColumn } from '../interface';
import WrapCheckboxFormatetr from '../RdgFomatter/CheckboxFormatter';
import WrapDisableFormatter from '../RdgFomatter/DisableFormatter';
import { getTypeByColumnName } from './helper';

interface IColumnParams {
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
}

export function useColumns(
  { schemaStore, connectionStore }: IColumnParams,
  originColumns: TableColumn[],
): Column[] {
  const { dataTypes } = schemaStore;
  const { dialectType } = connectionStore.connection || {};
  const pageContext = useContext(TablePageContext);
  const haveAutoIncrement = [ConnectionMode.OB_MYSQL].includes(
    connectionStore.connection.dialectType,
  );

  const DataTypeSelect = useMemo(() => {
    return function (props) {
      const { onRowChange, ...rest } = props;
      return (
        <SelectEditor
          multiple={false}
          options={
            dataTypes?.map((d: IDataType) => d.databaseType.replace(/\(\)/, '')).filter(Boolean) ||
            []
          }
          {...props}
          onRowChange={(row: TableColumn) => {
            const type = row.type;
            const dataType = dataTypesIns.getDataType(connectionStore.connection.dialectType, type);
            onRowChange(
              {
                ...row,
                width: dataType?.defaultValues?.[0],
                scale: dataType?.defaultValues?.[1],
              },
              true,
            );
          }}
        />
      );
    };
  }, [dataTypes]);

  const ColumnNameEditor = useMemo(() => {
    return function (props) {
      const { onRowChange, ...rest } = props;
      return (
        <TextEditor
          {...rest}
          onRowChange={(newRow: TableColumn, submit) => {
            if (!submit) {
              onRowChange(newRow, submit);
              return;
            }
            const value = newRow.name;
            if (!newRow.type) {
              /**
               * 类型为空的时候，自动推断
               */
              const type = getTypeByColumnName(value);
              if (type) {
                newRow = {
                  ...newRow,
                  type: type.name,
                  width: type.type?.defaultValues?.[0],
                  scale: type.type?.defaultValues?.[1],
                };

                onRowChange(newRow, true);
                return;
              }
            }
            onRowChange(newRow, submit);
          }}
        />
      );
    };
  }, []);

  const NotNullCheckbox = useMemo(() => {
    return WrapCheckboxFormatetr('notNull', (row) => {
      if (!pageContext?.editMode) {
        return false;
      }
      /**
       * 不能从空转为非空
       */
      const originColumn = originColumns.find(
        (column) => column?.ordinalPosition === row.ordinalPosition,
      );
      if (originColumn && !originColumn?.notNull) {
        return true;
      }
      return false;
    });
  }, [originColumns]);
  const AutoIncrementCheckbox = useMemo(() => {
    return WrapCheckboxFormatetr('autoIncrement', (row) => {
      if (!pageContext?.editMode) {
        return false;
      }
      const originData = originColumns.find(
        (column) => column?.ordinalPosition === row.ordinalPosition,
      );

      /**
       * 非自增列无法变成自增列，有缺省值的时候，不能设置自增
       */
      if (originData?.autoIncrement === false || originData?.defaultValueOrExpr) {
        return true;
      }
      return false;
    });
  }, [originColumns]);
  const GeneratedCheckbox = useMemo(() => {
    return WrapCheckboxFormatetr('generated', (row) => {
      if (!pageContext?.editMode) {
        return false;
      }
      /**
       * 虚拟列不允许编辑
       */
      const originColumn = originColumns.find(
        (column) => column?.ordinalPosition === row.ordinalPosition,
      );
      if (originColumn) {
        return true;
      }
      return false;
    });
  }, [originColumns]);
  const WidthDisableFormatter = useMemo(() => {
    return WrapDisableFormatter(
      (row) => dataTypesIns.getParamsCount(dialectType, row.type) < 1,
      'width',
    );
  }, []);
  const ScaleDisableFormatter = useMemo(() => {
    return WrapDisableFormatter(
      (row) => dataTypesIns.getParamsCount(dialectType, row.type) < 2,
      'scale',
    );
  }, []);

  return useMemo(() => {
    return [
      {
        key: 'name',
        name: formatMessage({ id: 'odc.CreateTable.Columns.columns.Name' }), //名称
        resizable: true,
        editable: true,
        editor: ColumnNameEditor,
      },

      {
        key: 'type',
        name: formatMessage({ id: 'odc.CreateTable.Columns.columns.Type' }), //类型
        resizable: true,
        editable: (row) => !pageContext?.editMode || isNil(row.ordinalPosition),
        editor: DataTypeSelect,
        width: 100,
      },

      {
        key: 'width',
        name: formatMessage({ id: 'odc.CreateTable.Columns.columns.Length' }), //长度
        resizable: true,
        filterable: false,
        editor: TextEditor,
        editable: (row) => dataTypesIns.getParamsCount(dialectType, row.type) > 0,
        formatter: WidthDisableFormatter,
        width: 80,
      },

      {
        key: 'scale',
        name: formatMessage({
          id: 'odc.CreateTable.Columns.columns.DecimalPoint',
        }), //小数点
        resizable: true,
        filterable: false,
        editor: InputNumberEditor,
        editable: (row) => dataTypesIns.getParamsCount(dialectType, row.type) > 1,
        formatter: ScaleDisableFormatter,
        width: 80,
      },

      {
        key: 'notNull',
        name: formatMessage({
          id: 'workspace.window.createTable.column.allowNull',
        }),

        resizable: true,
        filterable: false,
        editor: TextEditor,
        editable: false,
        formatter: NotNullCheckbox,
      },

      haveAutoIncrement && {
        key: 'autoIncrement',
        name: formatMessage({
          id: 'workspace.window.createTable.column.increment',
        }),

        resizable: true,
        filterable: false,
        editor: TextEditor,
        editable: false,
        formatter: AutoIncrementCheckbox,
      },

      {
        key: 'generated',
        name: formatMessage({
          id: 'odc.CreateTable.Columns.columns.VirtualColumn',
        }), //虚拟列
        resizable: true,
        filterable: false,
        editor: TextEditor,
        editable: false,
        formatter: GeneratedCheckbox,
      },

      {
        key: 'comment',
        name: formatMessage({ id: 'odc.CreateTable.Columns.columns.Comment' }), //注释
        filterable: false,
        resizable: true,
        editor: TextEditor,
      },
    ].filter(Boolean) as Column[];
  }, [haveAutoIncrement]);
}
