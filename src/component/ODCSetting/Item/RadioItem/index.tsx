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

import { QuestionCircleOutlined } from '@@node_modules/@ant-design/icons/lib';
import { Radio, RadioGroupProps, Tooltip } from 'antd';
import { useState } from 'react';
import styles from './index.less';

export default function RadioItem(props: {
  options: RadioGroupProps['options'];
  value: string;
  onChange: (value: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <Radio.Group
      key={props.value}
      options={props.options}
      value={props.value}
      disabled={loading}
      onChange={async (e) => {
        setLoading(true);
        try {
          await props.onChange(e.target.value);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}

export const RadioWithTooltip = ({ label, title }) => {
  return (
    <>
      <span className={styles.label}>{label}</span>
      <Tooltip title={title}>
        <QuestionCircleOutlined style={{ color: 'var(--icon-color-normal)' }} />
      </Tooltip>
    </>
  );
};
