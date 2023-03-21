import { formatMessage } from '@/util/intl';
import { Form, Input } from 'antd';
import { isNil } from 'lodash';
import React, { useContext, useMemo } from 'react';
import TablePageContext from '../../../TablePage/context';
import { TableColumn } from '../../interface';

interface IProps {
  column: TableColumn;
  originColumns: TableColumn[];
  onChange: (newColumn: TableColumn) => void;
}

const DefaultValue: React.FC<IProps> = function ({ column, originColumns, onChange }) {
  const { defaultValueOrExpr } = column;
  const pageContext = useContext(TablePageContext);
  let enable = useMemo(() => {
    if (!pageContext.editMode || isNil(column.ordinalPosition)) {
      /**
       * 与自增列互斥
       */
      if (column.autoIncrement) {
        return false;
      }
      return true;
    }
    const originData = originColumns?.find((c) => c.ordinalPosition === column.ordinalPosition);
    /**
     * 编辑状态下，非自增，非虚拟列才可以编辑
     */
    return !originData?.generated && !originData?.autoIncrement;
  }, [pageContext.editMode, column, originColumns]);

  return (
    <Form layout="vertical">
      <Form.Item
        label={formatMessage({
          id: 'odc.CreateTable.Columns.columns.DefaultValueExpression',
        })}
      >
        <Input
          disabled={!enable}
          style={{ width: 175 }}
          value={defaultValueOrExpr}
          onChange={(v) => {
            onChange({
              ...column,
              defaultValueOrExpr: v.target.value,
            });
          }}
        />
      </Form.Item>
    </Form>
  );
};

export default DefaultValue;
