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

import { TaskType } from '@/d.ts';
import SessionSelect from '@/page/Workspace/components/SessionContextWrap/SessionSelect/SelectItem';
import { ISessionDropdownFiltersProps } from '@/page/Workspace/components/SessionContextWrap/SessionSelect/SessionDropdown';
import { formatMessage } from '@/util/intl';
import { IDatabase } from '@/d.ts/database';
import { Form } from 'antd';
import React from 'react';
import { ScheduleType } from '@/d.ts/schedule';

interface IProps {
  type?: TaskType;
  scheduleType?: ScheduleType;
  label?: string;
  disabled?: boolean;
  name?: string | string[];
  projectId?: number;
  dataSourceId?: number;
  filters?: ISessionDropdownFiltersProps;
  extra?: string;
  width?: string;
  placeholder?: string;
  isLogicalDatabase?: boolean;
  onChange?: (v: number, database?: IDatabase) => void;
  onInit?: (database?: IDatabase) => void;
}
const DatabaseSelect: React.FC<IProps> = (props) => {
  const {
    type,
    label = formatMessage({
      id: 'odc.component.DatabaseSelect.Database',
      defaultMessage: '数据库',
    }),
    //数据库
    name = 'databaseId',
    scheduleType,
    projectId,
    dataSourceId,
    filters = null,
    width,
    placeholder,
    disabled = false,
    isLogicalDatabase = false,
    onChange,
    onInit,
  } = props;

  return (
    <Form.Item
      label={label}
      name={name}
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
      <SessionSelect
        onInit={onInit}
        disabled={disabled}
        dataSourceId={dataSourceId}
        projectId={projectId}
        filters={filters}
        taskType={type}
        scheduleType={scheduleType}
        width={width}
        onChange={onChange}
        isLogicalDatabase={isLogicalDatabase}
        placeholder={placeholder}
      />
    </Form.Item>
  );
};
export default DatabaseSelect;
