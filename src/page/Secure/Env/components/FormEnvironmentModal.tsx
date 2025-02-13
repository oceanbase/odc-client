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

import { createEnvironment, getEnvironmentExists, updateEnvironment } from '@/common/network/env';
import HelpDoc from '@/component/helpDoc';
import { EnvColorMap } from '@/constant';
import { IEnvironment } from '@/d.ts/environment';
import { formatMessage } from '@/util/intl';
import { CheckOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, SelectProps, Tag } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import styles from './index.less';

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
          ? formatMessage({
              id: 'src.page.Secure.Env.components.6BD18E5A',
              defaultMessage: '保存成功',
            })
          : formatMessage({
              id: 'src.page.Secure.Env.components.CEAD4978',
              defaultMessage: '新建成功',
            }),
      );
      currentEnvironment && (await callback?.(result?.data?.id));
      return;
    }
    message.error(
      currentEnvironment
        ? formatMessage({
            id: 'src.page.Secure.Env.components.D02D681D',
            defaultMessage: '保存失败',
          })
        : formatMessage({
            id: 'src.page.Secure.Env.components.053B9E17',
            defaultMessage: '新建失败',
          }),
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
          ? formatMessage({
              id: 'src.page.Secure.Env.components.ABDA4206',
              defaultMessage: '编辑环境',
            })
          : formatMessage({
              id: 'src.page.Secure.Env.components.C9BFC3C7',
              defaultMessage: '新建环境',
            })
      }
      width={580}
      open={formEnvironmentModalOpen}
      onCancel={handleCancelFormModal}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancelFormModal}>
            {
              formatMessage({
                id: 'src.page.Secure.Env.components.EECB6084' /*取消*/,
                defaultMessage: '取消',
              }) /* 取消 */
            }
          </Button>
          <Button type="primary" loading={loading} disabled={loading} onClick={handleSubmit}>
            {isEdit
              ? formatMessage({
                  id: 'src.page.Secure.Env.components.7496F3B7',
                  defaultMessage: '保存',
                })
              : formatMessage({
                  id: 'src.page.Secure.Env.components.B742B1F8',
                  defaultMessage: '新建',
                })}
          </Button>
        </div>
      }
    >
      <Form form={formRef} layout="vertical" requiredMark="optional">
        <Form.Item
          label={
            formatMessage({
              id: 'src.page.Secure.Env.components.E2B289C4',
              defaultMessage: '环境名称',
            }) /*"环境名称"*/
          }
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
                message: formatMessage({
                  id: 'src.page.Secure.Env.components.E20FE25C',
                  defaultMessage: '请输入环境名称',
                }), //'请输入环境名称'
              },
              {
                max: 8,
                message: formatMessage({
                  id: 'src.page.Secure.Env.components.1C970EDD',
                  defaultMessage: '已超过 8 个字符',
                }), //'已超过 8 个字符'
              },
              {
                message: formatMessage({
                  id: 'src.page.Secure.Env.components.3C766EC6',
                  defaultMessage: '名称首位存在空格',
                }), //'名称首位存在空格'
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
              placeholder={formatMessage({
                id: 'src.page.Secure.Env.components.228DEEEE',
                defaultMessage: '请输入，8个字符以内',
              })}
            />
          </Form.Item>
          <div className={styles.envNameTip}>
            {
              formatMessage({
                id: 'src.page.Secure.Env.components.D11CF27F' /*新建之后无法修改*/,
                defaultMessage: '新建之后无法修改',
              }) /* 新建之后无法修改 */
            }
          </div>
        </Form.Item>
        <Form.Item
          label={
            formatMessage({
              id: 'src.page.Secure.Env.components.4AE714EA',
              defaultMessage: '标签样式',
            }) /*"标签样式"*/
          }
          name="style"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.page.Secure.Env.components.B98439D0',
                defaultMessage: '请选择标签样式',
              }), //'请选择标签样式'
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
                    defaultMessage: '引用环境',
                  }) /* 引用环境 */
                }
              </HelpDoc>
            }
            name="copiedRulesetId"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.page.Secure.Env.components.351C7EB6',
                  defaultMessage: '请选择引用环境',
                }), //'请选择引用环境'
              },
            ]}
          >
            <Select style={{ width: '240px' }} options={options} />
          </Form.Item>
        )}

        <Form.Item
          label={
            formatMessage({
              id: 'src.page.Secure.Env.components.B264828F',
              defaultMessage: '描述',
            }) /*"描述"*/
          }
          name="description"
          rules={[
            {
              max: 200,
              message: formatMessage({
                id: 'src.page.Secure.Env.components.63B256F5',
                defaultMessage: '描述内容最大长度为200个字符',
              }), //'最大长度为200'
            },
          ]}
        >
          <Input.TextArea
            placeholder={
              formatMessage({
                id: 'src.page.Secure.Env.components.279CC9E7',
                defaultMessage: '请输入描述',
              }) /*"请输入描述"*/
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
