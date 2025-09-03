import { formatMessage } from '@/util/intl';
import { Checkbox, CheckboxChangeEvent, Form, FormInstance, Radio, Space } from 'antd';
import { ShardingStrategy } from '@/d.ts';
import { useState, useEffect, useMemo } from 'react';

interface IProps {
  form: FormInstance;
}

const ShardingStrategyItem: React.FC<IProps> = ({ form }) => {
  const [fullTableSearch, setFullTableSearch] = useState<boolean>(
    form.getFieldValue('shardingStrategy') === ShardingStrategy.FIXED_LENGTH,
  );
  const handleChange = (e: CheckboxChangeEvent) => {
    form.setFieldsValue({
      shardingStrategy: e.target.checked ? ShardingStrategy.FIXED_LENGTH : ShardingStrategy.MATCH,
    });
    setFullTableSearch(e.target.checked);
  };

  return (
    <Form.Item
      extra={formatMessage({
        id: 'src.component.Task.component.ShardingStrategyItem.B6EB2F37',
        defaultMessage: '若使用全表扫描方式进行数据搜索，处理过程将更加稳定但性能可能会受到影响',
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
      <Checkbox checked={fullTableSearch} onChange={handleChange}>
        {formatMessage({
          id: 'src.component.Task.component.ShardingStrategyItem.61BD0252',
          defaultMessage: '通过全表扫描进行数据搜索',
        })}
      </Checkbox>
    </Form.Item>
  );
};

export default ShardingStrategyItem;
