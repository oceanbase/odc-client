import { Space } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './index.less';

type ValueType = boolean;

interface IProps {
  options: {
    label: string;
    value: ValueType;
  }[];
  value: ValueType;
  onChange: (v: ValueType) => void;
}

const CheckboxTag: React.FC<IProps> = function ({ options, value, onChange }) {
  return (
    <Space size={8} wrap>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <span
            className={classNames(styles.tag, {
              [styles.selected]: isSelected,
            })}
            key={index}
            onClick={(v) => {
              if (isSelected) {
                onChange(undefined);
              } else {
                onChange(option.value);
              }
            }}
          >
            {option.label}
          </span>
        );
      })}
    </Space>
  );
};

export default CheckboxTag;
