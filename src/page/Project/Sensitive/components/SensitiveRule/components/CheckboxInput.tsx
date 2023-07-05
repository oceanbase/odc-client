import { CheckboxInputProps } from '@/page/Project/Sensitive/interface';
import { Checkbox, Form, Input } from 'antd';
import { useState } from 'react';

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  name = [],
  hasLabel = false,
  checkValue = '',
  value,
  onChange,
}) => {
  const [checked, setChecked] = useState<string[]>([]);
  const [regExp, setRegExp] = useState<string>('');
  const triggerChange = (changedValue: { checked?: string[]; regExp?: string }) => {
    onChange?.({
      checked,
      regExp,
      ...value,
      ...changedValue,
    });
  };
  const onCheckboxChange = (checkedValue: string[]) => {
    setChecked(checkedValue);
    triggerChange({
      checked: checkedValue || [],
    });
  };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegExp(e.target.value);
    triggerChange({
      regExp: e.target.value || '',
    });
  };
  return (
    <div style={{ display: 'flex' }}>
      <Form.Item required name={[...name, 'checked']} label={hasLabel && '识别对象'}>
        <Checkbox.Group
          value={value?.checked || checked}
          onChange={onCheckboxChange}
          style={{
            width: '100px',
          }}
        >
          <Checkbox value={checkValue}>{value?.label}</Checkbox>
        </Checkbox.Group>
      </Form.Item>
      <Form.Item required name={[...name, 'regExp']} label={hasLabel && '正则表达式'}>
        <Input
          style={{
            width: '432px',
          }}
          value={value?.regExp || regExp}
          disabled={value?.checked?.length === 0 || false}
          onChange={onInputChange}
          placeholder={'请输入'}
        />
      </Form.Item>
    </div>
  );
};

export default CheckboxInput;
