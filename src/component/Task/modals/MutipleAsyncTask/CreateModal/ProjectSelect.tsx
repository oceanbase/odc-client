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
import { Form, Select } from 'antd';
import { rules } from '../const';

const ProjectSelect: React.FC<{
  projectOptions: {
    label: string;
    value: number;
  }[];
}> = ({ projectOptions }) => {
  const form = Form.useFormInstance();

  const callback = async () => {
    await form.setFields([
      {
        name: ['parameters', 'orderedDatabaseIds'],
        value: [[undefined]],
        errors: [],
      },
    ]);
  };
  return (
    <Form.Item
      label={
        formatMessage({
          id: 'odc.src.component.Task.ApplyPermission.CreateModal.Project',
          defaultMessage: '项目',
        }) /* 项目 */
      }
      name="projectId"
      rules={rules.projectId}
    >
      <Select
        showSearch
        optionFilterProp="title"
        style={{ width: 390 }}
        allowClear
        onChange={callback}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={projectOptions}
      />
    </Form.Item>
  );
};

export default ProjectSelect;
