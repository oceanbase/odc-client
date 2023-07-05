import { IMaskRule } from '@/d.ts';
import { getMaskTypesMap } from '@/page/Project/Setting/Algorithm';
import { formatMessage } from '@/util/intl';
import { Form, Input, Select, Space, Typography } from 'antd';
import React from 'react';
import styles from './index.less';

interface IProps {
  rules: IMaskRule[];
  name: string;
}

const SelectCell: React.FC<IProps> = (props) => {
  const { rules, name: nameKey } = props;
  const maskTypesMap = getMaskTypesMap();
  const options = rules?.map(({ name, type, id }) => ({
    label: (
      <span className={styles.nameLabel} data-name={name}>
        <Typography.Text ellipsis>{name}</Typography.Text>
        <Typography.Text type="secondary">{maskTypesMap[type]}</Typography.Text>
      </span>
    ),
    value: id,
  }));

  return (
    <Form.Item
      name={[nameKey, 'id']}
      noStyle
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'odc.component.MaskPolicyManager.editableCell.SelectADesensitizationRule',
          }), //请选择脱敏规则
        },
      ]}
    >
      <Select
        options={options}
        placeholder={formatMessage({
          id: 'odc.component.MaskPolicyManager.editableCell.SelectADesensitizationRule',
        })} /*请选择脱敏规则*/
        style={{ width: '100%' }}
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.label.props['data-name']?.toLowerCase()?.includes(input.toLowerCase());
        }}
        showSearch
      />
    </Form.Item>
  );
};

const InputCell: React.FC<{
  name: string;
}> = (props) => {
  const { name } = props;
  return (
    <Space direction="vertical" className={styles.input} size={4}>
      <Form.Item
        noStyle
        name={[name, 'includes']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.component.MaskPolicyManager.editableCell.EnterAMatchingRule',
            }), //请输入匹配规则
          },
        ]}
      >
        <Input
          addonBefore={formatMessage({
            id: 'odc.component.MaskPolicyManager.editableCell.Match',
          })} /*匹配*/
        />
      </Form.Item>
      <Form.Item noStyle name={[name, 'excludes']}>
        <Input
          addonBefore={formatMessage({
            id: 'odc.component.MaskPolicyManager.editableCell.Exclude',
          })} /*排除*/
        />
      </Form.Item>
    </Space>
  );
};

export const EditableCell = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  rules,
  children,
  ...restProps
}) => {
  const inputNode =
    dataIndex === 'name' ? (
      <SelectCell rules={rules} name={record?.key} />
    ) : (
      <InputCell name={record?.key} />
    );
  return <td {...restProps}>{editing ? <Form.Item>{inputNode}</Form.Item> : children}</td>;
};
