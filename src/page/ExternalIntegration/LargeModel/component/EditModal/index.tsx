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
import { VendorsConfig } from '../../constant';
import { EVendorType, ESchemaFieldType } from '@/d.ts/llm';
import Icon, { ExportOutlined } from '@ant-design/icons';
import styles from './index.less';
import { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createProviderModel, getModelDetail } from '@/util/request/largeModel';
import { useRequest } from 'ahooks';
import { encrypt } from '@/util/utils';
import { getServerLocalKey } from '@/util/intl';
import { renderFormComponent } from '../../utils';
import type { EditModalRef, EditModalProps, IModelProvider, IModelInfo } from '@/d.ts/llm';

const EditModal = forwardRef<EditModalRef, EditModalProps>(({ onRefresh }, ref) => {
  const [form] = Form.useForm();

  // 内部状态管理
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState<IModelProvider | undefined>();
  const [model, setModel] = useState<IModelInfo | undefined>();
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
          type: data?.type,
          description: data?.description,
        };

        form.setFieldsValue(initialValues);
        setFormValues(initialValues);
        // 保存初始凭证用于后续比较
        setInitialCredentials(data.credential || {});
      },
      onError: (error) => {
        message.error('获取模型详情失败');
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
        message.success(model ? '模型更新成功' : '模型创建成功');
        resetStates();
        // 调用外部传入的刷新回调
        if (onRefresh) {
          onRefresh();
        }
      },
      onError: (error) => {
        message.error(model ? '模型更新失败' : '模型创建失败');
        console.error('模型操作失败:', error);
      },
    },
  );

  const handleConfirm = useCallback(async () => {
    if (!provider) {
      message.error('未选择供应商');
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
      title={model ? '编辑模型' : '添加模型'}
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
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              loading={createLoading}
              disabled={fetchingDetail}
            >
              确定
            </Button>
          </div>
        </div>
      )}
    >
      <Spin spinning={fetchingDetail} tip="正在加载模型详情...">
        <Descriptions
          layout="horizontal"
          items={[
            {
              label: '模型供应商',
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
            label="模型类型"
            name="modelType"
            initialValue="CHAT"
            rules={[{ required: true, message: '请选择模型类型' }]}
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
                provider.modelCredentialSchema.model.label?.[getServerLocalKey()] || '模型名称'
              }
              name="model"
              rules={[{ required: true, message: '请输入模型名称' }]}
              className={styles.formItem}
            >
              <Input
                disabled={!!model}
                placeholder={
                  provider.modelCredentialSchema.model.placeholder?.[getServerLocalKey()] ||
                  '请输入模型名称'
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
                          message: `请输入${
                            schema.label?.[getServerLocalKey()] || schema.variable
                          }`,
                        },
                      ]
                    : []
                }
                className={styles.formItem}
              >
                {renderFormComponent(schema)}
              </Form.Item>
            ))}

          <Form.Item label="备注" name="description" className={styles.formItem}>
            <Input.TextArea placeholder="请输入备注信息" rows={3} maxLength={400} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
});

export default EditModal;
