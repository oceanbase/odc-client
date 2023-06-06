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
        <Form.Item label={label} name={name}>
          <Input />
        </Form.Item>
      );
    }
    case ComponentType.INPUT_NUMBER: {
      return (
        <Form.Item label={label} name={name}>
          <InputNumber defaultValue={defaultValue} />
        </Form.Item>
      );
    }
    case ComponentType.RADIO: {
      return (
        <Form.Item label={label} name={name}>
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
        <Form.Item label={label} name={name}>
          <Select />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_MULTIPLE: {
      // const options = candidates.map((candidate) => {
      //   return {
      //     value: candidate,
      //     label: candidate,
      //   };
      // });
      // console.log(defaultValue, options);
      return (
        <Form.Item label={label} name={name}>
          <Select mode="multiple" options={options} defaultValue={defaultValue} />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_TAGS: {
      // const options = candidates.map((candidate) => {
      //   return {
      //     value: candidate,
      //     label: candidate,
      //   };
      // });
      return (
        <Form.Item label={label} name={name}>
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
