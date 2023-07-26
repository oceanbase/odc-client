import { updateDataBase } from '@/common/network/database';
import { listProjects } from '@/common/network/project';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, message, Modal } from 'antd';
import { isUndefined } from 'lodash';
import { useEffect } from 'react';
import ProjectSelect from './ProjectSelect';

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
        project: database?.project?.id || null,
      });
    }
  }, [visible]);

  return (
    <Modal
      title={formatMessage({ id: 'odc.Info.ChangeProjectModal.TransferProject' })} /*转移项目*/
      open={visible}
      onCancel={close}
      onOk={async () => {
        const value = await form.validateFields();
        console.log(value);
        const isSuccess = await updateDataBase([database?.id], value.project);
        if (isSuccess) {
          message.success(
            formatMessage({ id: 'odc.Info.ChangeProjectModal.OperationSucceeded' }), //操作成功
          );
          close();
          onSuccess();
        }
      }}
    >
      <Form requiredMark="optional" form={form} layout="vertical">
        <Form.Item>
          {formatMessage({ id: 'odc.Info.ChangeProjectModal.DatabaseName' }) /*数据库名称：*/}
          {database?.name}
        </Form.Item>
        <Form.Item
          required
          rules={[
            {
              validator(rule, value, callback) {
                if (isUndefined(value)) {
                  callback('请选择项目');
                  return;
                }
                callback();
              },
            },
          ]}
          label={formatMessage({ id: 'odc.Info.ChangeProjectModal.Project' })}
          /*所属项目*/ name={'project'}
        >
          <ProjectSelect projects={data?.contents} currentDatabase={database} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
