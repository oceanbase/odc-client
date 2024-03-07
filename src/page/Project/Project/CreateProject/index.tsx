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

import { getUserSummaryList } from '@/common/network/project';
import HelpDoc from '@/component/helpDoc';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, FormInstance, Input, Select } from 'antd';
import React, { useEffect, useImperativeHandle } from 'react';
interface IProps {}
export interface ICreateProjectFormData {
  name: string;
  owner: number[];
  dba: number[];
  developer: number[];
  securityAdministrator: number[];
  participant: number[];
  description: string;
}
export default React.forwardRef<{
  form: FormInstance<ICreateProjectFormData>;
}>(function CreateProject({}: IProps, ref) {
  const [form] = Form.useForm<ICreateProjectFormData>();
  const { data, run, loading } = useRequest(getUserSummaryList, {
    manual: true,
  });
  const userOptions = data?.contents?.map((user) => {
    return {
      label: `${user.name}(${user.accountName})`,
      value: user.id,
    };
  });
  useEffect(() => {
    async function func() {
      await run();
      form?.setFieldsValue({
        owner: [login.user?.id],
        dba: [login.user?.id],
      });
    }
    func();
  }, []);
  useImperativeHandle(
    ref,
    () => {
      return {
        form,
      };
    },
    [form],
  );
  return (
    <Form layout="vertical" form={form} requiredMark="optional">
      <Form.Item
        rules={[
          {
            required: true,
          },
          {
            max: 32,
          },
        ]}
        required
        name={'name'}
        label={formatMessage({
          id: 'odc.Project.CreateProject.ProjectName',
        })} /*项目名称*/
      >
        <Input
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseEnterLessThanCharacters',
          })}
          /*请输入，32 个字符以内*/ style={{
            width: 400,
          }}
        />
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: true,
          },
        ]}
        required
        name={'owner'}
        label={
          <HelpDoc leftText doc="projectOwner">
            {
              formatMessage({
                id: 'odc.Project.CreateProject.Administrator',
              }) /*管理员*/
            }
          </HelpDoc>
        }
      >
        <Select
          loading={loading}
          optionFilterProp="label"
          mode="multiple"
          style={{
            width: 240,
          }}
          options={userOptions}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
          })} /*请选择*/
        />
      </Form.Item>
      <Form.Item
        rules={[
          {
            required: true,
          },
        ]}
        required
        name={'dba'}
        label={
          <HelpDoc leftText doc="projectDBA">
            DBA
          </HelpDoc>
        }
      >
        <Select
          loading={loading}
          mode="multiple"
          style={{
            width: 240,
          }}
          optionFilterProp="label"
          options={userOptions}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
          })} /*请选择*/
        />
      </Form.Item>
      <Form.Item
        name={'developer'}
        label={
          <HelpDoc leftText doc="projectDev">
            {
              formatMessage({
                id: 'src.page.Project.Project.CreateProject.AD525382' /*开发者*/,
              }) /* 开发者 */
            }
          </HelpDoc>
        }
      >
        <Select
          loading={loading}
          mode="multiple"
          optionFilterProp="label"
          style={{
            width: 240,
          }}
          options={userOptions}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
          })} /*请选择*/
        />
      </Form.Item>
      <Form.Item
        name={'securityAdministrator'}
        label={
          <HelpDoc leftText doc="projectSA">
            {
              formatMessage({
                id: 'odc.src.page.Project.Project.CreateProject.SecurityAdministrator',
              }) /* 
          安全管理员
          */
            }
          </HelpDoc>
        }
      >
        <Select
          loading={loading}
          mode="multiple"
          optionFilterProp="label"
          style={{
            width: 240,
          }}
          options={userOptions}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
          })} /*请选择*/
        />
      </Form.Item>
      <Form.Item
        name={'participant'}
        label={
          <HelpDoc leftText doc="participant">
            {
              formatMessage({
                id: 'odc.src.page.Project.Project.CreateProject.Participant',
              }) /* 
          参与者
          */
            }
          </HelpDoc>
        }
      >
        <Select
          loading={loading}
          mode="multiple"
          optionFilterProp="label"
          style={{
            width: 240,
          }}
          options={userOptions}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
          })} /*请选择*/
        />
      </Form.Item>
      <Form.Item
        rules={[
          {
            max: 256,
          },
        ]}
        name={'description'}
        label={formatMessage({
          id: 'odc.Project.CreateProject.Description',
        })} /*描述*/
      >
        <Input.TextArea
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseEnter',
          })}
          /*请输入*/ style={{
            width: 400,
          }}
          autoSize={{
            minRows: 4,
            maxRows: 4,
          }}
        />
      </Form.Item>
    </Form>
  );
});
