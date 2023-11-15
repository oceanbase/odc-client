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

import { IDatabase } from '@/d.ts/database';
import { IProject } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { Checkbox, Select, Space } from 'antd';
import { isNull } from 'lodash';

interface IProps {
  value?: any;
  onChange?: (v: any) => void;
  disabled?: boolean;
  projects: IProject[];
  currentDatabase: IDatabase;
}

export default function ProjectSelect({
  projects,
  value,
  disabled,
  currentDatabase,
  onChange,
}: IProps) {
  const isProjectNotFound = !projects?.find((item) => item.id === currentDatabase?.project?.id);
  const _isNull = isNull(value);
  return (
    <Space>
      <Select
        value={value}
        style={{ width: 230 }}
        onChange={(v) => {
          onChange(v);
        }}
        disabled={_isNull || disabled}
      >
        {projects?.map((item) => {
          return (
            <Select.Option value={item.id} key={item.id}>
              {item.name}
            </Select.Option>
          );
        })}
        {isProjectNotFound && currentDatabase?.project?.id ? (
          <Select.Option value={currentDatabase?.project?.id} key={currentDatabase?.project?.id}>
            {currentDatabase?.project?.name}
          </Select.Option>
        ) : null}
      </Select>
      <Checkbox
        checked={_isNull}
        disabled={disabled}
        onChange={(e) => (e.target.checked ? onChange(null) : onChange(undefined))}
      >
        {
          formatMessage({
            id: 'odc.Info.ChangeProjectModal.ProjectSelect.DoNotAssignProjects',
          }) /*不分配项目*/
        }
      </Checkbox>
    </Space>
  );
}
