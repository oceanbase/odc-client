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
import ParamsContext from '@/component/Task/context/ParamsContext';
import { useContext, useMemo } from 'react';
import { Select } from 'antd';

const ProjectFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams, projectList } = context || {};
  const { projectId } = params || {};

  const projectOptions = useMemo(() => {
    return projectList?.map(({ name, id }) => ({
      label: name,
      value: id?.toString(),
    }));
  }, [projectList]);

  const handleSelectProject = (value) => {
    setParams({ projectId: value });
  };

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Task.layout.Header.Filter.E875C4B7',
          defaultMessage: '所属项目',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Task.layout.Header.Filter.9AF5F35E',
          defaultMessage: '请输入',
        })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={projectId}
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
