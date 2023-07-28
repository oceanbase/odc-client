import { createDataBase } from '@/common/network/database';
import { listProjects } from '@/common/network/project';
import { ConnectionMode } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Button, Form, Input, message, Modal, Space } from 'antd';
import { toInteger } from 'lodash';
import { useEffect, useState } from 'react';
import ProjectSelect from '../ChangeProjectModal/ProjectSelect';

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
      message.success(
        formatMessage({ id: 'odc.Info.NewDataBaseButton.New' }), //新建成功
      );
      setOpen(false);
      onSuccess();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">
        {formatMessage({ id: 'odc.Info.NewDataBaseButton.CreateADatabase' }) /*新建数据库*/}
      </Button>
      <Modal
        open={open}
        title={formatMessage({ id: 'odc.Info.NewDataBaseButton.CreateADatabase' })}
        /*新建数据库*/ onOk={submit}
        onCancel={close}
      >
        <Form form={form} initialValues={{}} layout="vertical">
          <Form.Item
            name={'name'}
            label={formatMessage({ id: 'odc.Info.NewDataBaseButton.DatabaseName' })} /*数据库名称*/
          >
            <Input
              style={{ width: 320 }}
              placeholder={formatMessage({
                id: 'odc.Info.NewDataBaseButton.PleaseEnter',
              })} /*请输入*/
            />
          </Form.Item>
          <Space>
            <Form.Item
              name={'charsetName'}
              label={formatMessage({
                id: 'odc.Info.NewDataBaseButton.CharacterEncoding',
              })} /*字符编码*/
            >
              <Input
                style={{ width: 200 }}
                placeholder={formatMessage({
                  id: 'odc.Info.NewDataBaseButton.PleaseEnter',
                })} /*请输入*/
              />
            </Form.Item>
            <Form.Item
              name={'collationName'}
              label={formatMessage({ id: 'odc.Info.NewDataBaseButton.SortingRules' })} /*排序规则*/
            >
              <Input
                style={{ width: 200 }}
                placeholder={formatMessage({
                  id: 'odc.Info.NewDataBaseButton.PleaseEnter',
                })} /*请输入*/
              />
            </Form.Item>
          </Space>
          <Form.Item
            name={'projectId'}
            label={formatMessage({ id: 'odc.Info.NewDataBaseButton.Project' })} /*所属项目*/
          >
            <ProjectSelect projects={project?.contents} currentDatabase={null} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
