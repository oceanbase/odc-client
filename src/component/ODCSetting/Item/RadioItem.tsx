import { Radio, RadioGroupProps } from 'antd';
import { useState } from 'react';

export default function RadioItem(props: {
  options: RadioGroupProps['options'];
  value: string;
  onChange: (value: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <Radio.Group
      options={props.options}
      key={props.value}
      defaultValue={props.value}
      disabled={loading}
      onChange={async (e) => {
        setLoading(true);
        try {
          await props.onChange(e.target.value);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
