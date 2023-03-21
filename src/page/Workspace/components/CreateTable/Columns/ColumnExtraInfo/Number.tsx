import { formatMessage } from '@/util/intl';
import { Checkbox, Form, Typography } from 'antd';

export default function ({ column, onChange }) {
  const configValue = [];
  if (column.unsigned) {
    configValue.push('unsigned');
  }
  if (column.zerofill) {
    configValue.push('zerofill');
  }
  return (
    <Form layout="vertical">
      <Typography.Text type="secondary">
        {
          formatMessage({
            id: 'odc.Columns.ColumnExtraInfo.Number.OnlyOneAutoIncrementField',
          }) /*每个表仅设置一个自增字段*/
        }
      </Typography.Text>
      <Form.Item
        label={formatMessage({
          id: 'odc.Columns.ColumnExtraInfo.Number.ValueSetting',
        })} /*数值设置*/
      >
        <Checkbox.Group
          value={configValue}
          onChange={(checkedValues) => {
            onChange({
              ...column,
              unsigned: checkedValues.includes('unsigned'),
              zerofill: checkedValues.includes('zerofill'),
            });
          }}
          options={[
            {
              label: formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Number.Unsigned',
              }), //无符号
              value: 'unsigned',
            },

            {
              label: formatMessage({
                id: 'odc.Columns.ColumnExtraInfo.Number.FillZero',
              }), //填充零
              value: 'zerofill',
            },
          ]}
        />
      </Form.Item>
    </Form>
  );
}
