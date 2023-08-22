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

import { testConnection } from '@/common/network/connection';
import { listEnvironments } from '@/common/network/env';
import { AccountType, ConnectType, IConnectionTestErrorType } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import { isConnectTypeBeShardingType } from '@/util/connection';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Form, FormInstance, Input, Select, Space } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';
import Account from './Account';
import AddressItems from './AddressItems';
import DatasourceFormContext from './context';
import DBTypeItem from './DBTypeItem';
import ParseURLItem from './ParseURLItem';
import SSLItem from './SSLItem';
import SysForm from './SysForm';

const Option = Select.Option;

export interface IFormRef {
  form: FormInstance<IDatasource>;
}

interface IProps {
  isEdit?: boolean;
  originDatasource?: IDatasource;
  isPersonal?: boolean;
}

export default forwardRef<IFormRef, IProps>(function DatasourceForm(
  { isEdit, originDatasource, isPersonal }: IProps,
  ref,
) {
  const [form] = Form.useForm();

  const sysAccountExist = isEdit && !!originDatasource?.sysTenantUsername;

  const [testResult, setTestResult] = useState<{
    active: boolean;
    errorCode: IConnectionTestErrorType;
    errorMessage: string;
    type: ConnectType;
  }>();

  useImperativeHandle(
    ref,
    () => {
      return {
        form,
      };
    },
    [form],
  );

  const { data: environments, loading } = useRequest(listEnvironments);

  async function test() {
    setTestResult(null);
    let values;
    try {
      values = await form.validateFields([
        'type',
        'host',
        'port',
        'clusterName',
        'tenantName',
        'username',
        'password',
        'sslConfig',
      ]);
    } catch (e) {}
    if (!values) {
      return;
    }
    const params = isEdit ? { ...originDatasource, ...values } : values;
    const res = await testConnection(params, AccountType.MAIN, true);
    if (res?.errMsg) {
      setTestResult({
        errorCode: IConnectionTestErrorType.UNKNOWN,
        errorMessage: res?.errMsg,
        active: false,
        type: null,
      });
      return;
    }
    if (!res?.data?.active) {
      switch (res?.data?.errorCode) {
        case IConnectionTestErrorType.CONNECT_TYPE_NOT_MATCH:
        case IConnectionTestErrorType.ILLEGAL_CONNECT_TYPE: {
          // const a = form.getFieldInstance
          form.setFields([
            {
              errors: [res?.data?.errorMessage],
              name: ['type'],
            },
          ]);
          break;
        }
        case IConnectionTestErrorType.UNKNOWN_HOST:
        case IConnectionTestErrorType.HOST_UNREACHABLE: {
          // const a = form.getFieldInstance
          form.setFields([
            {
              errors: [res?.data?.errorMessage],
              name: ['host'],
            },
          ]);
          break;
        }
        case IConnectionTestErrorType.UNKNOWN_PORT: {
          // const a = form.getFieldInstance
          form.setFields([
            {
              errors: [res?.data?.errorMessage],
              name: ['port'],
            },
          ]);
          break;
        }
      }
    }
    setTestResult(res?.data);
  }

  return (
    <DatasourceFormContext.Provider
      value={{
        form,
        test,
        testResult,
        isEdit,
        isPersonal,
        originDatasource,
      }}
    >
      <Form
        initialValues={{
          type: ConnectType.OB_ORACLE,
        }}
        layout="vertical"
        form={form}
        requiredMark="optional"
      >
        {isEdit ? (
          <Form.Item
            rules={[{ required: true, max: 32 }]}
            label={formatMessage({ id: 'odc.NewDatasourceDrawer.Form.DataSourceName' })}
            /*数据源名称*/ name={'name'}
          >
            <Input style={{ width: '100%' }} />
          </Form.Item>
        ) : null}
        <DBTypeItem />
        {!haveOCP() && <ParseURLItem autoType={!isEdit} />}
        <Form.Item
          rules={[{ required: true }]}
          label={formatMessage({ id: 'odc.NewDatasourceDrawer.Form.Type' })} /*类型*/
          name={'type'}
          noStyle={haveOCP() ? true : false}
        >
          <Select
            disabled={isEdit}
            style={{ width: 208, display: haveOCP() ? 'none' : 'inline-block' }}
          >
            <Option value={ConnectType.OB_MYSQL}>OceanBase MySQL</Option>
            <Option value={ConnectType.OB_ORACLE}>OceanBase Oracle</Option>
            {!haveOCP() && (
              <>
                <Option value={ConnectType.CLOUD_OB_MYSQL}>OceanBase MySQL Cloud</Option>
                <Option value={ConnectType.CLOUD_OB_ORACLE}>OceanBase Oracle Cloud</Option>
                {/* <Option value={ConnectType.ODP_SHARDING_OB_MYSQL}>OceanBase MySQL Sharding</Option> */}
              </>
            )}
          </Select>
        </Form.Item>
        <AddressItems />
        <Account isEdit={isEdit} />
        <Form.Item
          rules={[{ required: true }]}
          label={formatMessage({ id: 'odc.NewDatasourceDrawer.Form.Environment' })}
          /*环境*/ name={'environmentId'}
        >
          <Select loading={loading} style={{ width: 208 }}>
            {environments?.map((env) => {
              return <Option value={env.id}>{env.name}</Option>;
            })}
          </Select>
        </Form.Item>
        {!haveOCP() && (
          <Space style={{ width: '100%' }} direction="vertical">
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                return isConnectTypeBeShardingType(getFieldValue('type')) ? null : (
                  <SysForm formRef={form} isEdit={isEdit} sysAccountExist={sysAccountExist} />
                );
              }}
            </Form.Item>
            <SSLItem />
          </Space>
        )}
      </Form>
    </DatasourceFormContext.Provider>
  );
});
