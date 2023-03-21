import {
  createConnection,
  generateConnectionStr,
  getConnectionDetail,
  getConnectionExists,
  updateConnection,
} from '@/common/network/connection';
import AddConnectionForm from '@/component/AddConnectionForm';
import { reconnect } from '@/component/ReconnectModal';
import { ConnectType, IConnectionFormData, IConnectionType } from '@/d.ts';
import { ClusterStore } from '@/store/cluster';
import type { ConnectionStore } from '@/store/connection';
import { ModalStore } from '@/store/modal';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Input, message, Modal } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import copy from 'copy-to-clipboard';
import { isUndefined } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';

interface IAddConnectionDrawerProps {
  modalStore?: ModalStore;
  clusterStore?: ClusterStore;
  connectionStore?: ConnectionStore;
  connectionType: IConnectionType;
  onlySys?: boolean;
  onChangeLabelManageVisible?: (visible: boolean) => void;
  // reloadData 在连接列表中是必须的，在其他场景是可选的，如：workSpace 中使用 AddConnectionDrawer 的场景(用于 sys 租户视图配置)，可以不做 reload 操作
  reloadData?: () => void;
}

@inject('modalStore', 'connectionStore', 'clusterStore')
@observer
class AddConnectionDrawer extends React.Component<
  IAddConnectionDrawerProps,
  {
    formData: IConnectionFormData;
    isEdit: boolean;
    isCopy: boolean;
    /**
     * 老密码是否存在
     */
    isOldPasswordSaved: boolean;
    /**
     * 表单是否改变过
     */
    changed: boolean;
    /**
     * sys 账号是否已经存在，存在的情况下，就要显示隐藏的密码
     */
    sysAccountExist: boolean;
    extendData: Record<string, any>;
  }
> {
  static getInitFormData = (): IConnectionFormData => {
    return {
      name: '', // 连接名称，用户自定义
      passwordSaved: true,
      type: window._odc_params?.dbMode === 'MySQL' ? ConnectType.OB_MYSQL : ConnectType.OB_ORACLE,
      username: '', // 数据库用户名
      password: '', // 数据库密码 // 暂时保留 v2中进行了拆分
      defaultSchema: '', // 数据库名
      host: '',
      port: undefined,
      clusterName: window._odc_params?.clusterId || '', // 集群
      tenantName: window._odc_params?.tenantId || '', // 租户
      sysTenantUsername: '', // sys 租户账号
      sysTenantPassword: '', // sys 租户账号密码
    };
  };

  constructor(props: IAddConnectionDrawerProps) {
    super(props);
    if (props.modalStore.addConnectionData) {
      const modalData: IConnectionFormData = props.modalStore.addConnectionData.data;
      const { id, passwordSaved } = modalData;
      const isCopy = props.modalStore.addConnectionData.isCopy;
      const isEdit = props.modalStore.addConnectionData.isEdit;
      this.state = {
        formData: {
          ...modalData,
          copyFromId: isCopy ? modalData.id : undefined,
        },

        changed: false,
        isEdit,
        isCopy,
        isOldPasswordSaved: passwordSaved,
        sysAccountExist: false,
        extendData: null,
      };

      // @ts-ignore
      this.loadExistData(id);
    } else {
      this.state = {
        formData: {
          ...AddConnectionDrawer.getInitFormData(),
          visibleScope: props.connectionType,
        },

        changed: false,
        isEdit: false,
        isCopy: false,
        isOldPasswordSaved: AddConnectionDrawer.getInitFormData().passwordSaved,
        sysAccountExist: false,
        extendData: null,
      };

      if (haveOCP()) {
        /**
         * 公有云要初始化一下租户和集群信息
         */
        this.state.formData.clusterName &&
          props.clusterStore.loadClusterTenants(this.state.formData.clusterName);
        this.state.formData.tenantName &&
          props.clusterStore.loadTenantDBUsers(
            this.state.formData.clusterName,
            this.state.formData.tenantName,
          );
      }
    }
  }

  public formRef = React.createRef<FormInstance>();

  private loadExistData = async (sid: number) => {
    const data = await getConnectionDetail(sid);
    if (!data) {
      return;
    }
    const sysAccountExist = !!data.sysUser;
    this.setState({
      formData: {
        ...this.state.formData,
        ...data,
        copyFromSid: this.state.formData.copyFromSid,
        sessionName: this.state.formData.sessionName,
        sysUserPassword: sysAccountExist ? null : '',
        /**
         * 密码被保存过并且存在用户的情况下，设置passowrd为null可以采用后端的password
         */
        password: !!data.passwordSaved && !!data.dbUser ? null : '',
      },
      isOldPasswordSaved: !!data.passwordSaved,
      sysAccountExist,
      extendData: data.properties,
    });
  };

  private closeSelf = () => {
    if (this.state.changed) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.AddConnectionDrawer.YouHaveAnUnsavedWindow',
        }),

        centered: true,
        onOk: () => {
          this.props.modalStore.changeAddConnectionModal(false);
        },
      });
    } else {
      this.props.modalStore.changeAddConnectionModal(false);
    }
  };

  private submitWithConnectionName = async () => {
    if (this.state.isEdit) {
      this.handleSubmit();
    } else {
      const data: IConnectionFormData = await this.valid();
      if (!data) {
        return;
      }
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.AddConnectionDrawer.EnterAConnectionName',
        }), //请输入连接名
        content: <Input id="newCloudConnectionName" />,
        onOk: async (close) => {
          const name = (document.querySelector('#newCloudConnectionName') as HTMLInputElement)
            ?.value;
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
            visibleScope: IConnectionType.PRIVATE,
          });
          if (isRepeat) {
            message.warn(
              formatMessage({
                id: 'odc.component.AddConnectionDrawer.TheConnectionNameAlreadyExists',
              }), //连接名称已存在
            );
            throw new Error();
          }
          return new Promise((resolve, reject) => {
            this.setState(
              {
                formData: { ...this.state.formData, name },
              },

              async () => {
                if (await this.handleSubmit()) {
                  resolve(true);
                } else {
                  reject();
                }
              },
            );
          });
        },
      });
    }
  };

  private handleSubmit = async () => {
    const { isEdit, formData, extendData } = this.state;
    const data: IConnectionFormData = await this.valid();
    const { password, passwordSaved } = formData;
    if (data) {
      let res;
      const { useSys, ...rest } = data;
      const params = {
        ...formData,
        ...data,
        properties: extendData,
        sysTenantUsername: useSys ? rest.sysTenantUsername : '',
        sysTenantPassword: useSys ? rest.sysTenantPassword : '',
        password: passwordSaved && isUndefined(password) ? null : password,
      };
      if (isEdit) {
        res = await updateConnection(params);
      } else {
        res = await createConnection(params);
      }
      if (res) {
        message.success(formatMessage({ id: 'portal.connection.form.save.success' }));
        if (this.props.modalStore?.addConnectionData?.resetConnect) {
          // 需要重新建立连接
          reconnect();
        } else {
          this.props?.reloadData();
          this.props.modalStore.changeAddConnectionModal(false);
        }
      }
      return !!res;
    }
  };

  private valid = async () => {
    return new Promise((resolve) => {
      this.formRef.current
        .validateFields()
        .then((values) => {
          resolve(values);
        })
        .catch((errorInfo) => {
          resolve(null);
          this.formRef.current.scrollToField(errorInfo.errorFields[0].name);
          console.error(JSON.stringify(errorInfo));
        });
    });
  };

  private copyConnectStr = async () => {
    const data: any = await this.valid();
    if (data) {
      const res = await generateConnectionStr({
        ...this.state.formData,
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
  };

  private onChangeExtendData = (values) => {
    const { extendData } = this.state;
    this.setState({
      extendData: { ...extendData, ...values },
    });
  };

  private handleValueChange = (values: Record<string, any>) => {
    const { formData } = this.state;
    this.setState({
      changed: true,
      formData: {
        ...formData,
        ...values,
      },
    });
  };

  render() {
    const {
      modalStore,
      onlySys,
      connectionStore: { labels },
    } = this.props;
    const { formData, isEdit, isCopy, isOldPasswordSaved, sysAccountExist, extendData } =
      this.state;
    return (
      <Drawer
        visible={modalStore.addConnectionVisible}
        onClose={this.closeSelf}
        title={
          isEdit
            ? formatMessage({
                id: 'portal.connection.edit',
              })
            : formatMessage({
                id: 'odc.components.AddConnectionDrawer.CreateAPersonalConnection',
              })
          //新建个人连接
        }
        width={520}
        bodyStyle={{
          position: 'absolute',
          top: 55,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 53,
            left: 0,
            padding: '16px 24px 24px 24px',
            overflow: 'auto',
          }}
        >
          <AddConnectionForm
            formRef={this.formRef}
            connectionType={IConnectionType.PRIVATE}
            isEdit={isEdit}
            labels={labels}
            isCopy={isCopy}
            forceSys={modalStore.addConnectionData?.forceSys}
            onlySys={onlySys}
            formData={formData}
            isOldPasswordSaved={isOldPasswordSaved}
            sysAccountExist={sysAccountExist}
            extendData={extendData}
            valid={this.valid}
            onChangeExtendData={this.onChangeExtendData}
            handleValueChange={this.handleValueChange}
            onChangeLabelManageVisible={this.props?.onChangeLabelManageVisible}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid var(--odc-border-color)',
            padding: '10px 16px',
            background: 'var(--odc-antd-drawer-bg-color)',
            textAlign: 'right',
          }}
        >
          {!haveOCP() && (
            <Button onClick={this.copyConnectStr} style={{ marginRight: 8 }}>
              {formatMessage({
                id: 'odc.components.AddConnectionDrawer.CopyConnectionString',
              })}
            </Button>
          )}

          <Button onClick={this.closeSelf} style={{ marginRight: 8 }}>
            {formatMessage({ id: 'odc.components.AddConnectionDrawer.Cancel' })}
          </Button>
          <Button onClick={this.submitWithConnectionName} type="primary">
            {formatMessage({ id: 'portal.connection.form.save' })}
          </Button>
        </div>
      </Drawer>
    );
  }
}

export default AddConnectionDrawer;
