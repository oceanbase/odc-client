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

import InputBigNumber from '@/component/InputBigNumber';
import { formatMessage } from '@/util/intl';
import { Input } from 'antd';
import React from 'react';

import styles from './index.less';

interface IRangeInput {
  value?: [string, string];
  onChange?: (value: [string, string]) => void;
  addonBefore?: string;
  max?: string;
  min?: string;
  isInt?: boolean;
}

const RangeInput: React.FC<IRangeInput> = (props) => {
  const { value, onChange, addonBefore, min, max, isInt } = props;
  return (
    <Input.Group
      style={{
        display: 'flex',
      }}
      compact
    >
      <div className={styles.title}>
        {
          addonBefore ||
            formatMessage({ id: 'odc.RuleContent.RangeInput.Interval', defaultMessage: '区间' }) // 区间
        }
      </div>
      <InputBigNumber
        type="number"
        isInt={isInt}
        min={min}
        value={value?.[0]}
        onChange={(v) => {
          onChange([v, value?.[1]]);
        }}
        style={{
          flexGrow: 1,
          flexShrink: 1,
        }}
        className={styles.startInput}
      />

      <Input placeholder="~" disabled className={styles.middleText} />
      <InputBigNumber
        type="number"
        isInt={isInt}
        max={max}
        value={value?.[1]}
        onChange={(v) => {
          onChange([value?.[0], v]);
        }}
        className={styles.endInput}
      />
    </Input.Group>
  );
};

export default RangeInput;
