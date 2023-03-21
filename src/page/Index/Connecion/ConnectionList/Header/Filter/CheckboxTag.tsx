import { Space } from 'antd';
import classNames from 'classnames';
import { clone } from 'lodash';
import React from 'react';

import styles from './index.less';

type ValueType = string | number;

interface IProps {
  options: {
    label: string;
    value: ValueType;
  }[];
  value: ValueType[];
  onChange: (v: ValueType[]) => void;
}

const CheckboxTag: React.FC<IProps> = function ({ options, value, onChange }) {
  return (
    <Space size={8} wrap>
      {options.map((option) => {
        const isSelected = value?.includes?.(option.value);
        return (
          <span
            className={classNames(styles.tag, {
              [styles.selected]: isSelected,
            })}
            onClick={(v) => {
              let newValue = clone(value);
              if (isSelected) {
                let set = new Set(newValue);
                set.delete(option.value);
                onChange([...set]);
              } else {
                onChange([].concat(value).concat(option.value).filter(Boolean));
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
