import { Input } from 'antd';
import React, { forwardRef } from 'react';

interface IProps {
  placeholder: string;
  baseWidth?: number;
  disabled?: boolean;
  value?: any;
  onChange?: any;
}

const UserInput: React.FC<IProps> = forwardRef(function (props, ref) {
  const { placeholder, disabled, baseWidth, value, onChange } = props;

  return (
    <Input
      ref={ref as any}
      autoComplete="new-user"
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={onChange}
      style={
        baseWidth
          ? {
              width: baseWidth,
            }
          : null
      }
    />
  );
});

export default UserInput;
