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
import React, { useEffect, useImperativeHandle, useMemo } from 'react';
import { cloneDeep, omit } from 'lodash';

const typeToGlobalPermission = {
  owner: 'global_project_owner',
  dba: 'global_project_dba',
  securityAdministrator: 'global_project_security_administrator',
};

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
  const { data, loading } = useRequest(getUserSummaryList);

  const userOptions: {
    label: string;
    value: number;
    roles?: string[];
    disabled: boolean;
  }[] = useMemo(() => {
    if (data) {
      return data?.contents?.map((user) => {
        return {
          label: `${user.name}(${user.accountName})`,
          value: user.id,
          roles: user?.roles?.map((item) => item.name),
          disabled: false,
        };
      });
    }
  }, [data?.contents]);

  useEffect(() => {
    if (userOptions) {
      const owner = [login.user?.id, login.user?.id];
      const dba = [login.user?.id];
      const securityAdministrator = [];
      userOptions.forEach((item) => {
        const roles = item.roles;
        if (roles?.includes(typeToGlobalPermission['owner'])) {
          owner.push(item.value);
        }
        if (roles?.includes(typeToGlobalPermission['dba'])) {
          dba.push(item.value);
        }
        if (roles?.includes(typeToGlobalPermission['securityAdministrator'])) {
          securityAdministrator.push(item.value);
        }
      });
      form?.setFieldsValue({
        owner: [...new Set(owner)],
        dba: [...new Set(dba)],
        securityAdministrator: securityAdministrator,
      });
    }
  }, [userOptions]);

  const userOptionsByType = (type: string) => {
    if (!userOptions) return;
    let option = userOptions;
    switch (type) {
      case 'owner':
      case 'dba':
      case 'securityAdministrator':
        option = userOptions?.map((item) => {
          item.disabled = item?.roles?.includes(typeToGlobalPermission[type]);
          return omit(item, 'roles');
        });
        break;
      default:
        option = userOptions?.map((item) => {
          return omit(item, 'roles');
        });
    }
    return cloneDeep(option);
  };

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
          defaultMessage: '项目名称',
        })} /*项目名称*/
      >
        <Input
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseEnterLessThanCharacters',
            defaultMessage: '请输入，32 个字符以内',
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
                defaultMessage: '管理员',
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
          options={userOptionsByType('owner')}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
            defaultMessage: '请选择',
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
          options={userOptionsByType('dba')}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
            defaultMessage: '请选择',
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
                defaultMessage: '开发者',
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
          options={userOptionsByType('developer')}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
            defaultMessage: '请选择',
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
                defaultMessage: '安全管理员',
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
          options={userOptionsByType('securityAdministrator')}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
            defaultMessage: '请选择',
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
                defaultMessage: '参与者',
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
          options={userOptionsByType('participant')}
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseSelect',
            defaultMessage: '请选择',
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
          defaultMessage: '描述',
        })} /*描述*/
      >
        <Input.TextArea
          placeholder={formatMessage({
            id: 'odc.Project.CreateProject.PleaseEnter',
            defaultMessage: '请输入',
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
