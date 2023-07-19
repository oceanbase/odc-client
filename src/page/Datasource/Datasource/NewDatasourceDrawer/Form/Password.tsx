import { formatMessage } from '@/util/intl';
import { Input } from 'antd';
import { useEffect } from 'react';

interface IProps {
  isEditing: boolean;
  value?: string;
  onChange?: (v: string) => void;
}

export default function Password({ isEditing, value, onChange }: IProps) {
  useEffect(() => {
    if (isEditing) {
      onChange('');
    } else {
      onChange(null);
    }
  }, [isEditing]);

  return isEditing ? (
    <Input.Password
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="new-password"
      visibilityToggle={false}
      placeholder={formatMessage({
        id: 'odc.AddConnectionDrawer.AddConnectionForm.Enter',
      })}
    />
  ) : (
    <>
      <Input value="******" disabled />
    </>
  );
}
