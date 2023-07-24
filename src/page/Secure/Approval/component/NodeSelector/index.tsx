import type { IManagerIntegration, IManagerRole } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Select } from 'antd';
import { uniqBy } from 'lodash';

interface INodeSelectorProps {
  nodes: IManagerRole[] | IManagerIntegration[];
  name: string | any[];
  title: string;
  width?: string;
  selectedNodes?: {
    id: number;
    name: string;
  }[];
}

export const NodeSelector: React.FC<INodeSelectorProps> = (props) => {
  const { name, width = '200px', selectedNodes = [], title, nodes = [] } = props;
  const rource = selectedNodes?.filter((item) => item.name) ?? [];
  const options = uniqBy([...rource]?.concat([...nodes]), 'id')?.map((role) => {
    return {
      label: role.name,
      value: role.id,
      disabled: selectedNodes?.some((item) => item.id === role.id),
    };
  });
  const message = formatMessage(
    {
      id: 'odc.component.NodeSelector.SelectTitle',
    },
    { title: title },
  ); //`请选择${title}`
  const placeholder = formatMessage(
    {
      id: 'odc.component.NodeSelector.SelectTitle',
    },
    { title: title },
  ); //`请选择${title}`
  return (
    <Form.Item
      name={name}
      validateTrigger={['onChange', 'onBlur']}
      rules={[
        {
          required: true,
          message,
        },
      ]}
      noStyle
    >
      <Select
        placeholder={placeholder}
        style={{ width }}
        options={options}
        showSearch={true}
        filterOption={(value, option) => {
          return (option?.label as string)?.indexOf(value) >= 0;
        }}
      />
    </Form.Item>
  );
};
