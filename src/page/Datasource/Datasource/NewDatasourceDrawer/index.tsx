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
import { useEffect, useMemo, useRef } from 'react';
import DatasourceForm, { IFormRef } from './Form';
import { ConnectType, IConnection } from '@/d.ts';

interface IProps {
  visible: boolean;
  isEdit?: boolean;
  isPersonal?: boolean;
  id?: number;
  disableTheme?: boolean;
  type?: ConnectType;
  isCopy?: boolean;
  close: () => void;
  onSuccess: () => void;
}

export default function NewDatasourceDrawer({
  visible,
  isEdit,
  isCopy,
  type,
  id,
  disableTheme,
  close,
  onSuccess,
}: IProps) {
  const formRef = useRef<IFormRef>();

  const { data, loading, run } = useRequest(getConnectionDetail, {
    manual: true,
  });

  function getOriginDatasource(data: IConnection, isCopy: boolean) {
    return isCopy
      ? {
          ...data,
          id: null,
          creatorId: null,
          name: null,
          password: '',
          sysTenantPassword: '',
          projectId: null,
        }
      : { ...data, password: null, sysTenantPassword: null };
  }

  const originDatasource = useMemo(() => {
    return getOriginDatasource(data, isCopy);
  }, [data, isCopy]);

  async function getDataSource(id: number) {
    const data = await run(id);
    if (!data) {
      return;
    }
    formRef.current?.form?.setFieldsValue(getOriginDatasource(data, isCopy));
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
          formatMessage({
            id: 'odc.Datasource.NewDatasourceDrawer.ModifiedSuccessfully',
            defaultMessage: '修改成功',
          }), //修改成功
        );
        onSuccess();
        close();
      }
      return;
    }
    Modal.confirm({
      title: formatMessage({
        id: 'odc.Datasource.NewDatasourceDrawer.EnterADataSourceName',
        defaultMessage: '请输入数据源名称',
      }), //请输入数据源名称
      content: <Input id="newCloudConnectionName" />,
      onOk: async (_close) => {
        const name = (document.querySelector('#newCloudConnectionName') as HTMLInputElement)?.value;
        if (!name) {
          message.warning(
            formatMessage({
              id: 'odc.component.AddConnectionForm.NameItems.EnterAConnectionName',
              defaultMessage: '请输入连接名称',
            }),
          );

          //请输入连接名称
          throw new Error('');
        }
        if (name?.length > 128) {
          message.warning(
            formatMessage({
              id: 'odc.Datasource.NewDatasourceDrawer.TheMaximumLengthOfThe',
              defaultMessage: '名称最大长度为 128',
            }), //名称最大长度为 128
          );
          throw new Error('');
        }
        if (!/^[^\s]*$/.test(name)) {
          message.warning(
            formatMessage({
              id: 'odc.AddConnectionDrawer.AddConnectionForm.TheConnectionNameCannotContain',
              defaultMessage: '连接名称不能含有空格',
            }),
          );

          throw new Error('');
        }
        const isRepeat = await getConnectionExists({
          name,
        });
        if (isRepeat) {
          message.warning(
            formatMessage({
              id: 'odc.Datasource.NewDatasourceDrawer.TheNameAlreadyExists',
              defaultMessage: '名称已存在',
            }), //名称已存在
          );
          throw new Error();
        }
        return new Promise(async (resolve, reject) => {
          const res = await createConnection({ ...values, name });
          if (res) {
            message.success(
              formatMessage({
                id: 'portal.connection.form.save.success',
                defaultMessage: '保存成功',
              }),
            );
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
            defaultMessage: '连接信息复制成功',
          }),
        );
      }
    }
  }
  const connectType = originDatasource?.type || type;
  return (
    <Drawer
      width={520}
      title={
        isEdit
          ? formatMessage({
              id: 'odc.Datasource.NewDatasourceDrawer.EditDataSource',
              defaultMessage: '编辑数据源',
            }) //编辑数据源
          : formatMessage({
              id: 'odc.Datasource.NewDatasourceDrawer.CreateADataSource',
              defaultMessage: '新建数据源',
            }) //新建数据源
      }
      open={visible}
      onClose={close}
      footer={
        <Space style={{ float: 'right' }}>
          {isEdit && !haveOCP() && connectType !== ConnectType.ORACLE ? (
            <Button onClick={copyUri}>
              {
                formatMessage({
                  id: 'odc.Datasource.NewDatasourceDrawer.CopyConnectionString',
                  defaultMessage: '复制连接串',
                }) /*复制连接串*/
              }
            </Button>
          ) : null}
          <Button onClick={close}>
            {
              formatMessage({
                id: 'odc.Datasource.NewDatasourceDrawer.Cancel',
                defaultMessage: '取消',
              }) /*取消*/
            }
          </Button>
          <Button onClick={submit} type="primary">
            {
              formatMessage({
                id: 'odc.Datasource.NewDatasourceDrawer.Ok',
                defaultMessage: '确定',
              }) /*确定*/
            }
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {visible && (
          <DatasourceForm
            disableTheme={disableTheme}
            type={originDatasource?.type || type}
            originDatasource={originDatasource}
            isEdit={isEdit}
            key={visible + ''}
            ref={formRef}
          />
        )}
      </Spin>
    </Drawer>
  );
}
