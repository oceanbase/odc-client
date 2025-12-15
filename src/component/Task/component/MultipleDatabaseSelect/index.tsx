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

import SessionDropdown, {
  ISessionDropdownFiltersProps,
} from '@/page/Workspace/components/SessionContextWrap/SessionSelect/SessionDropdown';
import React, { useState } from 'react';
import { Divider, Select, Space, Form } from 'antd';
import { formatMessage } from '@/util/intl';
import { DEFALT_WIDTH } from '@/page/Workspace/components/SessionContextWrap/SessionSelect/const';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';

interface IProps {
  width?: number | string;
  selectWidth?: number | string;
  projectId?: number;
  dataSourceId?: number;
  filters?: ISessionDropdownFiltersProps;
  placeholder?: string;
  disabled?: boolean;
  datasourceMode?: boolean;
  onSelect?: (Ids: React.Key[]) => void;
  onChange?: (Ids: React.Key) => void;
  onClear?: () => void;
  label: string;
  name: string;
  isAdaptiveWidth?: boolean;
}

const MultipleDatabaseSelect: React.FC<IProps> = (props) => {
  const {
    projectId,
    dataSourceId,
    filters = null,
    onSelect,
    onClear,
    onChange,
    isAdaptiveWidth,
    label,
    name,
    width,
    selectWidth,
    placeholder = formatMessage({
      id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.66A17FFD',
      defaultMessage: '请选择',
    }),
    disabled = false,
  } = props;

  const [options, setOptions] = useState<SelectItemProps[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  return (
    <SessionDropdown
      projectId={projectId}
      dataSourceId={dataSourceId}
      filters={filters}
      width={width || DEFALT_WIDTH}
      disabled={disabled}
      checkModeConfig={{
        onSelect,
        checkedKeys,
        setOptions,
        setCheckedKeys,
      }}
    >
      <Space
        direction="vertical"
        size={24}
        style={{ width: isAdaptiveWidth ? '100%' : selectWidth, height: '100%' }}
      >
        <Form.Item
          label={label}
          name={name}
          style={{ marginBottom: '0px' }}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.component.DatabaseSelect.SelectADatabase',
                defaultMessage: '请选择数据库',
              }), //请选择数据库
            },
          ]}
        >
          <Select
            mode="multiple"
            options={options}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(value) => {
              setCheckedKeys(value);
              onChange?.(value);
            }}
            style={{ width: '100%' }}
            open={false}
            maxTagCount="responsive"
            allowClear
            onClear={onClear}
          />
        </Form.Item>
      </Space>
    </SessionDropdown>
  );
};

export default MultipleDatabaseSelect;
