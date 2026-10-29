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

import React, { useState } from 'react';
import { Checkbox } from 'antd';

interface CheckboxOption {
  label: string;
  value: string;
}

interface CheckboxItemProps {
  options: CheckboxOption[];
  value?: string[];
  onChange?: (value: string[]) => Promise<void>;
}

export default function CheckboxItem(props: CheckboxItemProps) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (checkedValues: string[]) => {
    if (props.onChange) {
      setLoading(true);
      try {
        await props.onChange(checkedValues);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Checkbox.Group
      options={props.options}
      value={props.value || []}
      disabled={loading}
      onChange={handleChange}
    />
  );
}
