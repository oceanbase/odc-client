import {
  checkPublicConnection,
  createPublicConnection,
  getPublicConnectionDetail,
  updatePublicConnection,
} from '@/common/network/manager';
import AddConnectionForm from '@/component/AddConnectionForm';
import type { IManagerPublicConnection } from '@/d.ts';
import { ConnectType, IConnectionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, message, Modal, Space, Typography } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { uniqBy } from 'lodash';
import React from 'react';
import { ManageContext } from '../../context';

import { encrypt } from '@/util/utils';
import styles from './index.less';

const { Paragraph } = Typography;
const defaultFormData: Partial<IManagerPublicConnection> = {
  name: '', // 连接名称，用户自定义
  tenantName: '', // 租户
  clusterName: '', // 集群
  host: '',
  port: undefined,
  sysTenantUsername: '', // sys 租户账号
  // @ts-ignore
  sysTenantPassword: '', // sys 租户账号密码
  readonlyPassword: '', // 只读账号密码
  enabled: true, // 是否启用

  // todo 待对应
  type: ConnectType.OB_ORACLE,
  dbUser: '', // 数据库用户名
  password: '', // 数据库密码
  defaultDBName: '', // 数据库名
};

interface IProps {
  visible: boolean;
  editId?: number;
  isCopy?: boolean;
  onClose: () => void;
  handleStatusChange?: (
    status: boolean,
    connection: IManagerPublicConnection,
    callback: () => void,
  ) => void;
  updatePublicConnection?: (data: IManagerPublicConnection) => void;
}

interface IState {
  formData: Partial<IManagerPublicConnection>;
  extendData: Record<string, any>;
  hasChange: boolean;
  sysAccountExist: boolean;
  relationResourceGroups: {
    name?: string;
    id: number;
  }[];
}

class FormUserModal extends React.PureComponent<IProps, IState> {
  static contextType = ManageContext;

  readonly state = {
    formData: defaultFormData,
    extendData: null,
    hasChange: false,
    sysAccountExist: false,
    relationResourceGroups: [],
  };

  public formRef = React.createRef<FormInstance>();

  componentDidMount() {
    const { editId } = this.props;
    if (editId) {
      this.loadDetail(editId);
    }
  }

  componentDidUpdate(prevProps: IProps) {
    const { editId } = this.props;
    if (editId && editId !== prevProps.editId) {
      this.loadDetail(this.props.editId);
    }
  }

  private loadDetail = async (editId: number) => {
    const { isCopy } = this.props;
    const res = await getPublicConnectionDetail(editId);
    const formData = { ...res };
    if (formData?.resourceGroups?.length) {
      formData.resourceGroups = formData.resourceGroups.map((item: any) => item.id);
    }
    if (isCopy) {
      formData.name = formatMessage(
        {
          id: 'odc.components.FormConnectionModal.FormdatanameCopy',
        },

        { formDataName: formData.name },
      );
      // `${formData.name}_复制`
      formData.copyFromId = editId;
    }
    this.setState(
      {
        formData,
        sysAccountExist: !!formData?.sysTenantUsername,
        relationResourceGroups: res?.resourceGroups ?? [],
      },
      () => {
        this.formRef.current.setFieldsValue(formData);
      },
    );
  };

  private handleSubmit = async (isEdit: boolean) => {
    const { editId } = this.props;
    const { formData } = this.state;
    let data: IManagerPublicConnection = await this.valid();
    if (!data) {
      return;
    }
    data = Object.assign({}, formData, data);
    if (data.resourceGroups?.length) {
      data.resourceGroups = data.resourceGroups.map((item: any) => {
        return {
          id: item,
        };
      });
    }
    if (editId) {
      data[isEdit ? 'id' : 'copyFromId'] = editId;
    }
    data.password = formData.password;
    data.readonlyPassword = formData.readonlyPassword;
    const res = await this.handleCheck(data);
    if (!res) {
      return;
    }
    if (isEdit) {
      this.handleEdit({
        ...data,
        id: editId,
      });
    } else {
      this.handleCreate(data);
    }
  };

  private handleCreate = async (values: Partial<IManagerPublicConnection>) => {
    if (values) {
      const { useSys, ...rest } = values;
      values = {
        ...rest,
        readonlyPassword: encrypt(values.readonlyPassword),
        password: encrypt(values.password),
        sysTenantPassword: useSys ? encrypt(values.sysTenantPassword) : '',
        sysTenantUsername: useSys ? rest.sysTenantUsername : '',
      };
    }
    const data = await createPublicConnection(values);
    if (data) {
      message.success(
        formatMessage({
          id: 'odc.components.FormConnectionModal.PublicConnectionCreated',
        }),

        // 公共连接创建成功
      );
      this.handleResetForm();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormConnectionModal.FailedToCreateAPublic',
        }),

        // 公共连接创建失败
      );
    }
  };

  private handleEdit = async (values: Partial<IManagerPublicConnection>) => {
    if (values) {
      const { useSys, ...rest } = values;
      values = {
        ...values,
        readonlyPassword: encrypt(values.readonlyPassword),
        password: encrypt(values.password),
        sysTenantPassword: useSys ? encrypt(values.sysTenantPassword) : '',
        sysTenantUsername: useSys ? rest.sysTenantUsername : '',
      };
    }
    const data = await updatePublicConnection(values);
    if (data) {
      message.success(
        formatMessage({
          id: 'odc.components.FormConnectionModal.PublicConnectionSaved',
        }),

        // 公共连接保存成功
      );
      this.handleResetForm();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormConnectionModal.UnableToSaveThePublic',
        }),

        // 公共连接保存失败
      );
    }
  };

  private handleCheck = async (values: Partial<IManagerPublicConnection>) => {
    if (values) {
      values = {
        ...values,
        readonlyPassword: encrypt(values.readonlyPassword),
        password: encrypt(values.password),
        sysTenantPassword: encrypt(values.sysTenantPassword),
      };
    }
    const res = await checkPublicConnection(values);
    return new Promise((resolve) => {
      if (res?.allCheckPass) {
        resolve(true);
        return;
      }
      const actionText = values?.id
        ? formatMessage({ id: 'odc.components.FormConnectionModal.Save' }) // 保存
        : formatMessage({ id: 'odc.components.FormConnectionModal.New' }); // 新建
      Modal.confirm({
        title: formatMessage(
          {
            id: 'odc.components.FormConnectionModal.AreYouSureYouWant.2',
          },
          { actionText },
        ), // `确定${actionText}连接吗？`
        content: (
          <div>
            {res?.messages?.map(({ accountName, accountType, message: accountMessage }) => {
              return <Paragraph>{`${accountType} ${accountName}, ${accountMessage}`}</Paragraph>;
            })}
          </div>
        ),

        onCancel: () => resolve(false),
        onOk: () => resolve(true),
      });
    });
  };

  public valid: () => Promise<IManagerPublicConnection> = async () => {
    return new Promise((resolve) => {
      this.formRef.current
        .validateFields()
        .then((values) => {
          resolve(values);
        })
        .catch((errorInfo) => {
          resolve(null);
          this.formRef.current.scrollToField(errorInfo.errorFields[0]?.name);
          console.error(JSON.stringify(errorInfo));
        });
    });
  };

  private handleResetForm = () => {
    this.formRef.current?.resetFields();
    this.setState({
      hasChange: false,
      formData: defaultFormData,
    });

    this.props.onClose();
  };

  private handleCancel = (isEdit: boolean) => {
    const { hasChange } = this.state;
    if (hasChange) {
      Modal.confirm({
        title: isEdit
          ? formatMessage({
              id: 'odc.components.FormConnectionModal.AreYouSureYouWant',
            })
          : // 确定要取消编辑吗？取消保存后，所编辑的内容将不生效
            formatMessage({
              id: 'odc.components.FormConnectionModal.AreYouSureYouWant.1',
            }),

        // 确定要取消新建吗?
        cancelText: formatMessage({
          id: 'odc.components.FormConnectionModal.Cancel',
        }),

        // 取消
        okText: formatMessage({
          id: 'odc.components.FormConnectionModal.Determine',
        }),

        // 确定
        centered: true,
        onOk: () => {
          this.handleResetForm();
        },
      });
    } else {
      this.handleResetForm();
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
      hasChange: true,
      formData: {
        ...formData,
        ...values,
      },
    });
  };

  render() {
    const { visible, editId, handleStatusChange, isCopy } = this.props;
    const { sysAccountExist, formData, extendData, relationResourceGroups } = this.state;
    const { resourceGroups } = this.context;
    const allResourceGroups = uniqBy(
      [...(resourceGroups?.contents ?? []), ...relationResourceGroups],
      'id',
    );
    const isEdit = !!editId && !isCopy;
    const initialValue = formData;
    return (
      <>
        <Drawer
          width={520}
          title={
            isEdit
              ? formatMessage({
                  id: 'odc.components.FormConnectionModal.EditPublicConnection',
                })
              : // 编辑公共连接
                formatMessage({
                  id: 'odc.components.FormConnectionModal.CreateAPublicConnection',
                })

            // 新建公共连接
          }
          className={styles.userModal}
          footer={
            <Space>
              <Button
                onClick={() => {
                  this.handleCancel(isEdit);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.FormConnectionModal.Cancel',
                  })

                  /* 取消 */
                }
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  this.handleSubmit(isEdit);
                }}
              >
                {
                  isEdit
                    ? formatMessage({
                        id: 'odc.components.FormConnectionModal.Save',
                      })
                    : // 保存
                      formatMessage({
                        id: 'odc.components.FormConnectionModal.New',
                      })

                  // 新建
                }
              </Button>
            </Space>
          }
          destroyOnClose
          visible={visible}
          onClose={() => {
            this.handleCancel(isEdit);
          }}
        >
          {initialValue && (
            <AddConnectionForm
              connectionType={IConnectionType.ORGANIZATION}
              isEdit={isEdit}
              isCopy={isCopy}
              forceSys={false}
              valid={this.valid}
              formRef={this.formRef}
              formData={initialValue}
              extendData={extendData}
              isOldPasswordSaved={true}
              sysAccountExist={sysAccountExist}
              resourceList={allResourceGroups}
              onChangeExtendData={this.onChangeExtendData}
              handleStatusChange={handleStatusChange}
              handleValueChange={this.handleValueChange}
            />
          )}
        </Drawer>
      </>
    );
  }
}

export default FormUserModal;
