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

import { useCallback, useEffect, forwardRef, useImperativeHandle, useState } from 'react';

import { useRequest } from 'ahooks';
import { Button, Descriptions, Form, Input, message, Modal, Spin } from 'antd';
import Icon, { ExportOutlined } from '@ant-design/icons';

import { formatMessage, getServerLocalKey } from '@/util/intl';

import { updateProviderDescription } from '@/common/network/largeModel';

import type { DescriptionModelRef, DescriptionModelProps, IModelProvider } from '@/d.ts/llm';
import { EVendorType } from '@/d.ts/llm';

import { VendorsConfig } from '@/constant/llm';

import styles from './index.less';

const DescriptionModel = forwardRef<DescriptionModelRef, DescriptionModelProps>(
  ({ onRefresh }, ref) => {
    const [form] = Form.useForm();

    // 内部状态管理
    const [isOpen, setIsOpen] = useState(false);
    const [provider, setProvider] = useState<IModelProvider | undefined>();

    // 暴露给外部的方法
    useImperativeHandle(ref, () => ({
      open: (provider) => {
        setProvider(provider);
        setIsOpen(true);
      },
    }));

    // 更新供应商描述
    const { run: updateDescription, loading: updateLoading } = useRequest(
      ({ provider, description }: { provider: string; description: string }) =>
        updateProviderDescription(provider, { description }),
      {
        manual: true,
        onSuccess: () => {
          message.success(
            formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.481D97C5',
              defaultMessage: '备注保存成功',
            }),
          );
          resetStates();
          // 刷新供应商信息
          if (onRefresh) {
            onRefresh();
          }
        },
        onError: (error) => {
          message.error(
            formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.8B739B46',
              defaultMessage: '备注保存失败',
            }),
          );
          console.error('保存备注失败:', error);
        },
      },
    );

    const resetStates = useCallback(() => {
      setIsOpen(false);
      setProvider(undefined);
      form.resetFields();
    }, [form]);

    // 当模态框打开时，回填现有的description值
    useEffect(() => {
      if (isOpen && provider) {
        const currentDescription = provider.description;
        if (currentDescription) {
          form.setFieldsValue({ description: currentDescription });
        } else {
          form.resetFields();
        }
      }
    }, [isOpen, provider, form]);

    const handleConfirm = useCallback(async () => {
      if (!provider) {
        message.error(
          formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.84A25AD1',
            defaultMessage: '未选择供应商',
          }),
        );
        return;
      }

      try {
        await form.validateFields();
        const values = form.getFieldsValue();

        await updateDescription({
          provider: provider.provider,
          description: values.description || '',
        });
      } catch (error) {
        console.error('表单验证失败:', error);
      }
    }, [form, provider, updateDescription]);

    const currentVendorType = (provider?.provider as EVendorType) || EVendorType.DEEPSEEK;
    const currentVendorConfig = VendorsConfig[currentVendorType];

    return (
      <Modal
        destroyOnClose
        open={isOpen}
        title={formatMessage({
          id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.F0A421FA',
          defaultMessage: '添加备注',
        })}
        onCancel={resetStates}
        footer={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Help链接 */}
            {provider?.help ? (
              <a
                href={provider.help.url?.[getServerLocalKey()]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1890ff', textDecoration: 'none' }}
              >
                {provider.help.title?.[getServerLocalKey()]}
                <ExportOutlined style={{ marginLeft: 4 }} />
              </a>
            ) : (
              <div></div>
            )}

            {/* 按钮区域 */}
            <div>
              <Button onClick={resetStates} disabled={updateLoading} style={{ marginRight: 8 }}>
                {formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.282DAA7A',
                  defaultMessage: '取消',
                })}
              </Button>
              <Button type="primary" onClick={handleConfirm} loading={updateLoading}>
                {formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.432E152E',
                  defaultMessage: '确定',
                })}
              </Button>
            </div>
          </div>
        )}
      >
        <Descriptions
          layout="horizontal"
          items={[
            {
              label: formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.E248C42D',
                defaultMessage: '模型供应商',
              }),
              span: 4,
              children: (
                <div className={styles.vendor}>
                  <Icon style={{ fontSize: 16 }} component={currentVendorConfig?.icon} />
                  {currentVendorConfig?.label || provider?.provider}
                </div>
              ),
            },
          ]}
        />

        <Form layout="vertical" form={form} className={styles.form} requiredMark="optional">
          <Form.Item
            label={formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.5C23FD1C',
              defaultMessage: '备注',
            })}
            name="description"
            rules={[
              {
                max: 200,
                message: formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.4BA094AB',
                  defaultMessage: '备注长度不能超过200个字符',
                }),
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder={formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.DescriptionModel.FE659B7A',
                defaultMessage: '请输入供应商备注信息...',
              })}
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  },
);

export default DescriptionModel;
