import { Form, Radio } from 'antd';
import { DropPartiotionOptions } from '../../const';

const DropPartiotion = () => {
  return (
    <Form.Item
      label="清理策略"
      name="dropPartition"
      rules={[
        {
          required: true,
          message: '请选择清理策略',
        },
      ]}
    >
      <Radio.Group options={DropPartiotionOptions} />
    </Form.Item>
  );
};

export default DropPartiotion;
