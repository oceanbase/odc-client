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

import login from '@/store/login';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Form, Input } from 'antd';

const DescriptionInput = () => {
  const defaultPlaceholder =
    '请输入描述，200字以内，描述会作为任务标题；未输入时，系统会根据对象和工单类型自动生成描述信息。';
  return (
    <Form.Item
      label={formatMessage({
        id: 'odc.component.DescriptionInput.Description',
        defaultMessage: '描述',
      })} /*描述*/
      name="description"
      rules={[
        {
          max: 200,
          message: formatMessage({
            id: 'odc.component.DescriptionInput.TheDescriptionCannotExceedCharacters',
            defaultMessage: '描述不超过 200 个字符',
          }), //描述不超过 200 个字符
        },
        {
          validator: (_, value) => {
            if (value && value.trim() === '') {
              return Promise.reject(new Error('描述不允许只有空格，请输入描述'));
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <Input.TextArea
        rows={6}
        placeholder={
          login.isPrivateSpace()
            ? defaultPlaceholder
            : setting.spaceConfigurations?.['odc.task.default.taskDescriptionPrompt'] ||
              defaultPlaceholder
        }
      />
    </Form.Item>
  );
};

export default DescriptionInput;
