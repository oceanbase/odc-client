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

import { InputNumber } from 'antd';
import { useState } from 'react';

export default function InputIntergerItem(props: {
  value: string;
  onChange: (value: string) => Promise<void>;
  min?: string;
  max?: string;
  unit?: string;
}) {
  const [loading, setLoading] = useState(false);
  const minValue = props?.min || '0';
  const maxValue = props?.max;

  return (
    <>
      <InputNumber
        min={minValue}
        max={maxValue}
        precision={0}
        style={{ width: 140 }}
        key={props.value}
        defaultValue={props.value}
        value={props.value}
        disabled={loading}
        onBlur={async (e) => {
          const value = e.target.value;
          setLoading(true);
          try {
            if (Number(value) < Number(minValue)) {
              await props.onChange(minValue);
            } else if (maxValue && Number(value) > Number(maxValue)) {
              await props.onChange(maxValue);
            } else {
              await props.onChange(value.replace(/[^0-9]/g, ''));
            }
          } finally {
            setLoading(false);
          }
        }}
      />
      {props.unit && <span>{props.unit}</span>}
    </>
  );
}
