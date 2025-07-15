import React, { useState } from 'react';
import { Checkbox } from 'antd';

interface CheckboxOption {
  label: string;
  value: string;
}

interface CheckboxItemProps {
  options: CheckboxOption[];
  value?: string[];
  onChange?: (value: string[]) => Promise<void>;
}

export default function CheckboxItem(props: CheckboxItemProps) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (checkedValues: string[]) => {
    if (props.onChange) {
      setLoading(true);
      try {
        await props.onChange(checkedValues);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Checkbox.Group
      options={props.options}
      value={props.value || []}
      disabled={loading}
      onChange={handleChange}
    />
  );
}
