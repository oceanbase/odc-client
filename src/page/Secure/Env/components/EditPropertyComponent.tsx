import { ComponentType, PropertyMetadata } from '@/d.ts/rule';
import { formatMessage } from '@/util/intl';
import { Form, Input, InputNumber, Radio, Select } from 'antd';

interface EditPropertyComponentMapProps {
  propertyMetadata: PropertyMetadata;
  label: string;
  index: number;
  initData: any;
  description: string;
}

const EditPropertyComponentMap: React.FC<EditPropertyComponentMapProps> = ({
  propertyMetadata,
  index,
  label,
  initData,
  description = '',
}) => {
  const name = `activeKey${index}`;
  const option = `options${index}`;
  const { componentType = '', candidates = [], defaultValue, type } = propertyMetadata;
  switch (componentType) {
    case ComponentType.INPUT_STRING: {
      return (
        <Form.Item label={label} name={name} tooltip={description}>
          <Input placeholder="请输入" />
        </Form.Item>
      );
    }
    case ComponentType.INPUT_NUMBER: {
      return (
        <Form.Item
          label={label}
          name={name}
          rules={[
            {
              required: true,
              message: formatMessage(
                {
                  id: 'odc.Env.components.EditPropertyComponent.EnterLabel',
                },
                { label: label },
              ), //`请输入${label}`
            },
          ]}
          tooltip={description}
        >
          <InputNumber defaultValue={defaultValue} min={0} placeholder="请输入" />
        </Form.Item>
      );
    }
    case ComponentType.RADIO: {
      return (
        <Form.Item
          label={label}
          name={name}
          rules={[
            {
              required: true,
              message: formatMessage(
                {
                  id: 'odc.Env.components.EditPropertyComponent.SelectLabel',
                },
                { label: label },
              ), //`请选择${label}`
            },
          ]}
          tooltip={description}
        >
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
        <Form.Item label={label} name={name} tooltip={description}>
          <Select options={initData?.[option] || []} placeholder="请选择" />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_MULTIPLE: {
      return (
        <Form.Item label={label} name={name} tooltip={description}>
          <Select
            mode="multiple"
            maxTagCount="responsive"
            options={initData?.[option] || []}
            defaultValue={defaultValue}
            placeholder="请选择"
          />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_TAGS: {
      return (
        <Form.Item label={label} name={name} tooltip={description}>
          <Select
            mode="tags"
            maxTagCount="responsive"
            options={initData?.[option] || []}
            defaultValue={defaultValue}
            placeholder="请选择"
          />
        </Form.Item>
      );
    }
    default: {
      return null;
    }
  }
};

export default EditPropertyComponentMap;
