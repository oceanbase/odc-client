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

import {
  createConnection,
  generateConnectionStr,
  getConnectionDetail,
  getConnectionExists,
  updateConnection,
} from '@/common/network/connection';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Button, Drawer, Input, message, Modal, Space, Spin } from 'antd';
import copy from 'copy-to-clipboard';
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
        message.success(
          formatMessage({ id: 'odc.Datasource.NewDatasourceDrawer.ModifiedSuccessfully' }), //修改成功
        );
        onSuccess();
        close();
      }
      return;
    }
    Modal.confirm({
      title: formatMessage({ id: 'odc.Datasource.NewDatasourceDrawer.EnterADataSourceName' }), //请输入数据源名称
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
            formatMessage({ id: 'odc.Datasource.NewDatasourceDrawer.TheMaximumLengthOfThe' }), //名称最大长度为 128
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
            formatMessage({ id: 'odc.Datasource.NewDatasourceDrawer.TheNameAlreadyExists' }), //名称已存在
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

  async function copyUri() {
    const data: any = await formRef.current?.form?.validateFields();
    if (data) {
      const res = await generateConnectionStr({
        ...data,
      });

      if (res) {
        copy(res);
        message.success(
          formatMessage({
            id: 'odc.components.AddConnectionDrawer.TheConnectionInformationIsCopied',
          }),
        );
      }
    }
  }

  return (
    <Drawer
      width={520}
      title={
        isEdit
          ? formatMessage({ id: 'odc.Datasource.NewDatasourceDrawer.EditDataSource' }) //编辑数据源
          : formatMessage({ id: 'odc.Datasource.NewDatasourceDrawer.CreateADataSource' }) //新建数据源
      }
      visible={visible}
      onClose={close}
      footer={
        <Space style={{ float: 'right' }}>
          {isEdit && !haveOCP() ? (
            <Button onClick={copyUri}>
              {
                formatMessage({
                  id: 'odc.Datasource.NewDatasourceDrawer.CopyConnectionString',
                }) /*复制连接串*/
              }
            </Button>
          ) : null}
          <Button onClick={close}>
            {formatMessage({ id: 'odc.Datasource.NewDatasourceDrawer.Cancel' }) /*取消*/}
          </Button>
          <Button onClick={submit} type="primary">
            {formatMessage({ id: 'odc.Datasource.NewDatasourceDrawer.Ok' }) /*确定*/}
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
