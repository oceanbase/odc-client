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
          addonBefore || formatMessage({ id: 'odc.RuleContent.RangeInput.Interval' }) // 区间
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
