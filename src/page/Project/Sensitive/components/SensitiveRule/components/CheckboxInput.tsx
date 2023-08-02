import { CheckboxInputProps } from '@/page/Project/Sensitive/interface';
import { formatMessage } from '@/util/intl';
import { Checkbox, Form, Input } from 'antd';
import { useState } from 'react';

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  name = [],
  hasLabel = false,
  checkValue = '',
  value,
  formRef,
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
  const handleLeastOneCheck = async (ruler, value) => {
    const { regExp: regExps } = await formRef.getFieldsValue();
    const map = [];
    for (let r in regExps) {
      map.push(regExps?.[r]?.checked?.length > 0);
    }
    if (!map.includes(true)) {
      return Promise.reject(
        formatMessage({
          id: 'odc.SensitiveRule.components.CheckboxInput.SelectAtLeastOneRecognition',
        }), //至少勾选一个识别对象
      );
    }
    return Promise.resolve();
  };

  return (
    <div style={{ display: 'flex' }}>
      <Form.Item
        required
        name={[...name, 'checked']}
        label={
          hasLabel &&
          formatMessage({ id: 'odc.SensitiveRule.components.CheckboxInput.IdentifyObjects' }) //识别对象
        }
        validateTrigger="onBlur"
        rules={[
          {
            message: formatMessage({
              id: 'odc.SensitiveRule.components.CheckboxInput.PleaseSelectTheIdentificationObject',
            }), //请先勾选识别对象
            validator: handleLeastOneCheck,
          },
        ]}
      >
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
      <Form.Item
        required
        name={[...name, 'regExp']}
        label={
          hasLabel &&
          formatMessage({ id: 'odc.SensitiveRule.components.CheckboxInput.RegularExpression' }) //正则表达式
        }
        validateTrigger="onBlur"
        rules={[
          {
            required: checked?.length > 0 || value?.checked?.length > 0,
            message: formatMessage({
              id: 'odc.SensitiveRule.components.CheckboxInput.EnterARegularExpression',
            }), //请填写正则表达式
          },
        ]}
      >
        <Input
          style={{
            width: '432px',
          }}
          value={value?.regExp || regExp}
          disabled={value?.checked?.length === 0 || false}
          onChange={onInputChange}
          placeholder={
            formatMessage({ id: 'odc.SensitiveRule.components.CheckboxInput.PleaseEnter' }) //请输入
          }
        />
      </Form.Item>
    </div>
  );
};

export default CheckboxInput;
