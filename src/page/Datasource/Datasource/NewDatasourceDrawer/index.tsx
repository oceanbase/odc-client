import {
  createConnection,
  getConnectionDetail,
  getConnectionExists,
  updateConnection,
} from '@/common/network/connection';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Button, Drawer, Input, message, Modal, Space, Spin } from 'antd';
import { useEffect, useRef } from 'react';
import DatasourceForm, { IFormRef } from './Form';

interface IProps {
  visible: boolean;
  isEdit?: boolean;
  isPersonal?: boolean;
  id?: number;
  close: () => void;
  onSuccess: () => void;
}

export default function NewDatasourceDrawer({
  visible,
  isEdit,
  isPersonal,
  id,
  close,
  onSuccess,
}: IProps) {
  const formRef = useRef<IFormRef>();

  const { data, loading, run } = useRequest(getConnectionDetail, {
    manual: true,
  });

  async function getDataSource(id: number) {
    const data = await run(id);
    if (!data) {
      return;
    }
    formRef.current?.form?.setFieldsValue(data);
  }

  useEffect(() => {
    if (visible && id) {
      getDataSource(id);
    }
  }, [id]);

  async function submit() {
    const values = await formRef.current?.form?.validateFields();
    if (!values) {
      return;
    }
    if (isEdit) {
      const isSuccess = await updateConnection({
        ...data,
        ...values,
      });
      if (isSuccess) {
        message.success('修改成功');
        onSuccess();
        close();
      }
      return;
    }
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.AddConnectionDrawer.EnterAConnectionName',
      }), //请输入连接名
      content: <Input id="newCloudConnectionName" />,
      onOk: async (_close) => {
        const name = (document.querySelector('#newCloudConnectionName') as HTMLInputElement)?.value;
        if (!name) {
          message.warn(
            formatMessage({
              id: 'odc.component.AddConnectionForm.NameItems.EnterAConnectionName',
            }),
          );

          //请输入连接名称
          throw new Error('');
        }
        if (name?.length > 128) {
          message.warn(
            formatMessage({ id: 'odc.component.AddConnectionDrawer.TheMaximumLengthOfThe' }), //连接名称最大长度为 128
          );
          throw new Error('');
        }
        if (!/^[^\s]*$/.test(name)) {
          message.warn(
            formatMessage({
              id: 'odc.AddConnectionDrawer.AddConnectionForm.TheConnectionNameCannotContain',
            }),
          );

          throw new Error('');
        }
        const isRepeat = await getConnectionExists({
          name,
        });
        if (isRepeat) {
          message.warn(
            formatMessage({
              id: 'odc.component.AddConnectionDrawer.TheConnectionNameAlreadyExists',
            }), //连接名称已存在
          );
          throw new Error();
        }
        return new Promise(async (resolve, reject) => {
          const res = await createConnection({ ...values, name });
          if (res) {
            message.success(formatMessage({ id: 'portal.connection.form.save.success' }));
            resolve(true);
            onSuccess();
            close();
          } else {
            reject();
          }
        });
      },
    });
  }

  return (
    <Drawer
      width={520}
      title={isEdit ? '编辑数据源' : '新建数据源'}
      visible={visible}
      onClose={close}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={close}>取消</Button>
          <Button onClick={submit} type="primary">
            确定
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <DatasourceForm
          isPersonal={isPersonal}
          originDatasource={data}
          isEdit={isEdit}
          key={visible + ''}
          ref={formRef}
        />
      </Spin>
    </Drawer>
  );
}
