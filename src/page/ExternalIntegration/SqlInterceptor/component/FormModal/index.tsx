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
  checkIntegrationExists,
  createIntegration,
  getIntegrationDetail,
  updateIntegration,
} from '@/common/network/manager';
import YamlEditor from '@/component/YamlEditor';
import { IManagerIntegration, IntegrationType } from '@/d.ts';
import { EncryptionAlgorithm } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { decrypt, encrypt } from '@/util/utils';
import { validTrimEmptyWithWarn } from '@/util/valid';
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Radio,
  RadioChangeEvent,
  Select,
  Space,
} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import tracert from '@/util/tracert';

interface IProps {
  type: IntegrationType;
  title: string;
  visible: boolean;
  template: string;
  editId?: number;
  onClose: () => void;
  handleStatusChange?: (status: boolean, data: IManagerIntegration) => void;
  reloadData?: () => void;
}

const FormSqlInterceptorModal: React.FC<IProps> = (props) => {
  const { type, title, visible, editId, template } = props;
  const [hasChange, setHasChange] = useState(false);
  const [enableSecretEdit, setEnableSecretEdit] = useState(false);
  const [data, setData] = useState(null);
  const formRef = useRef<FormInstance>(null);
  const editorRef = useRef(null);
  const isEdit = !!editId;
  const showEditPasswordButton = isEdit && data?.encryption?.enabled;

  const loadDetailDate = async (id: number) => {
    const detail = await getIntegrationDetail(id);
    if (detail) {
      const data = { ...detail };
      const { enabled, secret } = data?.encryption;
      if (enabled) {
        data.encryption.secret = decrypt(secret);
      }
      setData(data);
      setEnableSecretEdit(!enabled);
      formRef.current.setFieldsValue(data);
      editorRef.current?.setValue(data.configuration);
    }
  };

  useEffect(() => {
    if (editId && visible) {
      loadDetailDate(editId);
    }
  }, [editId, visible]);

  const handleClose = () => {
    formRef.current?.resetFields();
    setData(null);
    setEnableSecretEdit(false);
    props.onClose();
  };

  const handleCreate = async (values: Partial<IManagerIntegration>) => {
    const res = await createIntegration(values);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.component.FormModal.CreatedSuccessfully' }), //创建成功
      );
      props.reloadData?.();
      handleClose();
    } else {
      message.error(
        formatMessage({ id: 'odc.component.FormModal.FailedToCreate' }), //创建失败
      );
    }
  };

  const handleEdit = async (values: Partial<IManagerIntegration>) => {
    const res = await updateIntegration({
      ...values,
      id: editId,
    });

    if (res) {
      message.success(
        formatMessage({ id: 'odc.component.FormModal.SavedSuccessfully' }), //保存成功
      );
      props.reloadData?.();
      handleClose();
    } else {
      message.error(
        formatMessage({ id: 'odc.component.FormModal.SaveFailed' }), //保存失败
      );
    }
  };

  const handleSubmit = () => {
    formRef.current
      .validateFields()
      .then((values) => {
        const { secret } = values?.encryption;
        const formData = {
          type,
          ...values,
          name: values.name?.trim(),
        };
        if (secret) {
          formData.encryption.secret = encrypt(secret);
        }
        switch (type) {
          case IntegrationType.APPROVAL: {
            tracert.click('a3112.b64009.c330925.d367481');
            break;
          }
          case IntegrationType.SQL_INTERCEPTOR: {
            tracert.click('a3112.b64009.c330926.d367483');
            break;
          }
        }
        if (editId) {
          handleEdit(formData);
        } else {
          handleCreate(formData);
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handleCancel = () => {
    if (hasChange) {
      Modal.confirm({
        title: isEdit
          ? formatMessage({ id: 'odc.component.FormModal.AreYouSureYouWant' }) //确定要取消编辑吗？取消保存后，所编辑的内容将不生效
          : formatMessage({ id: 'odc.component.FormModal.AreYouSureYouWant.1' }), //确定要取消新建吗?
        cancelText: formatMessage({ id: 'odc.component.FormModal.Cancel' }), //取消
        okText: formatMessage({ id: 'odc.component.FormModal.Ok' }), //确定
        centered: true,
        onOk: () => {
          setHasChange(false);
          handleClose();
        },
      });
    } else {
      handleClose();
    }
  };

  const handleEditStatus = () => {
    setHasChange(true);
  };

  const handleStatusChange = (e: RadioChangeEvent) => {
    if (!e.target.value && isEdit) {
      props.handleStatusChange(e.target.value, null);
    }
  };

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (isEdit && data?.name === name)) {
      return;
    }
    const isRepeat = await checkIntegrationExists(type, name);
    if (isRepeat) {
      throw new Error();
    }
  };

  const handleChange = (value: string) => {
    formRef.current?.setFieldsValue({
      configuration: value,
    });
  };

  const handleCancelSecretEdit = () => {
    setEnableSecretEdit(!enableSecretEdit);
  };

  return (
    <>
      <Drawer
        width={564}
        title={
          (isEdit
            ? formatMessage({ id: 'odc.component.FormModal.Edit' }) //编辑
            : formatMessage({ id: 'odc.component.FormModal.Create' })) + //新建
          `${title}`
        }
        className={styles.interceptor}
        footer={
          <Space>
            <Button onClick={handleCancel}>
              {formatMessage({ id: 'odc.component.FormModal.Cancel' }) /*取消*/}
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {
                isEdit
                  ? formatMessage({ id: 'odc.component.FormModal.Save' }) //保存
                  : formatMessage({ id: 'odc.component.FormModal.Create' }) //新建
              }
            </Button>
          </Space>
        }
        destroyOnClose
        visible={visible}
        onClose={handleCancel}
      >
        <Form
          ref={formRef}
          layout="vertical"
          requiredMark="optional"
          initialValues={
            data || {
              enabled: true,
              configuration: template,
              encryption: {
                enabled: true,
                algorithm: EncryptionAlgorithm.AES256_BASE64,
              },
            }
          }
          onFieldsChange={handleEditStatus}
        >
          <Form.Item
            label={
              formatMessage(
                {
                  id: 'odc.component.FormModal.TitleName',
                },
                { title: title },
              ) //`${title}名称`
            }
            name="name"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: formatMessage(
                  {
                    id: 'odc.component.FormModal.EnterATitleName',
                  },
                  { title: title },
                ), //`请输入 ${title}名称`
              },
              {
                max: 64,
                message: formatMessage({
                  id: 'odc.component.FormModal.TheNameCannotExceedCharacters',
                }), //名称不超过 64个字符
              },
              {
                validator: validTrimEmptyWithWarn(
                  formatMessage({ id: 'odc.component.FormModal.TheNameContainsSpacesAt' }), //名称首尾包含空格
                ),
              },
              {
                message: formatMessage({ id: 'odc.component.FormModal.TheNameAlreadyExists' }), //名称已存在
                validator: checkNameRepeat,
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'odc.component.FormModal.EnterAName',
              })} /*请输入名称*/
            />
          </Form.Item>
          <Form.Item
            label={
              formatMessage(
                {
                  id: 'odc.component.FormModal.TitleStatus',
                },
                { title: title },
              ) //`${title}状态`
            }
            name="enabled"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'odc.component.FormModal.SelectAStatus' }), //请选择状态
              },
            ]}
          >
            <Radio.Group onChange={handleStatusChange}>
              <Radio value={true}>
                {formatMessage({ id: 'odc.component.FormModal.Enable' }) /*启用*/}
              </Radio>
              <Radio value={false}>
                {formatMessage({ id: 'odc.component.FormModal.Disable' }) /*停用*/}
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            className={styles.editor}
            label={
              formatMessage(
                {
                  id: 'odc.component.FormModal.TitleConfiguration',
                },
                { title: title },
              ) //`${title}配置`
            }
            name="configuration"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.FormModal.PleaseEnterTheConfiguration',
                }), //请输入配置
              },
            ]}
          >
            <YamlEditor defaultValue={template} ref={editorRef} onValueChange={handleChange} />
          </Form.Item>
          <Form.Item
            valuePropName="checked"
            name={['encryption', 'enabled']}
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'odc.component.FormModal.SelectAStatus' }), //请选择状态
              },
            ]}
          >
            <Checkbox>
              {
                formatMessage({
                  id: 'odc.component.FormModal.WhetherToEnableEncryption',
                }) /*是否启用加密*/
              }
            </Checkbox>
          </Form.Item>
          <Form.Item shouldUpdate={true} noStyle>
            {({ getFieldValue }) => {
              const { enabled } = getFieldValue('encryption');
              if (!enabled) {
                return null;
              }
              return (
                <Space className={styles.block} direction="vertical">
                  <Space size={20}>
                    <Form.Item
                      label={formatMessage({
                        id: 'odc.component.FormModal.EncryptionAlgorithm',
                      })} /*加密算法*/
                      name={['encryption', 'algorithm']}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({ id: 'odc.component.FormModal.SelectAStatus' }), //请选择状态
                        },
                      ]}
                    >
                      <Select
                        style={{ width: '232px' }}
                        options={[
                          {
                            value: EncryptionAlgorithm.AES256_BASE64,
                            label: EncryptionAlgorithm.AES256_BASE64,
                          },
                          {
                            value: EncryptionAlgorithm.AES192_BASE64_4A,
                            label: EncryptionAlgorithm.AES192_BASE64_4A,
                          },
                        ]}
                      />
                    </Form.Item>
                    {!isEdit || enableSecretEdit ? (
                      <Form.Item
                        label={formatMessage({
                          id: 'odc.component.FormModal.EncryptionKey',
                        })} /*加密密钥*/
                        name={['encryption', 'secret']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage({ id: 'odc.component.FormModal.EnterAKey' }), //请输入密钥
                          },
                        ]}
                      >
                        <Input.Password
                          placeholder={formatMessage({ id: 'odc.component.FormModal.PleaseEnter' })}
                          /*请输入*/ style={{ width: '232px' }}
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        label={formatMessage({ id: 'odc.component.FormModal.EncryptionKey' })}
                        /*加密密钥*/ required
                      >
                        <Input.Password style={{ width: '232px' }} value="******" disabled={true} />
                      </Form.Item>
                    )}
                  </Space>
                  {showEditPasswordButton && (
                    <Button type="link" onClick={handleCancelSecretEdit}>
                      {
                        enableSecretEdit
                          ? formatMessage({ id: 'odc.component.FormModal.CancelModification' }) //取消修改
                          : formatMessage({ id: 'odc.component.FormModal.ChangePassword' }) //修改密码
                      }
                    </Button>
                  )}
                </Space>
              );
            }}
          </Form.Item>
          <Form.Item
            label={formatMessage({ id: 'odc.component.FormModal.Remarks' })} /*备注*/
            name="description"
            rules={[
              {
                max: 140,
                message: formatMessage({
                  id: 'odc.component.FormModal.TheDescriptionCannotExceedCharacters',
                }), //备注不超过 140 个字符
              },
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
export default FormSqlInterceptorModal;
