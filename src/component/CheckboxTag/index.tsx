/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
