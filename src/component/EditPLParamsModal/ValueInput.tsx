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

import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { MenuOutlined } from '@ant-design/icons';
import { Dropdown, Input } from 'antd';
import React, { useMemo } from 'react';

interface IProps {
  value?: string;
  connectionMode?: ConnectionMode;
  onChange?: (v: string) => void;
}

export const ValueList = {
  DEFAULT: Symbol('default').toString(),
  NULL: Symbol('null').toString(),
};

const ValueInput: React.FC<IProps> = function ({ value, connectionMode, onChange }) {
  const isOracle = connectionMode === ConnectionMode.OB_ORACLE;
  value = value === null ? ValueList.NULL : value;
  const [inputValue, inputPlaceholder, menuValue] = useMemo(() => {
    const menuObj = Object.entries(ValueList).find(([key, _value]) => _value === value);
    return menuObj ? [null, menuObj[0], value] : [value, null, null];
  }, [value]);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Input
        placeholder={inputPlaceholder}
        value={inputValue}
        bordered={false}
        style={{ flex: 1 }}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />

      <Dropdown
        menu={{
          accessKey: menuValue,
          onClick: (info) => {
            if (info.key === 'empty') {
              onChange('');
            } else {
              onChange(info.key);
            }
          },
          items: [
            isOracle && {
              key: ValueList.DEFAULT,
              label: formatMessage({
                id: 'odc.component.EditPLParamsModal.ValueInput.SetToNull',
              }),
            },
            {
              key: ValueList.NULL,
              label: formatMessage({
                id: 'odc.component.EditPLParamsModal.ValueInput.SetToNull',
              }),
            },
            !isOracle && {
              key: 'empty',
              label: formatMessage({
                id: 'odc.component.EditPLParamsModal.ValueInput.SetToAnEmptyString',
              }),
            },
          ].filter(Boolean),
        }}
      >
        <MenuOutlined
          style={{
            padding: '2px 4px',
          }}
        />
      </Dropdown>
    </div>
  );
};

export default ValueInput;
