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

import { createUser, getUserDetail, updateUser } from '@/common/network/manager';
import { PASSWORD_REGEX, SPACE_REGEX } from '@/constant';
import type { IManagerRole, IManagerUser } from '@/d.ts';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { generateAndDownloadFile, generateRandomPassword } from '@/util/utils';
import { validTrimEmptyWithWarn } from '@/util/valid';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import copy from 'copy-to-clipboard';
import { clone } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

interface IProps {
  settingStore?: SettingStore;
  visible: boolean;
  editId?: number;
  roles: IManagerRole[];
  onClose: () => void;
  onCancel: () => void;
  reloadData?: () => void;
  handleStatusChange?: (status: boolean, user: IManagerUser) => void;
}

interface IState {
  infoVisible: boolean;
  hasChange: boolean;
  userInfo: IUserInfo[];
  roleIds: number[];
  isRequired: boolean;
  invalidIndex: number;
}

interface IUserInfo {
  accountName: string;
  name: string;
  password: string;
}

interface IUserFormData extends IManagerUser {
  userInfo?: {
    accountName: string;
    name: string;
    password: string;
  }[];
}

const defaultUserInfo = {
  accountName: '',
  name: '',
  password: '',
};
@inject('settingStore')
@observer
class FormModal extends React.PureComponent<IProps, IState> {
  readonly state = {
    infoVisible: false,
    hasChange: false,
    userInfo: null,
    roleIds: [],
    isRequired: false,
    invalidIndex: 0,
  };

  public formRef = React.createRef<FormInstance>();

  componentDidMount() {
    const { editId } = this.props;
    if (editId) {
      this.handleEditData(editId);
    }
  }

  componentDidUpdate(prevProps: IProps) {
    const { editId } = this.props;
    if (editId && editId !== prevProps.editId) {
      this.handleEditData(editId);
    }
  }

  private handleEditData = async (editId: number) => {
    const data = await getUserDetail(editId);
    this.formRef.current.setFieldsValue(data);
    this.setState({
      roleIds: data?.roleIds ?? [],
    });
  };

  private handleSubmit = () => {
    const { editId } = this.props;
    this.formRef.current
      .validateFields()
      .then((data) => {
        if (editId) {
          this.handleEdit({ ...data, id: editId });
        } else {
          data.userInfo = data.userInfo.filter(
            ({ accountName, name, password }) => accountName && name && password,
          );

          this.handleCreate(data);
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  private handleCreate = async (values: Partial<IUserFormData>) => {
    const { enabled, roleIds, description } = values;
    const formData = values.userInfo.map((user) => {
      return {
        ...user,
        enabled,
        roleIds,
        description,
      };
    });
    const data = await createUser(formData);
    if (data) {
      message.success(
        formatMessage({ id: 'odc.components.FormUserModal.UserCreated' }), // 用户创建成功
      );
      this.props.reloadData?.();
      this.props.onClose();
      this.setState({
        infoVisible: true,
        userInfo: values.userInfo,
      });
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormUserModal.UnableToCreateTheUser',
        }),

        // 用户创建失败
      );
    }
  };

  private handleEdit = async (values: Partial<IManagerUser>) => {
    const { name, enabled, roleIds, description, id } = values;
    const data = await updateUser({
      name,
      enabled,
      roleIds,
      description,
      id,
    });

    if (data) {
      message.success(
        formatMessage({ id: 'odc.components.FormUserModal.Saved' }), // 用户保存成功
      );
      this.props.reloadData();
      this.props.onClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormUserModal.UnableToSaveTheUser',
        }),

        // 用户保存失败
      );
    }
  };

  private createPassword = (index: number) => {
    const userInfo = [...this.formRef.current.getFieldValue('userInfo')];
    // todo fix bug(antd 动态新增的Item，在change之前 userInfo[index]为undefined)
    userInfo[index] = {
      ...userInfo[index],
      password: generateRandomPassword(),
    };

    this.formRef.current.setFieldsValue({
      userInfo,
    });

    this.handleUserInfoChange();
    this.handleEditStatus();
  };

  private handleCloseInfo = () => {
    this.setState({
      infoVisible: false,
    });
  };

  private getUserInfoText = () => {
    const { userInfo } = this.state;
    return userInfo
      ?.map((item) => {
        return formatMessage(
          {
            id: 'odc.components.FormUserModal.AccountItemaccountnameNameItemnamePassword',
          },

          {
            itemAccountName: item.accountName,
            itemName: item.name,
            itemPassword: item.password,
          },
        );
      })
      ?.join('--------------------');
  };

  private handleDownload = () => {
    this.handleCloseInfo();
    generateAndDownloadFile('users.txt', this.getUserInfoText());
  };

  private handleCopy = () => {
    this.handleCloseInfo();
    copy(this.getUserInfoText());
    message.success(
      formatMessage({
        id: 'odc.components.FormUserModal.UserInformationCopied',
      }),
      //用户信息复制成功
    );
  };

  private checkAccountRepeat = async (ruler, value) => {
    /** 
    const isRepeat = await getAccountExist(value);
    if (isRepeat) {
      throw new Error();
    }
    */
  };
  private handleCancel = (isEdit: boolean) => {
    const { onCancel } = this.props;
    const { hasChange } = this.state;
    if (hasChange) {
      Modal.confirm({
        title: isEdit
          ? formatMessage({
              id: 'odc.components.FormUserModal.AreYouSureYouWant',
            })
          : // 确定要取消编辑吗？取消保存后，所编辑的内容将不生效
            formatMessage({
              id: 'odc.components.FormUserModal.AreYouSureYouWant.1',
            }),

        // 确定要取消新建吗?
        cancelText: formatMessage({
          id: 'odc.components.FormUserModal.Cancel',
        }),

        // 取消
        okText: formatMessage({ id: 'odc.components.FormUserModal.Determine' }), // 确定
        centered: true,
        onOk: () => {
          this.setState({
            hasChange: false,
          });

          onCancel();
        },
      });
    } else {
      onCancel();
    }
  };

  private handleEditStatus = () => {
    this.setState({
      hasChange: true,
    });
  };

  private handleStatusChange = (e: RadioChangeEvent, isEdit: boolean) => {
    if (!e.target.value && isEdit) {
      this.props.handleStatusChange(e.target.value, null);
    }
  };

  private handleCheckUserInfo = async (_, values) => {
    let isRequired = false;
    let invalidIndex = 0;
    const validValues = values.filter((item) => {
      const { accountName, name, password } = item ?? {};
      return accountName && name && password;
    });
    const invalidValue = values.find((item, index) => {
      const { accountName, name, password } = item ?? {};
      invalidIndex = index;
      return (
        (accountName || name || password) &&
        !validValues?.find((value) => value.accountName === accountName)
      );
    });
    if (!validValues.length || invalidValue) {
      if (!validValues.length) {
        invalidIndex = 0;
      }
      isRequired = true;
    }
    this.setState({
      isRequired,
      invalidIndex,
    });

    return isRequired ? Promise.reject(new Error()) : Promise.resolve();
  };

  private handleUserInfoChange = () => {
    this.setState(
      {
        isRequired: false,
      },

      () => {
        this.formRef.current.validateFields();
      },
    );
  };

  private handleRemove = (name: number, remove: (name: number) => void) => {
    const userInfo = this.formRef.current.getFieldValue('userInfo');
    if (userInfo.length === 1) {
      return false;
    }
    remove(name);
  };

  private getRequiredStatus = (index: number) => {
    const { isRequired, invalidIndex } = this.state;
    return isRequired ? index === invalidIndex : false;
  };

  render() {
    const {
      settingStore: { serverSystemInfo },
      visible,
      editId,
      roles,
    } = this.props;
    const { infoVisible, userInfo, roleIds } = this.state;
    const isEdit = !!editId;
    const defaultRoles = serverSystemInfo?.defaultRoles ?? [];
    return (
      <>
        <Drawer
          width={isEdit ? 520 : 720}
          title={
            isEdit
              ? formatMessage({ id: 'odc.components.FormUserModal.EditUser' }) // 编辑用户
              : formatMessage({ id: 'odc.components.FormUserModal.CreateUser' }) // 新建用户
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
                    id: 'odc.components.FormUserModal.Cancel',
                  })

                  /* 取消 */
                }
              </Button>
              <Button type="primary" onClick={this.handleSubmit}>
                {
                  isEdit
                    ? formatMessage({ id: 'odc.components.FormUserModal.Save' }) // 保存
                    : formatMessage({ id: 'odc.components.FormUserModal.New' }) // 新建
                }
              </Button>
            </Space>
          }
          destroyOnClose
          open={visible}
          onClose={() => {
            this.handleCancel(isEdit);
          }}
        >
          {!isEdit && (
            <Alert
              type="info"
              message={formatMessage({
                id: 'odc.components.FormUserModal.TheAccountCannotBeModified',
              })}
              /* 用户新建成功后，账号无法修改 */ showIcon
            />
          )}

          <Form
            ref={this.formRef}
            layout="vertical"
            requiredMark={isEdit ? false : 'optional'}
            initialValues={
              !isEdit
                ? {
                    userInfo: [clone(defaultUserInfo)],
                    enabled: true,
                    roleIds: roles
                      ?.filter((item) => [...defaultRoles].includes(item.name))
                      ?.map((item) => item.id),
                  }
                : null
            }
            onFieldsChange={this.handleEditStatus}
          >
            {isEdit ? (
              <>
                <Form.Item
                  label={formatMessage({
                    id: 'odc.components.FormUserModal.Account',
                  })}
                  /* 账号 */ name="accountName"
                >
                  <Input
                    placeholder={formatMessage({
                      id: 'odc.components.FormUserModal.EnterAnAccount',
                    })}
                    /* 请输入账号 */ disabled
                  />
                </Form.Item>
                <Form.Item
                  label={formatMessage({
                    id: 'odc.components.FormUserModal.Name',
                  })}
                  /* 姓名 */
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'odc.components.FormUserModal.EnterAName',
                      }),

                      // 请输入姓名
                    },
                    {
                      max: 64,
                      message: formatMessage({
                        id: 'odc.components.FormUserModal.TheNameCannotExceedCharacters.2',
                      }), //姓名不超过 64 个字符
                    },
                    {
                      validator: validTrimEmptyWithWarn(
                        formatMessage({
                          id: 'odc.components.FormUserModal.TheNameContainsSpacesAt',
                        }), //姓名首尾包含空格
                      ),
                    },
                  ]}
                >
                  <Input
                    placeholder={formatMessage({
                      id: 'odc.components.FormUserModal.EnterAName',
                    })}

                    /* 请输入姓名 */
                  />
                </Form.Item>
                <Form.Item
                  label={formatMessage({
                    id: 'odc.components.FormUserModal.Password',
                  })}
                  /* 密码 */ name="password"
                >
                  <Input placeholder="******" disabled />
                </Form.Item>
              </>
            ) : (
              <>
                <div className={styles.infoLabel}>
                  {
                    formatMessage({
                      id: 'odc.components.FormUserModal.UserInformation',
                    })

                    /* 用户信息 */
                  }
                </div>
                <Form.List
                  name="userInfo"
                  rules={[
                    {
                      validator: this.handleCheckUserInfo,
                    },
                  ]}
                >
                  {(fields, { add, remove }) => (
                    <div className={styles.infoBlock}>
                      {fields.map(({ key, name, fieldKey }: any, index) => (
                        <Space key={key} align="baseline">
                          <Form.Item
                            style={{ width: '160px' }}
                            name={[name, 'accountName']}
                            fieldKey={[fieldKey, 'accountName']}
                            rules={[
                              {
                                required: this.getRequiredStatus(index),
                                message: formatMessage({
                                  id: 'odc.components.FormUserModal.EnterAnAccount.1',
                                }),

                                //请输账号
                              },
                              {
                                min: 4,
                                max: 64,
                                message: formatMessage({
                                  id: 'odc.components.FormUserModal.AccountNoMoreThanCharacters',
                                }), //账号不超过 64 个字符/账号不能少于 4 个字符
                              },
                              {
                                pattern: /^[a-zA-Z0-9_\.\+\@\#\$\%]+$/,
                                message: formatMessage({
                                  id: 'odc.components.FormUserModal.ItCanContainLettersDigits',
                                }),

                                // 支持英文、数字、下划线和特殊字符的组合(即：._+@#$%)
                              },
                              {
                                validator: validTrimEmptyWithWarn(
                                  formatMessage({
                                    id: 'odc.components.FormUserModal.TheEndOfTheAccount',
                                  }), //账号首尾包含空格
                                ),
                              },
                            ]}
                          >
                            <Input
                              onChange={this.handleUserInfoChange}
                              placeholder={formatMessage({
                                id: 'odc.components.FormUserModal.EnterAnAccount',
                              })}

                              /* 请输入账号 */
                            />
                          </Form.Item>
                          <Form.Item
                            style={{ width: '240px' }}
                            name={[name, 'name']}
                            fieldKey={[fieldKey, 'name']}
                            rules={[
                              {
                                required: this.getRequiredStatus(index),
                                message: formatMessage({
                                  id: 'odc.components.FormUserModal.EnterAName.1',
                                }),

                                //请输姓名
                              },
                              {
                                max: 64,
                                message: formatMessage({
                                  id: 'odc.components.FormUserModal.TheNameCannotExceedCharacters.2',
                                }), //姓名不超过 64 个字符
                              },
                              {
                                validator: validTrimEmptyWithWarn(
                                  formatMessage({
                                    id: 'odc.components.FormUserModal.TheNameContainsSpacesAt',
                                  }), //姓名首尾包含空格
                                ),
                              },
                            ]}
                          >
                            <Input
                              onChange={this.handleUserInfoChange}
                              placeholder={formatMessage({
                                id: 'odc.components.FormUserModal.EnterAName',
                              })}

                              /* 请输入姓名 */
                            />
                          </Form.Item>
                          <Form.Item
                            style={{ width: '160px' }}
                            name={[name, 'password']}
                            fieldKey={[fieldKey, 'password']}
                            rules={[
                              {
                                required: this.getRequiredStatus(index),
                                message: formatMessage({
                                  id: 'odc.components.FormUserModal.EnterAPassword.1',
                                }),

                                //请输密码
                              },
                              {
                                pattern: PASSWORD_REGEX,
                                message: formatMessage({
                                  id: 'odc.components.FormUserModal.TheDescriptionMustBeTo',
                                }),

                                // 长度为 8~32 位, 至少包含2位数字、2位大写字母、2位小写字母和2位特殊字(即：._+@#$%)
                              },
                              {
                                pattern: SPACE_REGEX,
                                message: formatMessage({
                                  id: 'odc.components.FormUserModal.ThePasswordCannotContainSpaces',
                                }), //密码不能包含空格
                              },
                            ]}
                          >
                            <Input
                              onChange={this.handleUserInfoChange}
                              placeholder={formatMessage({
                                id: 'odc.components.FormUserModal.EnterAPassword',
                              })}

                              /* 请输入密码 */
                            />
                          </Form.Item>
                          <Button
                            type="link"
                            onClick={() => {
                              this.createPassword(index);
                            }}
                          >
                            {
                              formatMessage({
                                id: 'odc.components.FormUserModal.RandomPassword',
                              })

                              /* 随机密码 */
                            }
                          </Button>
                          <DeleteOutlined onClick={() => this.handleRemove(name, remove)} />
                        </Space>
                      ))}

                      <Form.Item style={{ marginBottom: 0, width: '578px' }}>
                        <Button
                          type="dashed"
                          onClick={() => add(clone(defaultUserInfo))}
                          block
                          icon={<PlusOutlined />}
                        >
                          {
                            formatMessage({
                              id: 'odc.components.FormUserModal.AddUser',
                            })

                            /* 添加用户 */
                          }
                        </Button>
                      </Form.Item>
                    </div>
                  )}
                </Form.List>
              </>
            )}

            <Form.Item
              label={formatMessage({
                id: 'odc.components.FormUserModal.AccountStatus',
              })}
              /* 账号状态 */
              name="enabled"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.components.FormUserModal.EnterAnAccount',
                  }),

                  // 请输入账号
                },
              ]}
            >
              <Radio.Group
                onChange={(e) => {
                  this.handleStatusChange(e, isEdit);
                }}
              >
                <Radio value={true}>
                  {
                    formatMessage({
                      id: 'odc.components.FormUserModal.Enable',
                    })

                    /* 启用 */
                  }
                </Radio>
                <Radio value={false}>
                  {
                    formatMessage({
                      id: 'odc.components.FormUserModal.Disable',
                    })

                    /* 停用 */
                  }
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={formatMessage({
                id: 'odc.components.FormUserModal.Role',
              })}
              /* 角色 */
              name="roleIds"
              rules={[
                {
                  required: false,
                  message: formatMessage({
                    id: 'odc.components.FormUserModal.SelectARole',
                  }),

                  // 请选择角色
                },
              ]}
            >
              <Select
                mode="multiple"
                showSearch={true}
                filterOption={(value, option) => {
                  return option?.label.indexOf(value) >= 0;
                }}
                notFoundContent={
                  <span>
                    {
                      formatMessage({
                        id: 'odc.components.FormUserModal.NoRoleIsAvailableCreate',
                      })

                      /* 暂无角色，请在角色管理中创建角色 */
                    }
                  </span>
                }
                options={roles?.map((item) => ({
                  label: item.name,
                  value: item.id,
                  disabled: item.type === 'INTERNAL' && !roleIds?.includes(item.id),
                }))}
              />
            </Form.Item>
            <Form.Item
              label={formatMessage({
                id: 'odc.components.FormUserModal.Note',
              })}
              /* 备注 */
              name="description"
              rules={[
                {
                  max: 140,
                  message: formatMessage({
                    id: 'odc.components.FormUserModal.TheDescriptionCannotExceedCharacters',
                  }),

                  // 备注不超过 140 个字符
                },
              ]}
            >
              <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} />
            </Form.Item>
          </Form>
        </Drawer>
        <Modal
          open={infoVisible}
          wrapClassName={styles.userInfoModal}
          title={formatMessage({
            id: 'odc.components.FormUserModal.UserCreated',
          })}
          /* 用户创建成功 */
          footer={
            <Space>
              <Button onClick={this.handleCloseInfo}>
                {
                  formatMessage({
                    id: 'odc.components.FormUserModal.Close',
                  })
                  /*关闭*/
                }
              </Button>
              <Button onClick={this.handleDownload}>
                {
                  formatMessage({
                    id: 'odc.components.FormUserModal.DownloadUserInformation',
                  })

                  /* 下载用户信息 */
                }
              </Button>
              <Button onClick={this.handleCopy} type="primary">
                {
                  formatMessage({
                    id: 'odc.components.FormUserModal.CopyUserInformation',
                  })

                  /* 复制用户信息 */
                }
              </Button>
            </Space>
          }
          onCancel={this.handleCloseInfo}
        >
          <Alert
            message={formatMessage({
              id: 'odc.components.FormUserModal.ToEnsureSecurityTheSystem',
            })}
            /* 为保障安全，系统内无法查看用户密码，请先保存用户信息若忘记密码可重置 */
            type="info"
            showIcon
          />

          <div className={styles.infoContent}>
            {userInfo?.map((item) => {
              const { accountName, name, password } = item;
              return (
                <Descriptions column={1} size="small" key={accountName}>
                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.components.FormUserModal.Account',
                    })}

                    /* 账号 */
                  >
                    {accountName}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.components.FormUserModal.Name',
                    })}

                    /* 姓名 */
                  >
                    {name}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.components.FormUserModal.Password',
                    })}

                    /* 密码 */
                  >
                    {password}
                  </Descriptions.Item>
                </Descriptions>
              );
            })}
          </div>
        </Modal>
      </>
    );
  }
}

export default FormModal;
