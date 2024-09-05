import { formatMessage } from '@/util/intl';
import { Form, Radio } from 'antd';
import { ShardingStrategy } from '@/d.ts';

export const shardingStrategyOptions = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.ShardingStrategyItem.E5A6B481',
      defaultMessage: '全表扫描',
    }),
    value: ShardingStrategy.FIXED_LENGTH,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.ShardingStrategyItem.F91EEC6C',
      defaultMessage: '条件匹配',
    }),
    value: ShardingStrategy.MATCH,
  },
];

const ShardingStrategyItem = () => {
  return (
    <Form.Item
      label={formatMessage({
        id: 'src.component.Task.component.ShardingStrategyItem.3BD95C1A',
        defaultMessage: '搜索策略',
      })}
      name="shardingStrategy"
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'src.component.Task.component.ShardingStrategyItem.D5F45B7A',
            defaultMessage: '请选择搜索策略',
          }),
        },
      ]}
    >
      <Radio.Group options={shardingStrategyOptions} />
    </Form.Item>
  );
};

export default ShardingStrategyItem;
