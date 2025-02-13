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
  getAllConnectTypes,
  getDataSourceModeConfig,
  getDataSourceStyleByConnectType,
  getDsByConnectType,
} from '@/common/datasource';
import { testConnection } from '@/common/network/connection';
import { listEnvironments } from '@/common/network/env';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { ConnectTypeText } from '@/constant/label';
import { AccountType, ConnectType, IConnectionTestErrorType, DatasourceGroup } from '@/d.ts';
import { IDatasource, IDataSourceType } from '@/d.ts/datasource';
import login from '@/store/login';
import { haveOCP } from '@/util/env';
import { formatMessage, getLocalDocs } from '@/util/intl';
import Icon from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Form, FormInstance, Input, Select, Space, Typography, Alert, Button } from 'antd';
import { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import Account from './Account';
import AddressItems from './AddressItems';
import DatasourceFormContext from './context';
import ExtraConfig from './ExtraConfig';
import ParseURLItem from './ParseURLItem';
import ProjectItem from './ProjectItem';
import CloudStorageForm from './CloudStorageForm';
const Option = Select.Option;
export interface IFormRef {
  form: FormInstance<IDatasource>;
}
interface IProps {
  isEdit?: boolean;
  originDatasource?: IDatasource;
  type: ConnectType;
  disableTheme?: boolean;
}
export default forwardRef<IFormRef, IProps>(function DatasourceForm(
  { isEdit, originDatasource, type, disableTheme }: IProps,
  ref,
) {
  const [form] = Form.useForm();
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
  const { data: environments, loading } = useRequest(() => listEnvironments({ enabled: true }));
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
        'sessionInitScript',
        'jdbcUrlParameters',
        'defaultSchema',
        'sid',
        'serviceName',
        'userRole',
        'catalogName',
      ]);
    } catch (e) {}
    if (!values) {
      return;
    }
    const params = isEdit
      ? {
          ...originDatasource,
          ...values,
        }
      : values;
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
              name: ['host'],
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
        case IConnectionTestErrorType.OB_WEAK_READ_CONSISTENCY_REQUIRED: {
          setTestResult({
            errorCode: IConnectionTestErrorType.OB_WEAK_READ_CONSISTENCY_REQUIRED,
            errorMessage: res?.data?.errorMessage,
            active: false,
            type: null,
          });
          break;
        }
      }
    }
    setTestResult(res?.data);
  }

  const connectTypeList: ConnectType[] = type
    ? getAllConnectTypes(getDsByConnectType(type))
    : getAllConnectTypes(IDataSourceType.OceanBase);
  const dsc = getDataSourceModeConfig(type)?.connection;

  const AlertMessage = useMemo(() => {
    if (isConnectTypeBeFileSystemGroup(type)) {
      return (
        <Alert
          message={formatMessage({
            id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.C8E3BD0E',
            defaultMessage: '对象存储仅支持数据归档',
          })}
          type="info"
          showIcon
          style={{
            marginBottom: '12px',
          }}
          action={
            <a
              href={getLocalDocs('100.create-a-personal-connection.html')}
              target={'_blank'}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {formatMessage({
                id: 'src.page.Datasource.Datasource.NewDatasourceDrawer.Form.FE0F7CF3',
                defaultMessage: '查看详情',
              })}
            </a>
          }
        />
      );
    }
  }, [type]);

  return (
    <DatasourceFormContext.Provider
      value={{
        form,
        test,
        testResult,
        isEdit,
        originDatasource,
        dataSourceConfig: dsc,
        disableTheme,
        setTestResult,
      }}
    >
      {AlertMessage}
      <Form
        initialValues={{
          type,
          password: '',
          sysTenantPassword: '',
          userRole: 'NORMAL',
          sid: '',
        }}
        layout="vertical"
        form={form}
        requiredMark="optional"
      >
        {isEdit ? (
          <Form.Item
            rules={[
              {
                required: true,
                max: 128,
              },
            ]}
            label={formatMessage({
              id: 'odc.NewDatasourceDrawer.Form.DataSourceName',
              defaultMessage: '数据源名称',
            })}
            /*数据源名称*/ name={'name'}
          >
            <Input
              style={{
                width: '100%',
              }}
            />
          </Form.Item>
        ) : null}
        {haveOCP() ? null : (
          <Typography>
            <Typography.Paragraph>
              <Space size={4}>
                <span>
                  {
                    formatMessage({
                      id: 'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.DataSourceType',
                      defaultMessage: '数据源类型:',
                    }) /* 数据源类型: */
                  }
                </span>
                <Icon
                  component={getDataSourceStyleByConnectType(type)?.icon?.component}
                  style={{
                    color: getDataSourceStyleByConnectType(type)?.icon?.color,
                    fontSize: 14,
                  }}
                />

                {ConnectTypeText[type] || ''}
              </Space>
            </Typography.Paragraph>
          </Typography>
        )}

        {/* <DBTypeItem /> */}
        <Form.Item
          rules={[
            {
              required: true,
            },
          ]}
          label={formatMessage({
            id: 'odc.NewDatasourceDrawer.Form.Type',
            defaultMessage: '类型',
          })}
          /*类型*/ name={'type'}
          noStyle
        >
          <Select
            disabled={isEdit}
            placeholder={
              formatMessage({
                id: 'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.PleaseChooseTheType.1',
                defaultMessage: '请选择类型',
              }) /* 请选择类型 */
            }
            style={{
              width: 208,
              display: 'none',
            }}
          >
            {connectTypeList?.map((item) => {
              return (
                <Option key={item} value={item}>
                  {ConnectTypeText[item]}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            if (!type) {
              return null;
            }
            return (
              <>
                {!haveOCP() && !dsc?.disableURLParse && (
                  <ParseURLItem
                    unionUser={getDataSourceModeConfig(type)?.connection?.unionUser}
                    autoType={!isEdit}
                  />
                )}
                <AddressItems />
                {dsc?.defaultSchema ? (
                  <Form.Item
                    label={
                      formatMessage({
                        id: 'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.DefaultDatabase',
                        defaultMessage: '默认数据库',
                      }) /* 默认数据库 */
                    }
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    name={'defaultSchema'}
                  >
                    <Input
                      style={{
                        width: 208,
                      }}
                    />
                  </Form.Item>
                ) : null}
                <Account isEdit={isEdit} />
                <CloudStorageForm isEdit={isEdit} />
                <Form.Item
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  label={formatMessage({
                    id: 'odc.NewDatasourceDrawer.Form.Environment',
                    defaultMessage: '环境',
                  })}
                  /*环境*/ name={'environmentId'}
                >
                  <Select
                    loading={loading}
                    style={{
                      width: 208,
                    }}
                  >
                    {environments
                      // ?.filter((env) => env?.enabled)
                      ?.map((env) => {
                        return (
                          <Option key={env.id} value={env.id}>
                            <RiskLevelLabel color={env.style} content={env.name} />
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>
                {!login.isPrivateSpace() && <ProjectItem />}
                <ExtraConfig />
              </>
            );
          }}
        </Form.Item>
      </Form>
    </DatasourceFormContext.Provider>
  );
});
