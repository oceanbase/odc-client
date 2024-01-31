import { Input, Radio, RadioGroupProps } from 'antd';
import { useState } from 'react';

export default function TextAreaItem(props: {
  value: string;
  onChange: (value: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <Input.TextArea
      autoSize={{ minRows: 3, maxRows: 8 }}
      allowClear
      style={{ width: '400px' }}
      key={props.value}
      defaultValue={props.value}
      disabled={loading}
      onBlur={async (e) => {
        const value = e.target.value;
        setLoading(true);
        try {
          await props.onChange(value);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
