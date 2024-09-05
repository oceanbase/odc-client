import { Form, Radio } from 'antd';
import { ShardingStrategy } from '@/d.ts';

export const shardingStrategyOptions = [
  {
    label: '全表扫描',
    value: ShardingStrategy.FIXED_LENGTH,
  },
  {
    label: '条件匹配',
    value: ShardingStrategy.MATCH,
  },
];

const ShardingStrategyItem = () => {
  return (
    <Form.Item
      label="搜索策略"
      name="shardingStrategy"
      rules={[
        {
          required: true,
          message: '请选择搜索策略',
        },
      ]}
    >
      <Radio.Group options={shardingStrategyOptions} />
    </Form.Item>
  );
};

export default ShardingStrategyItem;
