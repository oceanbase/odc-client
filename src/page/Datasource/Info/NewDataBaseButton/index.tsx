/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createDataBase } from '@/common/network/database';
import { listProjects } from '@/common/network/project';
import { ConnectionMode } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Button, Form, Input, message, Modal, Space, Tooltip } from 'antd';
import { toInteger } from 'lodash';
import { useEffect, useState } from 'react';
import ProjectSelect from '../ChangeProjectModal/ProjectSelect';

interface IProps {
  dataSourceId: string;
  projectId: number;
  projectName: string;
  onSuccess: () => void;
  mode: ConnectionMode;
}

export default function NewDataBaseButton({
  dataSourceId,
  projectId,
  projectName,
  onSuccess,
  mode,
}: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm<
    Pick<IDatabase, 'name' | 'collationName' | 'charsetName'> & { projectId: number }
  >();
  const { run, loading } = useRequest(createDataBase, {
    manual: true,
  });
  const haveCharset = ![ConnectionMode.OB_ORACLE, ConnectionMode.ORACLE].includes(mode);

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
      if (projectId) {
        form.setFieldsValue({
          projectId: projectId,
        });
      }
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
          {haveCharset && (
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
                label={formatMessage({
                  id: 'odc.Info.NewDataBaseButton.SortingRules',
                })} /*排序规则*/
              >
                <Input
                  style={{ width: 200 }}
                  placeholder={formatMessage({
                    id: 'odc.Info.NewDataBaseButton.PleaseEnter',
                  })} /*请输入*/
                />
              </Form.Item>
            </Space>
          )}
          <Form.Item name={'projectId'} label={'项目'}>
            <ProjectSelect
              disabled={!!projectId}
              disabledTip={`当前数据源所属项目【${projectName}】, 无法修改，可通过编辑数据源修改所属项目`}
              projects={project?.contents}
              currentDatabase={null}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
