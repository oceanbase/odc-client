/*
 * Copyright 2024 OceanBase
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
