import { ComponentType, PropertyMetadata } from '@/d.ts/rule';
import { Form, Input, InputNumber, Radio, Select } from 'antd';

const ViewPropertyComponentMap: React.FC<{ propertyMetadata: PropertyMetadata }> = ({
  propertyMetadata,
}) => {
  const { componentType, candidates = [], defaultValue, type } = propertyMetadata;
  switch (componentType) {
    case ComponentType.INPUT_STRING: {
      return (
        <Form.Item>
          <Input />
        </Form.Item>
      );
    }
    case ComponentType.INPUT_NUMBER: {
      return (
        <Form.Item>
          <InputNumber defaultValue={defaultValue} />
        </Form.Item>
      );
    }
    case ComponentType.RADIO: {
      return (
        <Form.Item>
          <Radio.Group defaultValue={defaultValue}>
            {candidates.map((candidate, index) => (
              <Radio value={candidate} key={index}>
                {'' + candidate}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      );
    }
    case ComponentType.SELECT_SINGLE: {
      return (
        <Form.Item>
          <Select />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_MULTIPLE: {
      const options = candidates.map((candidate) => {
        return {
          value: candidate,
          label: candidate,
        };
      });
      return (
        <Form.Item>
          <Select mode="multiple" options={options} defaultValue={defaultValue} />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_TAGS: {
      const options = candidates.map((candidate) => {
        return {
          value: candidate,
          label: candidate,
        };
      });
      return (
        <Form.Item>
          <Select mode="tags" options={options} defaultValue={defaultValue} />
        </Form.Item>
      );
    }
    default: {
      return null;
    }
  }
};

export default ViewPropertyComponentMap;
