import {
  checkIntegrationExists,
  createIntegration,
  getIntegrationDetail,
  updateIntegration,
} from '@/common/network/manager';
import YamlEditor from '@/component/YamlEditor';
import type { IManagerIntegration, IntegrationType } from '@/d.ts';
import { EncryptionAlgorithm } from '@/d.ts';
import { decrypt, encrypt } from '@/util/utils';
import { validTrimEmptyWithWarn } from '@/util/valid';
import {
  Button,
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

interface IProps {
  type: IntegrationType;
  title: string;
  visible: boolean;
  editId?: number;
  onClose: () => void;
  handleStatusChange?: (status: boolean, data: IManagerIntegration, callback: () => void) => void;
  reloadData?: () => void;
}

const FormSqlInterceptorModal: React.FC<IProps> = (props) => {
  const { type, title, visible, editId } = props;
  const [hasChange, setHasChange] = useState(false);
  const [data, setData] = useState(null);
  const formRef = useRef<FormInstance>(null);
  const editorRef = useRef(null);
  const isEdit = !!editId;

  const loadDetailDate = async (id: number) => {
    const detail = await getIntegrationDetail(id);
    if (detail) {
      const data = { ...detail };
      const { enabled, secret } = data?.encryption;
      if (enabled) {
        data.encryption.secret = decrypt(secret);
      }
      setData(data);
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
    props.onClose();
  };

  const handleCreate = async (values: Partial<IManagerIntegration>) => {
    const res = await createIntegration(values);
    if (res) {
      message.success('创建成功');
      props.reloadData?.();
      handleClose();
    } else {
      message.error('创建失败');
    }
  };

  const handleEdit = async (values: Partial<IManagerIntegration>) => {
    const res = await updateIntegration({
      ...values,
      id: editId,
    });

    if (res) {
      message.success('保存成功');
      props.reloadData?.();
      handleClose();
    } else {
      message.error('保存失败');
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
        title: isEdit ? '确定要取消编辑吗？取消保存后，所编辑的内容将不生效' : '确定要取消新建吗?',
        cancelText: '取消',
        okText: '确定',
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
      props.handleStatusChange(e.target.value, null, () => {
        formRef.current.setFieldsValue({
          status: true,
        });
      });
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

  return (
    <>
      <Drawer
        width={720}
        title={`${isEdit ? '编辑' : '新建'}${title}`}
        className={styles.interceptor}
        footer={
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              {isEdit ? '保存' : '新建'}
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
              encryption: {
                enabled: false,
              },
            }
          }
          onFieldsChange={handleEditStatus}
        >
          <Form.Item
            label={`${title}名称`}
            name="name"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: `请输入 ${title}名称`,
              },
              {
                max: 64,
                message: '名称不超过 64个字符',
              },
              {
                validator: validTrimEmptyWithWarn('名称首尾包含空格'),
              },
              {
                message: '名称已存在',
                validator: checkNameRepeat,
              },
            ]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item
            className={styles.editor}
            label={`${title}配置`}
            name="configuration"
            rules={[
              {
                required: true,
                message: '请输入配置',
              },
            ]}
          >
            <YamlEditor ref={editorRef} onValueChange={handleChange} />
          </Form.Item>
          <Form.Item
            label={`${title}状态`}
            name="enabled"
            rules={[
              {
                required: true,
                message: '请选择状态',
              },
            ]}
          >
            <Radio.Group onChange={handleStatusChange}>
              <Radio value={true}>启用</Radio>
              <Radio value={false}>停用</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="是否启用加密"
            name={['encryption', 'enabled']}
            rules={[
              {
                required: true,
                message: '请选择状态',
              },
            ]}
          >
            <Radio.Group>
              <Radio value={true}>启用</Radio>
              <Radio value={false}>停用</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item shouldUpdate={true}>
            {({ getFieldValue }) => {
              const { enabled } = getFieldValue('encryption');
              if (!enabled) {
                return null;
              }
              return (
                <Space size={20}>
                  <Form.Item
                    label="加密算法"
                    name={['encryption', 'algorithm']}
                    rules={[
                      {
                        required: true,
                        message: '请选择状态',
                      },
                    ]}
                  >
                    <Select
                      style={{ width: '160px' }}
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
                  <Form.Item
                    label="加密密钥"
                    name={['encryption', 'secret']}
                    rules={[
                      {
                        required: true,
                        message: '请输入密钥',
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Space>
              );
            }}
          </Form.Item>

          <Form.Item
            label="备注"
            name="description"
            rules={[
              {
                max: 140,
                message: '备注不超过 140 个字符',
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
