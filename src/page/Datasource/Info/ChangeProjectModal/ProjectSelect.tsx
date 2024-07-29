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

import { getDataSourceModeConfig } from '@/common/datasource';
import { IDatabase } from '@/d.ts/database';
import { IProject } from '@/d.ts/project';
import { formatMessage } from '@/util/intl';
import { Checkbox, Select, Space, Tooltip } from 'antd';
import { isNull } from 'lodash';

interface IProps {
  value?: any;
  onChange?: (v: any) => void;
  disabled?: boolean;
  projects: IProject[];
  disabledTip?: string;
  currentDatabase: IDatabase;
  defaultProject?: {
    projectId: number;
    projectName: string;
  };
  setDisabledStatus?: (v: boolean) => void;
}

export default function ProjectSelect({
  projects,
  value,
  disabled,
  currentDatabase,
  disabledTip,
  defaultProject,
  onChange,
  setDisabledStatus,
}: IProps) {
  const isProjectNotFound = !projects?.find((item) => item.id === currentDatabase?.project?.id);
  const haveDefaultProject = projects?.find((item) => item.id === defaultProject?.projectId);
  const bindProjectId = currentDatabase?.dataSource?.projectId;
  const _isNull = isNull(value);
  return (
    <Tooltip placement="right" title={disabledTip ? disabledTip : null}>
      <Space>
        <Select
          value={value}
          style={{ width: 230 }}
          onChange={(v) => {
            onChange(v);
          }}
          disabled={_isNull || disabled}
        >
          {projects
            ?.map((item) => {
              if (bindProjectId && item.id !== bindProjectId) {
                return null;
              }
              return (
                <Select.Option value={item.id} key={item.id}>
                  {item.name}
                </Select.Option>
              );
            })
            .filter(Boolean)}
          {isProjectNotFound && currentDatabase?.project?.id ? (
            <Select.Option value={currentDatabase?.project?.id} key={currentDatabase?.project?.id}>
              {currentDatabase?.project?.name}
            </Select.Option>
          ) : null}
          {!haveDefaultProject && defaultProject ? (
            <Select.Option value={defaultProject?.projectId} key={defaultProject?.projectId}>
              {defaultProject?.projectName}
            </Select.Option>
          ) : null}
        </Select>
        <Checkbox
          checked={_isNull}
          disabled={disabled}
          onChange={(e) => {
            e.target.checked ? onChange(null) : onChange(undefined);
            setDisabledStatus && setDisabledStatus(e.target.checked);
          }}
        >
          {
            formatMessage({
              id: 'odc.Info.ChangeProjectModal.ProjectSelect.DoNotAssignProjects',
              defaultMessage: '不分配项目',
            }) /*不分配项目*/
          }
        </Checkbox>
      </Space>
    </Tooltip>
  );
}
