import { testConnection } from '@/common/network/connection';
import {
  AccountType,
  ConnectionMode,
  IConnectionLabel,
  IConnectionTestErrorType,
  IConnectionType,
  IManagerPublicConnection,
  IManagerResourceGroup,
} from '@/d.ts';
import cluster from '@/store/cluster';
import {
  getDialectTypeFromConnectType,
  isConnectTypeBeCloudType,
  isConnectTypeBeShardingType,
} from '@/util/connection';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Form, Input, message, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import _ from 'lodash';
import React from 'react';
import Account from './Account';
import AddressItems from './AddressItems';
import BaseInfoItems from './BaseInfoItems';
import SSLItem from './SSLItem';
import SysForm from './SysForm';

const baseWidth = 320;
export interface IConnectionTestResponseData {
  active: boolean;
  errorCode: IConnectionTestErrorType;
  errorMessage: string;
}

interface IAddConnectionFormProps {
  formRef: React.RefObject<FormInstance>;
  connectionType: IConnectionType;
  isEdit: boolean;
  isCopy: boolean;
  valid: () => Promise<any>;
  /**
   * 只允许编辑sys
   */

  onlySys?: boolean;
  formData: Partial<IManagerPublicConnection>;
  extendData: Record<string, any>;
  forceSys: boolean;
  labels?: IConnectionLabel[];
  resourceList?: IManagerResourceGroup[];
  isOldPasswordSaved?: boolean;
  onChangeExtendData: (values: any) => void;
  onChangeLabelManageVisible?: (visible: boolean) => void;
  handleStatusChange?: (
    status: boolean,
    connection: IManagerPublicConnection,
    callback: () => void,
  ) => void;
  handleValueChange?: (values: Record<string, any>) => void;
  sysAccountExist?: boolean;
}

class AddConnectionForm extends React.Component<
  IAddConnectionFormProps,
  {
    typeInValidMessage: string;
  }
> {
  private validatingTest: boolean = false;

  constructor(props) {
    super(props);
    this.state = {
      typeInValidMessage: null,
    };
  }
  componentDidMount(): void {
    cluster.loadClusterList(this.props.connectionType);
  }

  public handleConnectionTest = async (
    nameKey: string,
    passwordKey: string,
    accountType: AccountType,
  ) => {
    const { connectionType, formData, isOldPasswordSaved } = this.props;
    this.validatingTest = true;
    const data = await this.props.valid();
    this.validatingTest = false;
    if (connectionType === IConnectionType.ORGANIZATION) {
      if (data && !_.trim(data[nameKey])) {
        this.props.formRef.current.setFields([
          {
            name: nameKey,
            errors: [
              formatMessage({
                id: 'odc.component.AddConnectionForm.EnterADatabaseUsername',
              }),

              // 请填写数据库用户名
            ],
          },
        ]);

        return;
      }
    }
    if (data) {
      const { type, host, port, clusterName, tenantName } = Object.assign({}, formData, data);
      const serverData = {
        type,
        host,
        port,
        clusterName,
        tenantName,
        id: formData.id,
        defaultSchema: formData.defaultSchema,
        username: data[nameKey],
        password: data[passwordKey],
        visibleScope: connectionType,
        sslConfig: formData.sslConfig,
      };
      if (!isOldPasswordSaved && !serverData.password) {
        serverData.password = '';
      }

      const res = await testConnection(serverData, accountType);
      if (res.data?.active) {
        message.success(
          formatMessage({
            id: 'portal.connection.form.test.success',
          }),
        );
      }
      switch (res.data?.errorCode) {
        case IConnectionTestErrorType.UNKNOWN_HOST:
        case IConnectionTestErrorType.HOST_UNREACHABLE: {
          this.props.formRef.current.setFields([
            {
              name: 'host',
              errors: [res.data.errorMessage],
            },
          ]);
          break;
        }
        case IConnectionTestErrorType.UNKNOWN_PORT: {
          this.props.formRef.current.setFields([
            {
              name: 'port',
              errors: [res.data.errorMessage],
            },
          ]);
          break;
        }
        case IConnectionTestErrorType.ILLEGAL_CONNECT_TYPE:
        case IConnectionTestErrorType.CONNECT_TYPE_NOT_MATCH: {
          this.setState({
            typeInValidMessage: res?.data?.errorMessage,
          });
          break;
        }
        default: {
          this.setState({
            typeInValidMessage: null,
          });
        }
      }

      return res?.data;
    }
  };

  private handleChangeFormData = (values: Record<string, any>) => {
    this.props.formRef.current.setFieldsValue(values);
    setTimeout(() => {
      this.props.handleValueChange(values);
    });
  };

  private handleMapPropsToFields = () => {
    const { formData } = this.props;
    const values: Record<string, any> = { ...formData };
    return values;
  };

  render() {
    const {
      isEdit,
      formData,
      onlySys,
      labels,
      isCopy,
      isOldPasswordSaved,
      sysAccountExist,
      formRef,
      extendData,
      connectionType,
      resourceList,
      forceSys,
      handleValueChange,
    } = this.props;
    const { typeInValidMessage } = this.state;
    const isMySQL = getDialectTypeFromConnectType(formData.type) === ConnectionMode.OB_MYSQL;
    const isCloud = isConnectTypeBeCloudType(formData.type);

    return (
      <Form
        layout="vertical"
        colon={false}
        requiredMark="optional"
        ref={formRef}
        initialValues={this.handleMapPropsToFields()}
        onValuesChange={(cValues, values) => {
          const v = { ...cValues };
          if (cValues.sslConfig) {
            v.sslConfig = values.sslConfig;
          }
          handleValueChange(v);
        }}
      >
        <BaseInfoItems
          onlySys={onlySys}
          isEdit={isEdit}
          connectionType={connectionType}
          labels={labels}
          resourceList={resourceList}
          formData={formData}
          extendData={extendData}
          baseWidth={baseWidth}
          typeInValidMessage={typeInValidMessage}
          onChangeExtendData={this.props.onChangeExtendData}
          handleChangeFormData={this.handleChangeFormData}
          onChangeLabelManageVisible={this.props.onChangeLabelManageVisible}
          handleStatusChange={this.props.handleStatusChange}
        />

        <AddressItems
          isCloud={isCloud}
          onlySys={onlySys}
          validatingTest={() => {
            return this.validatingTest;
          }}
          handleChangeFormData={this.handleChangeFormData}
        />

        <Account
          connectionType={connectionType}
          isEdit={isEdit}
          isCopy={isCopy}
          onlySys={onlySys}
          isOldPasswordSaved={isOldPasswordSaved}
          baseWidth={baseWidth}
          handleChangeFormData={this.handleChangeFormData}
          handleConnectionTest={this.handleConnectionTest}
        />

        {isMySQL && (
          <Form.Item
            label={formatMessage({
              id: 'odc.component.AddConnectionForm.DefaultDatabaseSchema',
            })}
            /*默认数据库/schema*/ name="defaultSchema"
          >
            <Input
              disabled={onlySys}
              style={{
                width: baseWidth,
              }}
              placeholder={formatMessage({
                id: 'portal.connection.form.defaultDatabase.placeholder',
              })}
            />
          </Form.Item>
        )}
        <Space style={{ width: '100%' }} direction="vertical">
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              return isConnectTypeBeShardingType(getFieldValue('type')) ? null : (
                <SysForm
                  formRef={formRef}
                  isCopy={isCopy}
                  isEdit={isEdit}
                  forceSys={forceSys}
                  sysAccountExist={sysAccountExist}
                  handleChangeFormData={this.handleChangeFormData}
                  handleConnectionTest={this.handleConnectionTest}
                />
              );
            }}
          </Form.Item>
          {!haveOCP() && <SSLItem />}
        </Space>
      </Form>
    );
  }
}

export default AddConnectionForm;
