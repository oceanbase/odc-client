import { ConnectionMode, ResultSetColumn } from '@/d.ts';
import { isObjectColumn } from '@/util/column';
import { isNil, isString, isUndefined } from 'lodash';
import React, { useMemo } from 'react';
import {
  DateEditor,
  DateTimeEditor,
  TimeEditor,
  YearEditor,
} from '../../EditableTable/Editors/DateEditor';
import { InputNumberEditor } from '../../EditableTable/Editors/NumberEditor';
import { TextEditor } from '../../EditableTable/Editors/TextEditor';
import BlobFormatter from './components/BlobFormatter';
import TextFormatter from './components/TextFormatter';
import styles from './index.less';

export default function useColumns(
  columns: ResultSetColumn[],
  enableEdit: boolean,
  supportBlob: boolean,
  originRows: any[],
  dbMode: ConnectionMode,
) {
  const rows = originRows?.slice(0, 30) || [];
  const maxRowsLength = {};
  rows.forEach((row) => {
    columns.forEach((column) => {
      const v = row[column.key];
      if (isString(v)) {
        const length = v.length;
        const lastMaxLength = maxRowsLength[column.key];
        if (!lastMaxLength || length > lastMaxLength) {
          maxRowsLength[column.key] = length;
        }
      }
    });
  });
  return useMemo(() => {
    return columns?.map((column) => {
      return {
        key: column.key,
        name: column.name,
        dataType: getDataType(column.columnType),
        width: getColumnWidth(column.name, column.columnType, maxRowsLength[column.key]),
        resizable: true,
        sortable: true,
        editable: !column.readonly && isColumnEditable(column.columnType),
        editor: getEditor(column.columnType, dbMode),
        formatter: getCellFormatter(column.columnType, enableEdit, supportBlob),
      };
    });
  }, [columns, enableEdit]);
}

function isColumnEditable(columnType) {
  return !isObjectColumn(columnType);
}
function getDataType(columnType: string): 'string' | 'number' {
  return isNumberType(columnType) || isYear(columnType) ? 'number' : 'string';
}

function isYear(type: string) {
  return ['YEAR'].includes(type);
}
export function isNumberType(columnType: string) {
  return [
    'INT',
    'INT_UNSIGNED',
    'INTEGER',
    'NUMERIC',
    'NUMERIC_UNSIGNED',
    'NUMBER',
    'TINYINT',
    'TINYINT_UNSIGNED',
    'SMALLINT',
    'SMALLINT_UNSIGNED',
    'MEDIUMINT',
    'MEDIUMINT_UNSIGNED',
    'BIGINT',
    'BIGINT_UNSIGNED',
    'DECIMAL',
    'DECIMAL_UNSIGNED',
    'FLOAT',
    'FLOAT_UNSIGNED',
    'DOUBLE',
    'DOUBLE_UNSIGNED',
  ].includes(columnType);
}

const defaultFormatter = React.memo(
  function (props) {
    const { column, row } = props;
    const columnKey = column.key;
    const value = row[columnKey];
    const isNumber = column.dataType === 'number';
    if (isNil(value)) {
      return (
        <span style={{ float: isNumber ? 'right' : 'none' }} className={styles.textNull}>
          {isUndefined(value) ? '(default)' : '(null)'}
        </span>
      );
    } else {
      return <span style={{ float: isNumber ? 'right' : 'none' }}>{value}</span>;
    }
  },
  (prev, next) => prev.row === next.row && prev.column?.key === next.column?.key,
) as React.FC<any>;

export function getCellFormatter(columnType: string, enableEdit: boolean, supportBlob: boolean) {
  if (isObjectColumn(columnType) && supportBlob) {
    return BlobFormatter;
  } else if (enableEdit) {
    return defaultFormatter;
  } else if (columnType.toLocaleLowerCase().indexOf('char') !== -1) {
    return TextFormatter;
  }
  return defaultFormatter;
}

function getEditor(columnType: string, dbMode: ConnectionMode) {
  const isOracle = dbMode === ConnectionMode.OB_ORACLE;
  switch (columnType) {
    case 'TIME':
    case 'TIME': {
      return TimeEditor;
    }
    case 'TIMESTAMP':
    case 'DATETIME': {
      if (isOracle) {
        return TextEditor;
      }
      return DateTimeEditor;
    }
    case 'TIMESTAMP_WITH_TIME_ZONE':
    case 'TIMESTAMP_WITH_LOCAL_TIME_ZONE': {
      return TextEditor;
    }
    case 'DATE': {
      if (isOracle) {
        return TextEditor;
        // return DateTimeEditor;
      }
      return DateEditor;
    }
    case 'YEAR': {
      return YearEditor;
    }
    case 'INT':
    case 'INT_UNSIGNED':
    case 'INTEGER':
    case 'NUMERIC':
    case 'NUMERIC_UNSIGNED':
    case 'NUMBER':
    case 'TINYINT':
    case 'TINYINT_UNSIGNED':
    case 'SMALLINT':
    case 'SMALLINT_UNSIGNED':
    case 'MEDIUMINT':
    case 'MEDIUMINT_UNSIGNED':
    case 'BIGINT':
    case 'BIGINT_UNSIGNED':
    case 'DECIMAL':
    case 'DECIMAL_UNSIGNED':
    case 'FLOAT':
    case 'FLOAT_UNSIGNED':
    case 'DOUBLE':
    case 'DOUBLE_UNSIGNED': {
      return InputNumberEditor;
    }
    default: {
      return TextEditor;
    }
  }
}

function getColumnWidth(columnName: string, columnType: string, rowLength: number) {
  const columnNameWidth = (columnName.length || 1) * 8 + 75;
  let columnTypeWidth = 0;

  const DEFAULT_WIDTH = rowLength ? rowLength * 7 + 30 : 80;

  switch (columnType) {
    case 'TIMESTAMP': {
      columnTypeWidth = 230;
      break;
    }
    case 'TIMESTAMP_WITH_TIME_ZONE': {
      columnTypeWidth = 300;
      break;
    }
    case 'TIMESTAMP_WITH_LOCAL_TIME_ZONE': {
      columnTypeWidth = 350;
      break;
    }
    case 'DATE':
    case 'TIME':
    case 'DATETIME':
    case 'TIME':
    case 'YEAR': {
      columnTypeWidth = 188;
      break;
    }
    default: {
      columnTypeWidth = DEFAULT_WIDTH;
    }
  }
  return Math.min(Math.max(columnTypeWidth, columnNameWidth), 600);
}
