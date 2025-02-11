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

import { formatMessage } from '@/util/intl';
import { Input } from 'antd';
import { useEffect } from 'react';

interface IProps {
  isEditing: boolean;
  value?: string;
  onChange?: (v: string) => void;
}

export default function Password({ isEditing, value, onChange }: IProps) {
  useEffect(() => {
    if (isEditing) {
      onChange('');
    } else {
      onChange(null);
    }
  }, [isEditing]);

  return isEditing ? (
    <Input.Password
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="new-password"
      visibilityToggle={false}
      placeholder={formatMessage({
        id: 'odc.AddConnectionDrawer.AddConnectionForm.Enter',
        defaultMessage: '请输入',
      })}
    />
  ) : (
    <>
      <Input value="******" disabled />
    </>
  );
}
