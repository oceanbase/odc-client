import { updateProject } from '@/common/network/project';
import { IProject } from '@/d.ts/project';
import { Button, Form, Input, message, Space } from 'antd';
import { useContext, useEffect, useState } from 'react';
import ProjectContext from '../../ProjectContext';

export default function Info() {
  const [form] = Form.useForm<Pick<IProject, 'name' | 'description'>>();
  const context = useContext(ProjectContext);
  const [isModify, setIsModify] = useState(false);

  useEffect(() => {
    if (context.project) {
      form.setFieldsValue(context.project);
    }
  }, [context.project]);

  async function onSubmit() {
    const data = await form.validateFields();
    const newData = {
      ...context.project,
      ...data,
    };
    const isSuccess = await updateProject(context?.projectId, newData);
    if (isSuccess) {
      message.success('更新成功！');
      setIsModify(false);
      context?.reloadProject();
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Form
        onValuesChange={() => {
          setIsModify(true);
        }}
        form={form}
        initialValues={context.project}
        layout="vertical"
        requiredMark="optional"
      >
        <Form.Item required name={'name'} label="项目名称">
          <Input placeholder="请输入名称" style={{ width: 400 }} />
        </Form.Item>
        <Form.Item name={'description'} label="描述">
          <Input.TextArea
            placeholder="请输入描述"
            style={{ width: 480 }}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Form.Item>
      </Form>
      <Space size={36} direction="vertical">
        <Button disabled={!isModify} type="primary" onClick={onSubmit}>
          确认修改
        </Button>
        <Button danger>归档项目</Button>
      </Space>
    </div>
  );
}
