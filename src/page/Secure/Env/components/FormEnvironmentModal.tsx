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

import { formatMessage } from '@/util/intl';
import { updateEnvironment, createEnvironment, getEnvironmentExists } from '@/common/network/env';
import { EnvColorMap } from '@/constant';
import { IEnvironment } from '@/d.ts/environment';
import { message, Modal, Button, Form, Input, Tag, Select, SelectProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useState, useEffect } from 'react';
import styles from './index.less';
import { CheckOutlined } from '@ant-design/icons';
import HelpDoc from '@/component/helpDoc';

export const FormEnvironmentModal: React.FC<{
  isEdit?: boolean;
  currentEnvironment: IEnvironment;
  formEnvironmentModalOpen: boolean;
  options: SelectProps['options'];
  handleCancelFormModal: () => void;
  callback: (environmentId: number) => void;
}> = ({
  isEdit = false,
  currentEnvironment = null,
  formEnvironmentModalOpen,
  options = [],
  handleCancelFormModal,
  callback,
}) => {
  const [formRef] = useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async () => {
    if (isEdit && currentEnvironment?.builtIn) {
      return;
    }
    let result;
    if (isEdit) {
      const formData = await formRef.validateFields(['style', 'description'])?.catch();
      setLoading(true);
      result = await updateEnvironment(currentEnvironment?.id, formData);
      setLoading(false);
    } else {
      const formData = await formRef.validateFields()?.catch();
      formData.enabled = true;
      setLoading(true);
      result = await createEnvironment(formData);
      setLoading(false);
    }
    if (result?.successful) {
      message.success(
        currentEnvironment
          ? formatMessage({ id: 'src.page.Secure.Env.components.6BD18E5A' })
          : formatMessage({ id: 'src.page.Secure.Env.components.CEAD4978' }),
      );
      currentEnvironment && (await callback?.(result?.data?.id));
      return;
    }
    message.error(
      currentEnvironment
        ? formatMessage({ id: 'src.page.Secure.Env.components.D02D681D' })
        : formatMessage({ id: 'src.page.Secure.Env.components.053B9E17' }),
    );
  };

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name) {
      return;
    }
    const result = await getEnvironmentExists(name);
    if (result?.exists) {
      throw new Error(result?.errorMessage);
    }
  };
  useEffect(() => {
    if (formEnvironmentModalOpen) {
      if (isEdit) {
        formRef.setFieldsValue({
          name: currentEnvironment?.name,
          style: currentEnvironment?.style,
          description: currentEnvironment?.description,
        });
      } else {
        formRef.setFieldsValue({
          style: items?.[0],
          copiedRulesetId: options?.[0]?.value,
        });
      }
    } else {
      formRef.resetFields();
    }
  }, [formEnvironmentModalOpen]);
  return (
    <Modal
      destroyOnClose
      title={
        isEdit
          ? formatMessage({ id: 'src.page.Secure.Env.components.ABDA4206' })
          : formatMessage({ id: 'src.page.Secure.Env.components.C9BFC3C7' })
      }
      width={580}
      open={formEnvironmentModalOpen}
      onCancel={handleCancelFormModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancelFormModal}>
            {formatMessage({ id: 'src.page.Secure.Env.components.EECB6084' /*取消*/ }) /* 取消 */}
          </Button>
          <Button type="primary" loading={loading} disabled={loading} onClick={handleSubmit}>
            {isEdit
              ? formatMessage({ id: 'src.page.Secure.Env.components.7496F3B7' })
              : formatMessage({ id: 'src.page.Secure.Env.components.B742B1F8' })}
          </Button>
        </div>
      }
    >
      <Form form={formRef} layout="vertical" requiredMark="optional">
        <Form.Item
          label={formatMessage({ id: 'src.page.Secure.Env.components.E2B289C4' }) /*"环境名称"*/}
          required
        >
          <Form.Item
            name="name"
            noStyle
            validateTrigger="onBlur"
            validateFirst={true}
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'src.page.Secure.Env.components.E20FE25C' }), //'请输入环境名称'
              },
              {
                max: 8,
                message: formatMessage({ id: 'src.page.Secure.Env.components.1C970EDD' }), //'已超过 8 个字符'
              },
              {
                message: formatMessage({ id: 'src.page.Secure.Env.components.3C766EC6' }), //'名称首位存在空格'
                validator: async (ruler, value) => {
                  if (value?.startsWith(' ')) {
                    throw new Error();
                  }
                },
              },
              {
                validator: checkNameRepeat,
              },
            ]}
          >
            <Input
              disabled={isEdit}
              style={{ width: '240px' }}
              placeholder={formatMessage({ id: 'src.page.Secure.Env.components.228DEEEE' })}
            />
          </Form.Item>
          <div className={styles.envNameTip}>
            {
              formatMessage({
                id: 'src.page.Secure.Env.components.D11CF27F' /*新建之后无法修改*/,
              }) /* 新建之后无法修改 */
            }
          </div>
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'src.page.Secure.Env.components.4AE714EA' }) /*"标签样式"*/}
          name="style"
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'src.page.Secure.Env.components.B98439D0' }), //'请选择标签样式'
            },
          ]}
        >
          <TagSelector />
        </Form.Item>
        {isEdit ? null : (
          <Form.Item
            shouldUpdate
            label={
              <HelpDoc leftText isTip doc="copiedRulesetId">
                {
                  formatMessage({
                    id: 'src.page.Secure.Env.components.977B9386' /*引用环境*/,
                  }) /* 引用环境 */
                }
              </HelpDoc>
            }
            name="copiedRulesetId"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'src.page.Secure.Env.components.351C7EB6' }), //'请选择引用环境'
              },
            ]}
          >
            <Select style={{ width: '240px' }} options={options} />
          </Form.Item>
        )}

        <Form.Item
          label={formatMessage({ id: 'src.page.Secure.Env.components.B264828F' }) /*"描述"*/}
          name="description"
          rules={[
            {
              max: 200,
              message: formatMessage({ id: 'src.page.Secure.Env.components.63B256F5' }), //'最大长度为200'
            },
          ]}
        >
          <Input.TextArea
            placeholder={
              formatMessage({ id: 'src.page.Secure.Env.components.279CC9E7' }) /*"请输入描述"*/
            }
            maxLength={200}
            rows={5}
            style={{
              resize: 'none',
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const items = Object.keys(EnvColorMap);
const TagSelector: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  const [tag, setTag] = useState<string>(value || items?.[0]);
  const handleTagSelect = (selectedTag: string) => {
    setTag(selectedTag);
    onChange(selectedTag);
  };
  useEffect(() => {
    if (value) {
      setTag(value);
    }
  }, [value]);
  return (
    <div className={styles.tagSelector}>
      {items?.map((item) => {
        return (
          <Tag
            key={item}
            data-color={item}
            onClick={() => handleTagSelect(item?.toUpperCase())}
            style={{
              background: EnvColorMap[item?.toUpperCase()]?.background,
              color: EnvColorMap[item?.toUpperCase()]?.textColor,
              borderColor: EnvColorMap[item?.toUpperCase()]?.borderColor,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            color={item?.toLocaleLowerCase()}
          >
            {item === tag && <CheckOutlined style={{ color: 'var(--text-color-secondary)' }} />}
          </Tag>
        );
      })}
    </div>
  );
};
