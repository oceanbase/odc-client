import { Radio, RadioGroupProps, Select, SelectProps } from 'antd';
import { useState } from 'react';

export default function SelectItem(props: {
  options: SelectProps['options'];
  value: string;
  onChange: (value: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <Select
      style={{ width: 140 }}
      options={props.options}
      key={props.value}
      defaultValue={props.value}
      disabled={loading}
      loading={loading}
      onChange={async (value) => {
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
