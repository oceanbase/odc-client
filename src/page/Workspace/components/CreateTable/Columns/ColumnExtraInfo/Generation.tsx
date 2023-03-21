import { formatMessage } from '@/util/intl';
import { Form, Radio } from 'antd';
import React from 'react';
import { TableColumn } from '../../interface';

interface IProps {
  column: TableColumn;
  onChange: (newColumn: TableColumn) => void;
}

const Generation: React.FC<IProps> = function ({ column, onChange }) {
  return (
    <Form layout="vertical">
      <Form.Item
        label={formatMessage({
          id: 'odc.Columns.ColumnExtraInfo.Generation.VirtualColumnSettings',
        })} /*虚拟列设置*/
      >
        <Radio.Group
          value={!!column.stored}
          onChange={(e) => {
            const v = e.target.value;
            onChange({
              ...column,
              stored: v,
            });
          }}
        >
          <Radio value={false}>
            {
              formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Generation.NoStorage',
              }) /*不存储*/
            }
          </Radio>
          <Radio value={true}>
            {
              formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Generation.Storage',
              }) /*存储*/
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  );
};
export default Generation;
