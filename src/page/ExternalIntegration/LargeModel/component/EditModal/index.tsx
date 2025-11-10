import { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import { useRequest } from 'ahooks';
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Spin,
  message,
} from 'antd';
import Icon, { ExportOutlined } from '@ant-design/icons';

import { formatMessage, getServerLocalKey } from '@/util/intl';
import { encrypt } from '@/util/utils';

import { createProviderModel, getModelDetail } from '@/common/network/largeModel';

import type { EditModalRef, EditModalProps, IModelProvider, IModel } from '@/d.ts/llm';
import { EVendorType, ESchemaFieldType } from '@/d.ts/llm';

import { VendorsConfig } from '@/constant/llm';
import { renderFormComponent } from '../../utils';

import styles from './index.less';

const EditModal = forwardRef<EditModalRef, EditModalProps>(({ onRefresh }, ref) => {
  const [form] = Form.useForm();

  // 内部状态管理
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState<IModelProvider | undefined>();
  const [model, setModel] = useState<IModel | undefined>();
  const [formValues, setFormValues] = useState({});
  const [initialCredentials, setInitialCredentials] = useState<Record<string, any>>({});

  // 暴露给外部的方法
  useImperativeHandle(ref, () => ({
    open: (data) => {
      setProvider(data?.provider);
      setModel(data?.model);
      setIsOpen(true);
    },
  }));

  // 获取模型详情
  const { run: fetchModelDetail, loading: fetchingDetail } = useRequest(
    ({ provider, modelName }: { provider: string; modelName: string }) =>
      getModelDetail(provider, modelName),
    {
      manual: true,
      onSuccess: (data) => {
        // 设置表单初始值
        const initialValues = {
          ...data.credential,
          model: data?.model,
          modelType: data?.type, // 使用 modelType 字段名与表单字段一致
          description: data?.description,
        };

        form.setFieldsValue(initialValues);
        setFormValues(initialValues);
        // 保存初始凭证用于后续比较
        setInitialCredentials(data.credential || {});
      },
      onError: (error) => {
        message.error(
          formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.63B49A33',
            defaultMessage: '获取模型详情失败',
          }),
        );
        console.error('获取模型详情失败:', error);
      },
    },
  );

  // 创建新模型
  const { run: createModel, loading: createLoading } = useRequest(
    ({ provider, modelData }: { provider: string; modelData: any }) =>
      createProviderModel(provider, modelData),
    {
      manual: true,
      onSuccess: () => {
        message.success(
          model
            ? formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.E75D99B3',
                defaultMessage: '模型更新成功',
              })
            : formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.D46EA6D9',
                defaultMessage: '模型创建成功',
              }),
        );
        resetStates();
        // 调用外部传入的刷新回调
        if (onRefresh) {
          onRefresh();
        }
      },
      onError: (error) => {
        message.error(
          model
            ? formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.181935E6',
                defaultMessage: '模型更新失败',
              })
            : formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.EC55EDAE',
                defaultMessage: '模型创建失败',
              }),
        );
        console.error('模型操作失败:', error);
      },
    },
  );

  const handleConfirm = useCallback(async () => {
    if (!provider) {
      message.error(
        formatMessage({
          id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.AACEB697',
          defaultMessage: '未选择供应商',
        }),
      );
      return;
    }

    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      // 从 schema 中提取固定字段
      const modelName = values.model || values.modelName;
      const modelType = values.modelType || 'CHAT';

      // 构建 credentials 对象，使用 schema 的 variable 作为 key
      const credential: Record<string, any> = {};
      const modelCredentialSchemas = provider.modelCredentialSchema?.credentialFormSchemas || [];

      modelCredentialSchemas.forEach((schema) => {
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

      // 构建模型数据
      const modelData = {
        model: modelName,
        type: modelType,
        credential,
        provider: provider.provider,
        description: values.description || '',
      };

      await createModel({
        provider: provider.provider,
        modelData,
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  }, [form, provider, model, initialCredentials, createModel]);

  const resetStates = useCallback(() => {
    setIsOpen(false);
    setProvider(undefined);
    setModel(undefined);
    form.resetFields();
    setFormValues({});
    setInitialCredentials({});
  }, [form]);

  // 当模态框打开时，处理初始化逻辑
  useEffect(() => {
    if (isOpen && model && provider) {
      // 编辑模式：获取模型详情
      fetchModelDetail({
        provider: provider.provider,
        modelName: model.modelName,
      });
    } else if (isOpen) {
      // 新建模型时的默认值
      const initialValues = {
        modelType: 'CHAT',
      };
      form.setFieldsValue(initialValues);
      setFormValues(initialValues);
      setInitialCredentials({});
    }
  }, [isOpen, model, provider, fetchModelDetail, form]);

  const currentVendorType = (provider?.provider as EVendorType) || EVendorType.DEEPSEEK;
  const currentVendorConfig = VendorsConfig[currentVendorType];

  // 判断字段是否应该显示
  const shouldShowField = (schema: any) => {
    if (!schema.showOn || !Array.isArray(schema.showOn)) {
      return true; // 如果没有 showOn 配置，默认显示
    }

    // 检查所有 showOn 条件是否满足
    return schema.showOn.every((condition: any) => {
      const { variable, value } = condition;
      // 特殊处理 __model_type 字段，映射到 modelType
      let actualValue = formValues[variable];
      if (variable === '__model_type' && actualValue === undefined) {
        actualValue = formValues['modelType'];
      }

      // 处理大小写不匹配的情况
      if (typeof actualValue === 'string' && typeof value === 'string') {
        return actualValue.toLowerCase() === value.toLowerCase();
      }

      return actualValue === value;
    });
  };

  return (
    <Modal
      open={isOpen}
      title={
        model
          ? formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.A14C59F5',
              defaultMessage: '编辑模型',
            })
          : formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.53DF1720',
              defaultMessage: '添加模型',
            })
      }
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
            <Button
              onClick={resetStates}
              disabled={createLoading || fetchingDetail}
              style={{ marginRight: 8 }}
            >
              {formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.267BB6D4',
                defaultMessage: '取消',
              })}
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              loading={createLoading}
              disabled={fetchingDetail}
            >
              {formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.5536B99E',
                defaultMessage: '确定',
              })}
            </Button>
          </div>
        </div>
      )}
    >
      <Spin
        spinning={fetchingDetail}
        tip={formatMessage({
          id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.B5E8D3DB',
          defaultMessage: '正在加载模型详情...',
        })}
      >
        <Descriptions
          layout="horizontal"
          items={[
            {
              label: formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.E46B8C88',
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

        <Form
          layout="vertical"
          className={styles.form}
          form={form}
          requiredMark="optional"
          onValuesChange={(changedValues, allValues) => {
            setFormValues(allValues);
          }}
        >
          {/* 固定字段：模型类型 */}
          <Form.Item
            label={formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.60E40AD9',
              defaultMessage: '模型类型',
            })}
            name="modelType"
            initialValue="CHAT"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.49BB2DC9',
                  defaultMessage: '请选择模型类型',
                }),
              },
            ]}
            className={styles.formItem}
          >
            <Radio.Group disabled={!!model}>
              <Radio value="CHAT">CHAT</Radio>
              <Radio value="EMBEDDING">EMBEDDING</Radio>
            </Radio.Group>
          </Form.Item>

          {/* 固定字段：模型名称（使用 schema 中的 model 字段或 modelName）*/}
          {provider?.modelCredentialSchema?.model && (
            <Form.Item
              label={
                provider.modelCredentialSchema.model.label?.[getServerLocalKey()] ||
                formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.F26B463F',
                  defaultMessage: '模型名称',
                })
              }
              name="model"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.466E1A22',
                    defaultMessage: '请输入模型名称',
                  }),
                },
              ]}
              className={styles.formItem}
            >
              <Input
                disabled={!!model}
                placeholder={
                  provider.modelCredentialSchema.model.placeholder?.[getServerLocalKey()] ||
                  formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.A965B08D',
                    defaultMessage: '请输入模型名称',
                  })
                }
              />
            </Form.Item>
          )}

          {/* 动态字段：根据 schema 生成 */}
          {provider?.modelCredentialSchema?.credentialFormSchemas
            ?.filter((schema) => shouldShowField(schema))
            .map((schema) => (
              <Form.Item
                key={schema.variable}
                label={schema.label?.[getServerLocalKey()] || schema.variable}
                name={schema.variable}
                initialValue={schema.defaultValue || undefined}
                rules={
                  schema.required
                    ? [
                        {
                          required: true,
                          message: formatMessage(
                            {
                              id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.628F7FA0',
                              defaultMessage: '请输入{LogicalExpression0}',
                            },
                            {
                              LogicalExpression0:
                                schema.label?.[getServerLocalKey()] || schema.variable,
                            },
                          ),
                        },
                      ]
                    : []
                }
                className={styles.formItem}
              >
                {renderFormComponent(schema)}
              </Form.Item>
            ))}

          <Form.Item
            label={formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.C440A8E5',
              defaultMessage: '备注',
            })}
            name="description"
            className={styles.formItem}
          >
            <Input.TextArea
              placeholder={formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.component.EditModal.F37D1D7B',
                defaultMessage: '请输入备注信息',
              })}
              rows={3}
              maxLength={400}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
});

export default EditModal;
