import { formatMessage } from '@/util/intl';
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

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select, Space } from 'antd';
import React, { useState } from 'react';
import type { IOption } from './index';
interface IProps {
  projectOptions: IOption[];
  roleOptions: IOption[];
}
const ProjectRoleSelect: React.FC<IProps> = (props) => {
  const { projectOptions, roleOptions } = props;
  const [isRequired, setIsRequired] = useState(true);

  // 有效性校验
  const handleValidator = async (_, values) => {
    let itemRequired = false;
    if (!values?.length) {
      return Promise.resolve();
    }
    const validValues = values?.filter((item) => {
      // 每一项均不是空值
      return Object.values(item)?.every((value) => value);
    });
    const invalidValues = values?.filter((item) => {
      const _values = Object.values(item);
      if (!_values.length) {
        return false;
      }
      // 包含空值 && 不是所有筛选项为空
      return _values?.some((value) => !value) && !_values?.every((value) => !value);
    });
    if (!validValues.length || invalidValues.length) {
      itemRequired = true;
    }
    setIsRequired(itemRequired);
    return itemRequired ? Promise.reject(new Error()) : Promise.resolve();
  };
  return (
    <Form.List
      name="projectRoles"
      rules={[
        {
          validator: handleValidator,
        },
      ]}
    >
      {(fields, { add, remove }) => {
        return (
          <>
            {fields.map(({ key, name }: any) => (
              <Space key={key} align="baseline">
                <Form.Item
                  name={[name, 'projectId']}
                  style={{
                    width: '210px',
                  }}
                  rules={[
                    {
                      required: isRequired,
                      message: formatMessage({
                        id: 'odc.src.page.Auth.Autoauth.component.FormModal.PleaseChoose',
                      }), //'请选择'
                    },
                  ]}
                >
                  <Select
                    placeholder={
                      formatMessage({
                        id: 'odc.src.page.Auth.Autoauth.component.FormModal.PleaseSelectTheProject',
                      }) /* 请选择项目 */
                    }
                    options={projectOptions}
                  />
                </Form.Item>
                <Form.Item
                  name={[name, 'roles']}
                  style={{
                    width: '210px',
                  }}
                  rules={[
                    {
                      required: isRequired,
                      message: formatMessage({
                        id: 'odc.src.page.Auth.Autoauth.component.FormModal.PleaseChoose.1',
                      }), //'请选择'
                    },
                  ]}
                >
                  <Select
                    placeholder={
                      formatMessage({
                        id: 'odc.src.page.Auth.Autoauth.component.FormModal.PleaseSelectTheRole',
                      }) /* 请选择角色 */
                    }
                    mode="multiple"
                    options={roleOptions}
                  />
                </Form.Item>
                <DeleteOutlined
                  onClick={() => {
                    remove(name);
                  }}
                />
              </Space>
            ))}

            <Form.Item
              style={{
                marginBottom: 0,
                width: '428px',
              }}
            >
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    projectId: undefined,
                    roles: undefined,
                  })
                }
                block
                icon={<PlusOutlined />}
              >
                {
                  formatMessage({
                    id: 'odc.src.page.Auth.Autoauth.component.FormModal.AddTo',
                  }) /* 
                添加
               */
                }
              </Button>
            </Form.Item>
          </>
        );
      }}
    </Form.List>
  );
};
export default ProjectRoleSelect;
