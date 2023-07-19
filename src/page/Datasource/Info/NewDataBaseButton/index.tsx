import { createDataBase } from '@/common/network/database';
import { listProjects } from '@/common/network/project';
import { ConnectionMode } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { useRequest } from 'ahooks';
import { Button, Form, Input, message, Modal, Select, Space } from 'antd';
import { toInteger } from 'lodash';
import { useEffect, useState } from 'react';

interface IProps {
  dataSourceId: string;
  onSuccess: () => void;
  mode: ConnectionMode;
}

export default function NewDataBaseButton({ dataSourceId, onSuccess, mode }: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm<
    Pick<IDatabase, 'name' | 'collationName' | 'charsetName'> & { projectId: number }
  >();
  const { run, loading } = useRequest(createDataBase, {
    manual: true,
  });

  const { data: project, loading: projectListLoading } = useRequest(listProjects, {
    defaultParams: [null, 1, 99999],
  });

  function close() {
    setOpen(false);
    form.resetFields();
  }

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
    switch (mode) {
      case ConnectionMode.OB_MYSQL:
      case ConnectionMode.MYSQL: {
        form.setFieldsValue({
          collationName: 'utf8_general_ci',
          charsetName: 'utf8',
        });
        return;
      }
      case ConnectionMode.OB_ORACLE:
      case ConnectionMode.ORACLE: {
        form.setFieldsValue({
          collationName: 'BINARY',
          charsetName: 'AL32UTF8',
        });
        return;
      }
    }
  }, [mode, open]);

  async function submit() {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const isSuccess = await run({
      name: formData.name,
      collationName: formData?.collationName,
      charsetName: formData.charsetName,
      project: {
        id: formData?.projectId,
      },
      dataSource: {
        id: toInteger(dataSourceId),
      },
    });
    if (isSuccess) {
      message.success('新建成功');
      setOpen(false);
      onSuccess();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">
        新建数据库
      </Button>
      <Modal open={open} title="新建数据库" onOk={submit} onCancel={close}>
        <Form form={form} initialValues={{}} layout="vertical">
          <Form.Item name={'name'} label="数据库名称">
            <Input style={{ width: 320 }} placeholder="请输入" />
          </Form.Item>
          <Space>
            <Form.Item name={'charsetName'} label="字符编码">
              <Input style={{ width: 200 }} placeholder="请输入" />
            </Form.Item>
            <Form.Item name={'collationName'} label="排序规则">
              <Input style={{ width: 200 }} placeholder="请输入" />
            </Form.Item>
          </Space>
          <Form.Item name={'projectId'} label="所属项目">
            <Select style={{ width: 240 }} loading={projectListLoading}>
              {project?.contents?.map((p) => {
                return <Select.Option key={p.id}>{p.name}</Select.Option>;
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
