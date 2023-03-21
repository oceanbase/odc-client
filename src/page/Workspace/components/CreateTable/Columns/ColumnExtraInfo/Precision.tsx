import InputBigNumber from '@/component/InputBigNumber';
import { formatMessage } from '@/util/intl';
import { Form } from 'antd';
import React from 'react';
import { TableColumn } from '../../interface';

interface IProps {
  column: TableColumn;
  onChange: (newColumn: TableColumn) => void;
  secondPrecision?: boolean;
  dayPrecision?: boolean;
  yearPrecision?: boolean;
}

const Precision: React.FC<IProps> = function ({
  column,
  secondPrecision,
  dayPrecision,
  yearPrecision,
  onChange,
}) {
  return (
    <Form layout="vertical">
      {secondPrecision && (
        <Form.Item
          label={formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Precision.SecondPrecision',
          })} /*秒精度*/
        >
          <InputBigNumber
            style={{ width: 175 }}
            value={column.secondPrecision}
            onChange={(v) => {
              onChange({
                ...column,
                secondPrecision: v,
              });
            }}
          />
        </Form.Item>
      )}

      {dayPrecision && (
        <Form.Item
          label={formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Precision.DayPrecision',
          })} /*天精度*/
        >
          <InputBigNumber
            style={{ width: 175 }}
            value={column.dayPrecision}
            onChange={(v) => {
              onChange({
                ...column,
                dayPrecision: v,
              });
            }}
          />
        </Form.Item>
      )}

      {yearPrecision && (
        <Form.Item
          label={formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Precision.AnnualAccuracy',
          })} /*年精度*/
        >
          <InputBigNumber
            style={{ width: 175 }}
            value={column.yearPrecision}
            onChange={(v) => {
              onChange({
                ...column,
                yearPrecision: v,
              });
            }}
          />
        </Form.Item>
      )}
    </Form>
  );
};

export default Precision;
