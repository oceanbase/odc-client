import { IConnectionType } from '@/d.ts';
import { Space } from 'antd';
import React from 'react';

type ValueType = IConnectionType;

interface IProps {
  options: { value: ValueType; label: string }[];
  value: ValueType;
  onChange: (v: ValueType) => void;
}

const TitleRadio: React.FC<IProps> = function ({ value, options, onChange }) {
  return (
    <Space size={24}>
      {options.map(({ value: _value, label }) => {
        const isSelected = _value === value;
        return (
          <div
            key={_value}
            style={{
              fontSize: 16,
              fontWeight: isSelected ? 600 : 'normal',
              color: isSelected ? 'var(--text-color-primary)' : 'var(--text-color-hint)',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (isSelected) {
                return;
              }
              onChange(_value);
            }}
          >
            {label}
          </div>
        );
      })}
    </Space>
  );
};

export default TitleRadio;
