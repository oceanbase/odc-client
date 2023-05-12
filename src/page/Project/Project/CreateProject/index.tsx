import { getUserList } from '@/common/network/manager';
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
        label: user.name,
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
        <Form.Item rules={[{ required: true }]} required name={'name'} label="项目名称">
          <Input placeholder="请输入，32 个字符以内" style={{ width: 400 }} />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} required name={'owner'} label="管理员">
          <Select
            loading={loading}
            mode="multiple"
            style={{ width: 240 }}
            options={userOptions}
            placeholder="请选择"
          />
        </Form.Item>
        <Form.Item rules={[{ required: true }]} required name={'dba'} label="DBA">
          <Select
            loading={loading}
            mode="multiple"
            style={{ width: 240 }}
            options={userOptions}
            placeholder="请选择"
          />
        </Form.Item>
        <Form.Item name={'developer'} label="普通成员">
          <Select
            loading={loading}
            mode="multiple"
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
