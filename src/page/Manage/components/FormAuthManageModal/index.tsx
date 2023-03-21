import { batchUpdateUserPermissions, getUserPermissionsList } from '@/common/network/manager';
import RAMAuthAlertInfo from '@/component/RAMAuthAlertInfo';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Drawer, Form, message, Select, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { uniqBy } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { ManageContext } from '../../context';

const actionOptions = [
  {
    label: formatMessage({ id: 'odc.components.FormAuthManageModal.ReadOnly' }), //只读
    value: 'readonlyconnect',
  },

  {
    label: formatMessage({
      id: 'odc.components.FormAuthManageModal.ReadWrite',
    }), //读写
    value: 'connect',
  },

  {
    label: formatMessage({ id: 'odc.components.FormAuthManageModal.CanApply' }), //可申请
    value: 'apply',
  },
];

interface IProps {
  visible: boolean;
  id?: number;
  onClose: () => void;
}

const FormAuthManageModal: React.FC<IProps> = (props) => {
  const { visible, id, onClose } = props;
  const { users, getUserList } = useContext(ManageContext);
  const [options, setOptions] = useState([]);
  const [userActions, setUserActions] = useState([]);
  const [isRequired, setIsRequired] = useState(false);
  const [permissionUsers, setPermissionUsers] = useState([]);
  const [form] = useForm();
  const userOptions = uniqBy([...(options ?? []), ...permissionUsers], 'value');

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const userActions = values?.userActions?.filter((item) => {
          const _values = Object.values(item);
          return !_values?.some((value) => !value);
        });
        const res = await batchUpdateUserPermissions({
          resourceIdentifier: `ODC_CONNECTION:${id}`,
          userActions,
        });

        if (res) {
          message.success(
            formatMessage({
              id: 'odc.components.FormAuthManageModal.SubmittedSuccessfully',
            }), //提交成功
          );
          handleCancel();
        } else {
          message.error(
            formatMessage({
              id: 'odc.components.FormAuthManageModal.FailedToSubmit',
            }), //提交失败
          );
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const loadUserActions = async (id) => {
    const userPermissions = await getUserPermissionsList({
      resourceIdentifier: `ODC_CONNECTION:${id}`,
    });
    const userActions = userPermissions?.map(({ userId, action }) => {
      return { userId, action };
    });
    const permissionUsers = userPermissions?.map(({ userId, userName, userAccountName }) => {
      return {
        label: `${userName}(${userAccountName})`,
        value: userId,
      };
    });
    form.setFieldsValue({
      userActions,
    });
    setUserActions(userActions);
    setPermissionUsers(permissionUsers);
  };

  const handleChange = () => {
    const userActions = form.getFieldValue('userActions');
    setUserActions(userActions);
  };

  // 有效性校验
  const handleValidator = async (_, values) => {
    let itemRequired = false;
    if (!values?.length) {
      return Promise.resolve();
    }
    const invalidValues = values.filter((item) => {
      const _values = Object.values(item);
      if (!_values.length) {
        return false;
      }
      // 包含空值 && 不是所有筛选项为空
      return _values?.some((value) => !value) && !_values?.every((value) => !value);
    });
    if (invalidValues.length) {
      itemRequired = true;
    }
    setIsRequired(itemRequired);
    return itemRequired ? Promise.reject(new Error()) : Promise.resolve();
  };

  useEffect(() => {
    if (visible) {
      loadUserActions(id);
    } else {
      form.resetFields();
    }
  }, [visible]);

  useEffect(() => {
    getUserList();
  }, []);

  useEffect(() => {
    const options = users?.contents?.map((user) => {
      return {
        label: `${user.name}(${user.accountName})`,
        value: user.id,
      };
    });
    setOptions(options);
  }, [users]);

  useEffect(() => {
    if (userActions?.length) {
      const _options = options?.map((item) => {
        return {
          ...item,
          disabled: userActions?.some((action) => action?.userId === item.value),
        };
      });
      setOptions(_options);
    }
  }, [userActions]);

  return (
    <Drawer
      width={720}
      title={formatMessage({
        id: 'odc.components.FormAuthManageModal.ManagePermissions',
      })} /*管理权限*/
      footer={
        <Space>
          <Button onClick={handleCancel}>
            {
              formatMessage({
                id: 'odc.components.FormAuthManageModal.Cancel',
              }) /*取消*/
            }
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {
              formatMessage({
                id: 'odc.components.FormAuthManageModal.Save',
              }) /*保存*/
            }
          </Button>
        </Space>
      }
      destroyOnClose
      visible={visible}
      onClose={handleCancel}
      footerStyle={{
        textAlign: 'right',
      }}
    >
      <Alert
        type="info"
        message={formatMessage({
          id: 'odc.components.FormAuthManageModal.CurrentlyUsersWhoCanObtain',
        })}
        /*暂不支持通过角色获得连接访问权限的用户*/ showIcon
      />
      <RAMAuthAlertInfo />
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        style={{ marginTop: '12px' }}
        onFieldsChange={handleChange}
      >
        <Form.List
          name="userActions"
          rules={[
            {
              validator: handleValidator,
            },
          ]}
        >
          {(fields, { add, remove }) => {
            const showRemove = true;
            return (
              <>
                <Space style={{ paddingBottom: '4px' }}>
                  <div style={{ width: '522px' }}>
                    {
                      formatMessage({
                        id: 'odc.components.FormAuthManageModal.UsersWhoCanAccessThe',
                      }) /*可访问连接的用户*/
                    }
                  </div>
                  <div style={{ width: '100px' }}>
                    {
                      formatMessage({
                        id: 'odc.components.FormAuthManageModal.AccessPermission',
                      }) /*访问权限*/
                    }
                  </div>
                </Space>
                {fields.map(({ key, name, fieldKey }: any) => (
                  <Space key={key} align="baseline">
                    <Form.Item
                      name={[name, 'userId']}
                      fieldKey={[fieldKey, 'userId']}
                      style={{ width: '522px' }}
                      rules={[
                        {
                          required: isRequired,
                          message: formatMessage({
                            id: 'odc.components.FormAuthManageModal.PleaseSelect',
                          }), //请选择
                        },
                      ]}
                    >
                      <Select
                        placeholder={formatMessage({
                          id: 'odc.components.FormAuthManageModal.SelectAUser',
                        })} /*请选择用户*/
                        options={userOptions}
                        showSearch={true}
                        filterOption={(value, option) => {
                          return option?.label?.indexOf(value) >= 0;
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      name={[name, 'action']}
                      fieldKey={[fieldKey, 'action']}
                      style={{ width: '100px' }}
                      rules={[
                        {
                          required: isRequired,
                          message: formatMessage({
                            id: 'odc.components.FormAuthManageModal.PleaseSelect',
                          }), //请选择
                        },
                      ]}
                    >
                      <Select
                        placeholder={formatMessage({
                          id: 'odc.components.FormAuthManageModal.AccessPermission',
                        })}
                        /*访问权限*/ options={actionOptions}
                      />
                    </Form.Item>
                    {showRemove && (
                      <DeleteOutlined
                        onClick={() => {
                          remove(name);
                        }}
                      />
                    )}
                  </Space>
                ))}

                <Form.Item style={{ marginBottom: 0, width: '630px' }}>
                  <Button
                    type="dashed"
                    onClick={() =>
                      add({
                        userId: undefined,
                        action: undefined,
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.FormAuthManageModal.Add',
                      }) /*添加*/
                    }
                  </Button>
                </Form.Item>
              </>
            );
          }}
        </Form.List>
      </Form>
    </Drawer>
  );
};

export default FormAuthManageModal;
