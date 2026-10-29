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

import { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import { useRequest } from 'ahooks';
import { Alert, Button, Descriptions, Form, Input, message, Modal, Spin } from 'antd';
import Icon, { ExportOutlined } from '@ant-design/icons';

import { formatMessage, getServerLocalKey } from '@/util/intl';
import { encrypt, decrypt } from '@/util/utils';

import { postAPIKey, getProviderCredential } from '@/common/network/largeModel';

import type { APIKeyConfigModalRef, APIKeyConfigModalProps, IModelProvider } from '@/d.ts/llm';
import { EVendorType, ESchemaFieldType } from '@/d.ts/llm';

import { VendorsConfig } from '@/constant/llm';
import { renderFormComponent } from '../../utils';

import styles from './index.less';

const APIKeyConfigModal = forwardRef<APIKeyConfigModalRef, APIKeyConfigModalProps>(
  ({ onRefresh }, ref) => {
    const [form] = Form.useForm();

    // 内部状态管理
    const [isOpen, setIsOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<IModelProvider | undefined>();
    const [initialCredentials, setInitialCredentials] = useState<Record<string, any>>({});

    // 暴露给外部的方法
    useImperativeHandle(ref, () => ({
      open: (provider) => {
        setCurrentProvider(provider);
        setIsOpen(true);
      },
    }));

    const resetStates = useCallback(() => {
      setIsOpen(false);
      setCurrentProvider(undefined);
      form.resetFields();
      setInitialCredentials({});
    }, [form]);

    // 获取现有的供应商凭证
    const { run: loadProviderCredential, loading: loadingCredential } = useRequest(
      (provider: string) => getProviderCredential(provider),
      {
        manual: true,
        onSuccess: (data) => {
          if (data && data.credential) {
            // 解密凭证数据并回填到表单
            const decryptedCredential: Record<string, any> = {};
            const providerCredentialSchemas =
              currentProvider?.providerCredentialSchema?.credentialFormSchemas || [];

            providerCredentialSchemas.forEach((schema) => {
              const fieldValue = data.credential[schema.variable];
              if (fieldValue !== undefined && fieldValue !== null) {
                // 对于 secret-input 类型的字段，需要解密
                if (schema.type === ESchemaFieldType.SECRET_INPUT) {
                  try {
                    decryptedCredential[schema.variable] = decrypt(fieldValue);
                  } catch (error) {
                    console.error('解密失败:', error);
                    // 如果解密失败，可能是明文数据，直接使用
                    decryptedCredential[schema.variable] = fieldValue;
                  }
                } else {
                  decryptedCredential[schema.variable] = fieldValue;
                }
              }
            });

            form.setFieldsValue(decryptedCredential);
            // 保存初始凭证用于后续比较
            setInitialCredentials(decryptedCredential);
          }
        },
        onError: (error) => {
          console.error('获取凭证失败:', error);
        },
      },
    );

    // 创建/更新模型供应商配置
    const { run: configureProvider, loading: configureLoading } = useRequest(
      ({ provider, credential }: { provider: string; credential: Record<string, any> }) =>
        postAPIKey({ provider, credential }),
      {
        manual: true,
        onSuccess: () => {
          message.success(
            formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.9286C84B',
              defaultMessage: '配置 API Key 成功',
            }),
          );
          resetStates();
          // 刷新供应商和模型列表
          if (onRefresh) {
            onRefresh();
          }
        },
        onError: (error) => {
          message.error(
            formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.1FEA1D0F',
              defaultMessage: '配置 API Key 失败',
            }),
          );
          console.error('配置供应商失败:', error);
        },
      },
    );

    // 当模态框打开时，如果有当前供应商，则设置初始值
    useEffect(() => {
      if (isOpen && currentProvider) {
        // 如果供应商已配置，获取现有配置并回填到表单
        if (currentProvider.credentialConfigured) {
          loadProviderCredential(currentProvider.provider);
        } else {
          // 如果没有配置，清空表单
          form.resetFields();
          setInitialCredentials({});
        }
      }
    }, [isOpen, currentProvider, form, loadProviderCredential]);

    const handleConfirm = useCallback(async () => {
      if (!currentProvider) {
        message.error(
          formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.CE259A54',
            defaultMessage: '未选择供应商',
          }),
        );
        return;
      }

      try {
        await form.validateFields();
        const values = form.getFieldsValue();

        // 构建 credentials 对象，使用 schema 的 variable 作为 key
        const credential: Record<string, any> = {};
        const providerCredentialSchemas =
          currentProvider?.providerCredentialSchema?.credentialFormSchemas || [];

        providerCredentialSchemas.forEach((schema) => {
          const fieldValue = values[schema.variable];
          const initialValue = initialCredentials[schema.variable];
          const isApiKeyField = schema.variable.toLowerCase().includes('api_key');

          if (fieldValue !== undefined && fieldValue !== '') {
            // 如果是包含"api_key"的字段且值没有改变，传递null
            if (isApiKeyField && fieldValue === initialValue) {
              credential[schema.variable] = null;
            } else {
              // 对于 secret-input 类型的字段，使用 encrypt 加密
              if (schema.type === ESchemaFieldType.SECRET_INPUT) {
                credential[schema.variable] = encrypt(fieldValue);
              } else {
                credential[schema.variable] = fieldValue;
              }
            }
          } else if (isApiKeyField) {
            // 如果是api_key字段且为空，也传递null
            credential[schema.variable] = null;
          }
        });

        await configureProvider({
          provider: currentProvider.provider,
          credential,
        });
      } catch (error) {
        console.error('表单验证失败:', error);
      }
    }, [currentProvider, form, initialCredentials, configureProvider]);

    const currentVendorType = (currentProvider?.provider as EVendorType) || EVendorType.DEEPSEEK;
    const currentVendorConfig = VendorsConfig[currentVendorType];

    // 格式化字段标签
    const formatLabel = (schema: any) => {
      const label = schema.label?.[getServerLocalKey()];
      if (label) {
        return label;
      }
      // 如果没有配置 label，使用 variable，并对 api_key 做特殊处理
      if (schema.variable === 'api_key') {
        return 'API key';
      }
      return schema.variable;
    };

    return (
      <Modal
        destroyOnHidden
        footer={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Help链接 */}
            {currentProvider?.help ? (
              <a
                href={currentProvider.help.url?.[getServerLocalKey()]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1890ff', textDecoration: 'none' }}
              >
                {currentProvider.help.title?.[getServerLocalKey()]}
                <ExportOutlined style={{ marginLeft: 4 }} />
              </a>
            ) : (
              <div></div>
            )}

            {/* 按钮区域 */}
            <div>
              <Button
                onClick={resetStates}
                disabled={configureLoading || loadingCredential}
                style={{ marginRight: 8 }}
              >
                {formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.B07F7290',
                  defaultMessage: '取消',
                })}
              </Button>
              <Button
                type="primary"
                onClick={handleConfirm}
                loading={configureLoading}
                disabled={loadingCredential}
              >
                {formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.BD4B6216',
                  defaultMessage: '确定',
                })}
              </Button>
            </div>
          </div>
        )}
        open={isOpen}
        title={formatMessage({
          id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.5F3594BA',
          defaultMessage: '配置 API Key',
        })}
        onCancel={resetStates}
      >
        <Spin
          spinning={loadingCredential}
          tip={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.37966192',
            defaultMessage: '正在加载现有配置...',
          })}
        >
          <Descriptions
            layout="horizontal"
            items={[
              {
                label: formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.23E244F0',
                  defaultMessage: '模型供应商',
                }),
                span: 4,
                children: (
                  <div className={styles.vendor}>
                    <Icon style={{ fontSize: 16 }} component={currentVendorConfig?.icon} />
                    {currentVendorConfig?.label || currentProvider?.provider}
                  </div>
                ),
              },
            ]}
          />

          <Form layout="vertical" form={form} className={styles.form} requiredMark="optional">
            {currentProvider?.providerCredentialSchema?.credentialFormSchemas?.map((schema) => (
              <Form.Item
                key={schema.variable}
                label={formatLabel(schema)}
                className={styles.formItem}
                name={schema.variable}
                initialValue={schema.defaultValue || undefined}
                rules={
                  schema.required
                    ? [
                        {
                          required: true,
                          message: formatMessage(
                            {
                              id: 'src.page.ExternalIntegration.LargeModel.component.APIKeyConfigModal.53FF5C31',
                              defaultMessage: '{CallExpression0} 不可为空',
                            },
                            { CallExpression0: formatLabel(schema) },
                          ),
                        },
                      ]
                    : []
                }
              >
                {renderFormComponent(schema)}
              </Form.Item>
            ))}
          </Form>
        </Spin>
      </Modal>
    );
  },
);

APIKeyConfigModal.displayName = 'APIKeyConfigModal';

export default APIKeyConfigModal;
