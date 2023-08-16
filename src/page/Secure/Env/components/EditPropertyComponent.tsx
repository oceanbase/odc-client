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

import { ComponentType, PropertyMetadata } from '@/d.ts/rule';
import { formatMessage } from '@/util/intl';
import { Form, Input, InputNumber, Radio, Select } from 'antd';
interface EditPropertyComponentMapProps {
  propertyMetadata: PropertyMetadata;
  label: string;
  index: number;
  initData: any;
  description: string;
}
const EditPropertyComponentMap: React.FC<EditPropertyComponentMapProps> = ({
  propertyMetadata,
  index,
  label,
  initData,
  description = '',
}) => {
  const name = `activeKey${index}`;
  const option = `options${index}`;
  const { componentType = '', candidates = [], defaultValue, type } = propertyMetadata;
  switch (componentType) {
    case ComponentType.INPUT_STRING: {
      return (
        <Form.Item label={label} name={name} tooltip={description}>
          <Input
            placeholder={
              formatMessage({ id: 'odc.src.page.Secure.Env.components.PleaseEnter' }) /* 请输入 */
            }
          />
        </Form.Item>
      );
    }
    case ComponentType.INPUT_NUMBER: {
      return (
        <Form.Item
          label={label}
          name={name}
          rules={[
            {
              required: true,
              message: formatMessage(
                {
                  id: 'odc.Env.components.EditPropertyComponent.EnterLabel',
                },
                {
                  label: label,
                },
              ), //`请输入${label}`
            },
          ]}
          tooltip={description}
        >
          <InputNumber
            defaultValue={defaultValue}
            min={0}
            placeholder={
              formatMessage({ id: 'odc.src.page.Secure.Env.components.PleaseEnter.1' }) /* 请输入 */
            }
          />
        </Form.Item>
      );
    }
    case ComponentType.RADIO: {
      return (
        <Form.Item
          label={label}
          name={name}
          rules={[
            {
              required: true,
              message: formatMessage(
                {
                  id: 'odc.Env.components.EditPropertyComponent.SelectLabel',
                },
                {
                  label: label,
                },
              ), //`请选择${label}`
            },
          ]}
          tooltip={description}
        >
          <Radio.Group defaultValue={defaultValue}>
            {candidates.map((candidate, index) => {
              return (
                <Radio value={candidate} key={index}>
                  {String(candidate)}
                </Radio>
              );
            })}
          </Radio.Group>
        </Form.Item>
      );
    }
    case ComponentType.SELECT_SINGLE: {
      return (
        <Form.Item label={label} name={name} tooltip={description}>
          <Select
            options={initData?.[option] || []}
            placeholder={
              formatMessage({ id: 'odc.src.page.Secure.Env.components.PleaseChoose' }) /* 请选择 */
            }
          />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_MULTIPLE: {
      return (
        <Form.Item label={label} name={name} tooltip={description}>
          <Select
            mode="multiple"
            maxTagCount="responsive"
            options={initData?.[option] || []}
            defaultValue={defaultValue}
            placeholder={
              formatMessage({
                id: 'odc.src.page.Secure.Env.components.PleaseChoose.1',
              }) /* 请选择 */
            }
          />
        </Form.Item>
      );
    }
    case ComponentType.SELECT_TAGS: {
      return (
        <Form.Item label={label} name={name} tooltip={description}>
          <Select
            mode="tags"
            maxTagCount="responsive"
            options={initData?.[option] || []}
            defaultValue={defaultValue}
            placeholder={
              formatMessage({
                id: 'odc.src.page.Secure.Env.components.PleaseChoose.2',
              }) /* 请选择 */
            }
          />
        </Form.Item>
      );
    }
    default: {
      return null;
    }
  }
};
export default EditPropertyComponentMap;
