import { ComponentType, PropertyMetadata } from '@/d.ts/rule';
import { Form, Input, InputNumber, Radio, Select } from 'antd';

interface EditPropertyComponentMapProps {
  propertyMetadata: PropertyMetadata;
  label: string;
  options?: {
    value: string;
    label: string;
  }[];
}

const EditPropertyComponentMap: React.FC<EditPropertyComponentMapProps> = ({
  propertyMetadata,
  label,
  options,
}) => {
  const name = 'activeKey';
  const { componentType, candidates = [], defaultValue, type } = propertyMetadata;
  switch (componentType) {
    case ComponentType.INPUT_STRING: {
      return (
        <Form.Item label={label} name={name} rules={[
          {
            required: true,
            message: `请输入${label}`
          }
        ]}>
          <Input />
        </Form.Item>
      );
    }
    case ComponentType.INPUT_NUMBER: {
      return (
        <Form.Item label={label} name={name} rules={[
          {
            required: true,
            message: `请输入${label}`
          }
        ]}>
          <InputNumber defaultValue={defaultValue} />
        </Form.Item>
      );
    }
    case ComponentType.RADIO: {
      return (
        <Form.Item label={label} name={name} rules={[
          {
            required: true,
            message: `请选择${label}`
          }
        ]}>
          <Radio.Group defaultValue={defaultValue}>
            {candidates.map((candidate, index) => {
              return (
                <Radio value={candidate} key={index}>
                  {String(candidate)}
                </Radio>
              );
            })}
          </Radio.Group>
        </Form.Item>
      );
    }
    case ComponentType.SELECT_SINGLE: {
      return (
        <Form.Item label={label} name={name} rules={[
          {
            required: true,
            message: `请选择${label}`
          }
        ]}>
          <Select />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_MULTIPLE: {
      return (
        <Form.Item label={label} name={name} rules={[
          {
            required: true,
            message: `请选择${label}`
          }
        ]}>
          <Select mode="multiple" options={options} defaultValue={defaultValue} />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_TAGS: {
      return (
        <Form.Item label={label} name={name} rules={[
          {
            required: true,
            message: `请选择${label}`
          }
        ]}>
          <Select mode="tags" options={options} defaultValue={defaultValue} />
        </Form.Item>
      );
    }
    default: {
      return null;
    }
  }
};

export default EditPropertyComponentMap;
