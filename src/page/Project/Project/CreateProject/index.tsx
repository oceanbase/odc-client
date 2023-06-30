import { getUserList } from '@/common/network/manager';
import HelpDoc from '@/component/helpDoc';
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
    const { data, run, loading } = useRequest(getUserList, {
      manual: true,
    });
    const userOptions = data?.contents?.map((user) => {
      return {
        label: `${user.name}(${user.accountName})`,
        value: user.id,
      };
    });
    useEffect(() => {
      run({
        page: 1,
        size: 999999,
      });
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
          label="项目名称"
        >
          <Input placeholder="请输入，32 个字符以内" style={{ width: 400 }} />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          required
          name={'owner'}
          label={
            <HelpDoc leftText doc="projectOwner">
              管理员
            </HelpDoc>
          }
        >
          <Select
            loading={loading}
            optionFilterProp="label"
            mode="multiple"
            style={{ width: 240 }}
            options={userOptions}
            placeholder="请选择"
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
            placeholder="请选择"
          />
        </Form.Item>
        <Form.Item
          name={'developer'}
          label={
            <HelpDoc leftText doc="projectDev">
              普通成员
            </HelpDoc>
          }
        >
          <Select
            loading={loading}
            mode="multiple"
            optionFilterProp="label"
            style={{ width: 240 }}
            options={userOptions}
            placeholder="请选择"
          />
        </Form.Item>
        <Form.Item name={'description'} label="描述">
          <Input.TextArea
            placeholder="请输入"
            style={{ width: 400 }}
            autoSize={{ minRows: 4, maxRows: 4 }}
          />
        </Form.Item>
      </Form>
    );
  },
);
