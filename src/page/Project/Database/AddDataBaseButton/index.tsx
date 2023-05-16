import { listDatabases, updateDataBase } from '@/common/network/database';
import { getDataSource, listDataSources } from '@/common/network/dataSource';
import { useRequest } from 'ahooks';
import { Button, Col, Form, message, Modal, Row, Select } from 'antd';
import { useState } from 'react';

interface IProps {
  projectId: number;
  onSuccess: () => void;
}

export default function AddDataBaseButton({ projectId, onSuccess }: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm<{ databaseIds: number[] }>();
  const { run, loading } = useRequest(updateDataBase, {
    manual: true,
  });

  const { data: dataSourceList, loading: dataSourceListLoading } = useRequest(listDataSources, {
    defaultParams: [null, 1, 999999],
  });

  const {
    data: dataSource,
    loading: dataSourceLoading,
    run: fetchDataSource,
  } = useRequest(getDataSource, {
    manual: true,
  });

  const {
    data: databases,
    loading: databasesListLoading,
    run: fetchDatabases,
  } = useRequest(listDatabases, {
    manual: true,
  });

  function close() {
    setOpen(false);
    form.resetFields();
  }

  async function submit() {
    const formData = await form.validateFields();
    if (!formData) {
      return;
    }
    const isSuccess = await run(formData?.databaseIds, projectId);
    if (isSuccess) {
      message.success('添加成功');
      setOpen(false);
      onSuccess();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">
        添加数据库
      </Button>
      <Modal visible={open} title="添加数据库" onOk={submit} onCancel={close}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (changedValues.hasOwnProperty('dataSourceId')) {
              fetchDataSource(changedValues?.dataSourceId);
              fetchDatabases(projectId, changedValues?.dataSourceId, 1, 999999);
            }
          }}
        >
          <Row>
            <Col span={18}>
              <Form.Item rules={[{ required: true }]} name={'dataSourceId'} label="所属数据源">
                <Select
                  loading={dataSourceListLoading || dataSourceLoading}
                  style={{ width: 'calc(100% - 10px)' }}
                  placeholder="请选择"
                >
                  {dataSourceList?.contents?.map((item) => {
                    return <Select.Option key={item.id}>{item.name}</Select.Option>;
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="环境">{dataSource?.environmentName || '-'}</Form.Item>
            </Col>
          </Row>
          <Form.Item rules={[{ required: true }]} name={'databaseIds'} label="数据库">
            <Select
              placeholder="请选择未分配项目的数据库"
              style={{ width: '100%' }}
              loading={databasesListLoading}
            >
              {databases?.contents?.map((p) => {
                return <Select.Option key={p.id}>{p.name}</Select.Option>;
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
