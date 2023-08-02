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
  description: string;
}

export default React.forwardRef<{ form: FormInstance<ICreateProjectFormData> }>(
  function CreateProject({}: IProps, ref) {
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
          rules={[{ required: true }, { max: 32 }]}
          required
          name={'name'}
          label={formatMessage({ id: 'odc.Project.CreateProject.ProjectName' })} /*项目名称*/
        >
          <Input
            placeholder={formatMessage({
              id: 'odc.Project.CreateProject.PleaseEnterLessThanCharacters',
            })}
            /*请输入，32 个字符以内*/ style={{ width: 400 }}
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          required
          name={'owner'}
          label={
            <HelpDoc leftText doc="projectOwner">
              {formatMessage({ id: 'odc.Project.CreateProject.Administrator' }) /*管理员*/}
            </HelpDoc>
          }
        >
          <Select
            loading={loading}
            optionFilterProp="label"
            mode="multiple"
            style={{ width: 240 }}
            options={userOptions}
            placeholder={formatMessage({ id: 'odc.Project.CreateProject.PleaseSelect' })} /*请选择*/
          />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
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
            style={{ width: 240 }}
            optionFilterProp="label"
            options={userOptions}
            placeholder={formatMessage({ id: 'odc.Project.CreateProject.PleaseSelect' })} /*请选择*/
          />
        </Form.Item>
        <Form.Item
          name={'developer'}
          label={
            <HelpDoc leftText doc="projectDev">
              {formatMessage({ id: 'odc.Project.CreateProject.CommonMember' }) /*普通成员*/}
            </HelpDoc>
          }
        >
          <Select
            loading={loading}
            mode="multiple"
            optionFilterProp="label"
            style={{ width: 240 }}
            options={userOptions}
            placeholder={formatMessage({ id: 'odc.Project.CreateProject.PleaseSelect' })} /*请选择*/
          />
        </Form.Item>
        <Form.Item
          rules={[{ max: 256 }]}
          name={'description'}
          label={formatMessage({ id: 'odc.Project.CreateProject.Description' })} /*描述*/
        >
          <Input.TextArea
            placeholder={formatMessage({ id: 'odc.Project.CreateProject.PleaseEnter' })} /*请输入*/
            style={{ width: 400 }}
            autoSize={{ minRows: 4, maxRows: 4 }}
          />
        </Form.Item>
      </Form>
    );
  },
);
