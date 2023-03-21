import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space } from 'antd';
import React, { useState } from 'react';

export const operationOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormAutoAuthModal.conditionSelect.Include',
    }), //包含
    value: 'contains',
  },
  {
    label: formatMessage({
      id: 'odc.components.FormAutoAuthModal.conditionSelect.Match',
    }), //匹配
    value: 'matches',
  },
  {
    label: formatMessage({
      id: 'odc.components.FormAutoAuthModal.conditionSelect.Equal',
    }), //等于
    value: 'equals',
  },
];

interface IProps {
  variables: string[];
}

const ConditionSelect: React.FC<IProps> = (props) => {
  const [isRequired, setIsRequired] = useState(true);
  const { variables } = props;
  const variablesOptions = variables?.map((item) => ({
    label: item,
    value: item,
  }));

  // 有效性校验
  const handleValidator = async (_, values) => {
    let itemRequired = false;
    if (!values?.length) {
      return Promise.resolve();
    }
    const validValues = values?.filter((item) => {
      // 每一项均不是空值
      return Object.values(item)?.every((value) => value);
    });
    const invalidValues = values?.filter((item) => {
      const _values = Object.values(item);
      if (!_values.length) {
        return false;
      }
      // 包含空值 && 不是所有筛选项为空
      return _values?.some((value) => !value) && !_values?.every((value) => !value);
    });

    if (!validValues.length || invalidValues.length) {
      itemRequired = true;
    }
    setIsRequired(itemRequired);
    return itemRequired ? Promise.reject(new Error()) : Promise.resolve();
  };

  return (
    <Form.List
      name="conditions"
      rules={[
        {
          validator: handleValidator,
        },
      ]}
    >
      {(fields, { add, remove }) => {
        return (
          <>
            {fields.map(({ key, name, fieldKey }: any) => (
              <Space key={key} align="baseline">
                <Form.Item
                  name={[name, 'object']}
                  fieldKey={[fieldKey, 'object']}
                  style={{ width: '97px' }}
                  rules={[
                    {
                      required: isRequired,
                      message: formatMessage({
                        id: 'odc.components.FormAutoAuthModal.conditionSelect.PleaseSelect',
                      }), //请选择
                    },
                  ]}
                >
                  <Select options={variablesOptions} />
                </Form.Item>
                <Form.Item
                  name={[name, 'expression']}
                  fieldKey={[fieldKey, 'expression']}
                  style={{ width: '312px' }}
                  rules={[
                    {
                      required: isRequired,
                      message: formatMessage({
                        id: 'odc.components.FormAutoAuthModal.conditionSelect.PleaseEnter',
                      }), //请输入
                    },
                  ]}
                >
                  <Input
                    placeholder={formatMessage({
                      id: 'odc.components.FormAutoAuthModal.conditionSelect.EnterAnIndexKeySuch',
                    })} /*请输入索引键，如 dept[0].deptname*/
                  />
                </Form.Item>
                <Form.Item
                  name={[name, 'operation']}
                  fieldKey={[fieldKey, 'operation']}
                  style={{ width: '80px' }}
                  rules={[
                    {
                      required: isRequired,
                      message: formatMessage({
                        id: 'odc.components.FormAutoAuthModal.conditionSelect.PleaseSelect',
                      }), //请选择
                    },
                  ]}
                >
                  <Select options={operationOptions} />
                </Form.Item>
                <Form.Item
                  name={[name, 'value']}
                  fieldKey={[fieldKey, 'value']}
                  style={{ width: '120px' }}
                  rules={[
                    {
                      required: isRequired,
                      message: formatMessage({
                        id: 'odc.components.FormAutoAuthModal.conditionSelect.PleaseEnter',
                      }), //请输入
                    },
                  ]}
                >
                  <Input
                    placeholder={formatMessage({
                      id: 'odc.components.FormAutoAuthModal.conditionSelect.EnterAValue',
                    })} /*请输入值*/
                  />
                </Form.Item>
                <DeleteOutlined
                  onClick={() => {
                    remove(name);
                  }}
                />
              </Space>
            ))}

            <Form.Item style={{ marginBottom: 0, width: '630px' }}>
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    object: undefined,
                    expression: undefined,
                    operation: undefined,
                    value: undefined,
                  })
                }
                block
                icon={<PlusOutlined />}
              >
                {
                  formatMessage({
                    id: 'odc.components.FormAutoAuthModal.conditionSelect.Add',
                  }) /*添加*/
                }
              </Button>
            </Form.Item>
          </>
        );
      }}
    </Form.List>
  );
};

export default ConditionSelect;
