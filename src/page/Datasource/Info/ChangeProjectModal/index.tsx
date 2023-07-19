import { updateDataBase } from '@/common/network/database';
import { listProjects } from '@/common/network/project';
import { IDatabase } from '@/d.ts/database';
import { useRequest } from 'ahooks';
import { Form, message, Modal, Select } from 'antd';
import { useEffect } from 'react';

interface IProps {
  visible: boolean;
  database: IDatabase;
  close: () => void;
  onSuccess: () => void;
}

export default function ChangeProjectModal({ visible, database, close, onSuccess }: IProps) {
  const [form] = Form.useForm();

  const { data, loading, run } = useRequest(listProjects, {
    manual: true,
  });

  useEffect(() => {
    if (visible) {
      run(null, 1, 9999);
      form.setFieldsValue({
        project: database?.project?.id,
      });
    }
  }, [visible]);

  const isProjectNotFound = !data?.contents?.find((item) => item.id === database?.project?.id);

  return (
    <Modal
      title="转移项目"
      open={visible}
      onCancel={close}
      onOk={async () => {
        const value = await form.validateFields();
        console.log(value);
        const isSuccess = await updateDataBase([database?.id], value.project);
        if (isSuccess) {
          message.success('操作成功');
          close();
          onSuccess();
        }
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item>数据库名称：{database?.name}</Form.Item>
        <Form.Item required rules={[{ required: true }]} label="所属项目" name={'project'}>
          <Select loading={loading} style={{ width: 240 }} showSearch optionFilterProp="children">
            {data?.contents?.map((item) => {
              return (
                <Select.Option value={item.id} key={item.id}>
                  {item.name}
                </Select.Option>
              );
            })}
            {isProjectNotFound ? (
              <Select.Option value={database?.project?.id} key={database?.project?.id}>
                {database?.project?.name}
              </Select.Option>
            ) : null}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
