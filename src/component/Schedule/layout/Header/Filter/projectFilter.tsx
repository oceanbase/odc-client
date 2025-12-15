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
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext, useMemo, useState } from 'react';
import { Button, Divider, Select } from 'antd';

const ProjectFilter = ({ isScheduleView }: { isScheduleView: boolean }) => {
  const context = useContext(ParamsContext);
  const { params, setParams, projectList, subTaskParams, setsubTaskParams } = context || {};
  const { projectIds } = params || {};
  const { projectIds: subTaskProjectIds } = subTaskParams || {};

  const projectOptions = useMemo(() => {
    return projectList?.map(({ name, id }) => ({
      label: name,
      value: id,
    }));
  }, [projectList]);

  const handleSelectProject = (value) => {
    if (isScheduleView) {
      setParams?.({ projectIds: value });
    } else {
      setsubTaskParams?.({ projectIds: value });
    }
  };

  const selectValue = useMemo(() => {
    return isScheduleView ? projectIds : subTaskProjectIds;
  }, [isScheduleView, projectIds, subTaskProjectIds]);

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.5873B80A',
          defaultMessage: '所属项目',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.571604A0',
          defaultMessage: '请输入',
        })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={selectValue}
        mode="multiple"
        options={projectOptions}
        style={{ width: '100%' }}
        onChange={handleSelectProject}
        allowClear
      />
    </>
  );
};

export default ProjectFilter;
