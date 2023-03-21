import { formatMessage } from '@/util/intl';
import { Checkbox, Form } from 'antd';
import React from 'react';
import { TableColumn } from '../../interface';

interface IProps {
  column: TableColumn;
  onChange: (newColumn: TableColumn) => void;
}

const DataSync: React.FC<IProps> = function ({ column, onChange }) {
  const { currentTime } = column;
  return (
    <Form layout="vertical">
      <Form.Item
        label={formatMessage({
          id: 'odc.Columns.ColumnExtraInfo.DateSync.TimeSetting',
        })} /*时间设置*/
      >
        <Checkbox
          checked={!!currentTime}
          onChange={(e) => {
            const v = e.target.checked;
            onChange({
              ...column,
              currentTime: v,
            });
          }}
        >
          {
            formatMessage({
              id: 'odc.Columns.ColumnExtraInfo.DateSync.UpdateBasedOnTheCurrent',
            }) /*根据当前时间戳更新*/
          }
        </Checkbox>
      </Form.Item>
    </Form>
  );
};

export default DataSync;
