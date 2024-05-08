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

import { Select, SelectProps } from 'antd';
import { useState } from 'react';

export default function SelectItem(props: {
  options: SelectProps['options'];
  value: string;
  onChange: (value: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <Select
      style={{ width: 140 }}
      options={props.options}
      key={props.value}
      defaultValue={props.value}
      disabled={loading}
      loading={loading}
      onChange={async (value) => {
        setLoading(true);
        try {
          await props.onChange(value);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
