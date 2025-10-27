import { formatMessage } from '@/util/intl';
import React, { useCallback, useState, useEffect, useMemo, useContext } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Button,
  Col,
  Form,
  Popconfirm,
  Popover,
  Row,
  Select,
  Tag,
  Tooltip,
  message,
  Typography,
  Spin,
} from 'antd';
import Icon, {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  InfoCircleFilled,
  QuestionCircleOutlined,
} from '@ant-design/icons';

import LargeModelSelectEmpty from '@/component/Empty/LargeModelSelectEmpty';
import { modelSelectWarningTooltip, UI_SIZES, VendorsConfig } from '../../constant';
import styles from './index.less';
import { EModelSatus, type ModelSelectProps } from '@/d.ts/llm';
import setting from '@/store/setting';

enum EFiledType {
  LLM = 'llm',
  CHAT = 'chat',
  TEXT_EMBEDDING = 'textEmbedding',
  BOTH = 'both',
}

enum ESelectType {
  LLM = 'LLM',
  EMBEDDING = 'EMBEDDING',
  CHAT = 'CHAT',
  NONE = 'NONE',
  ALL = 'ALL',
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  allModels,
  modelsLoading,
  aiConfig,
  updateLoading,
  defaultModelStatuses,
  getModelOptions,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentEditingSelect, setCurrentEditingSelect] = useState(ESelectType.NONE);
  const [llmValue, setLLMValue] = useState(null);
  const [chatValue, setChatValue] = useState(null);
  const [embeddingValue, setEmbeddingValue] = useState(null);
  const [form] = Form.useForm();

  const renderContent = (content: string) => {
    if (!content) return false;
    const [icon, label] = content?.split('/');
    return (
      <span className={styles.defaultModelContent}>
        <Icon
          className={styles.icon}
          style={{ fontSize: UI_SIZES.ICON_SIZE_MEDIUM, marginRight: 4, alignItems: 'center' }}
          component={VendorsConfig[icon].icon}
        />

        {label}
      </span>
    );
  };

  // 渲染模型状态警告
  const renderModelStatusWarning = (status: EModelSatus) => {
    if (status === EModelSatus.SUCCESS) {
      return null;
    }

    return (
      <Tooltip title={modelSelectWarningTooltip[status]}>
        <InfoCircleFilled style={{ color: '#F3B04F', fontSize: 16, marginLeft: 8 }} />
      </Tooltip>
    );
  };

  // 初始化表单值
  useEffect(() => {
    const config = aiConfig;
    if (config) {
      // 根据配置初始化表单和状态
      const defaultChatModel = config.defaultChatModel;
      const defaultLlmModel = config.defaultLlmModel;
      const defaultEmbeddingModel = config.defaultEmbeddingModel;

      form.setFieldsValue({
        llm: defaultLlmModel,
        chat: defaultChatModel,
        textEmbedding: defaultEmbeddingModel,
      });

      if (defaultEmbeddingModel) {
        setCurrentEditingSelect(ESelectType.NONE);
      } else {
        setCurrentEditingSelect(ESelectType.ALL);
      }

      // 更新本地状态
      setLLMValue(defaultLlmModel);
      setChatValue(defaultChatModel);
      setEmbeddingValue(defaultEmbeddingModel);
    }
  }, [aiConfig, form]);

  const isEditing = (type) => {
    return currentEditingSelect === type || currentEditingSelect === ESelectType.ALL;
  };

  // 生成 LLM 模型选项
  const llmOptions = getModelOptions('CHAT');

  // 生成 Embedding 模型选项
  const embedingOptions = getModelOptions('EMBEDDING');

  const handleSaveField = useCallback(
    async (fieldType: EFiledType) => {
      const ll = aiConfig;

      if (!aiConfig) return;

      if (fieldType === EFiledType.BOTH) {
        await form.validateFields();
      }
      try {
        setLoading(true);
        const values = form.getFieldsValue();
        const currentConfig = aiConfig;

        // 构建更新数据 - 只传递变更的字段
        let updateData: any = {};

        switch (fieldType) {
          case EFiledType.LLM:
            updateData.defaultLlmModel = values.llm;
            setLLMValue(values.llm);

            break;
          case EFiledType.CHAT:
            updateData.defaultChatModel = values.chat;
            setChatValue(values.chat);
            break;
          case EFiledType.TEXT_EMBEDDING:
            updateData.defaultEmbeddingModel = values.textEmbedding;
            setEmbeddingValue(values.textEmbedding);
            break;
          case EFiledType.BOTH:
            await form.validateFields();
            updateData.defaultLlmModel = values.llm;
            updateData.defaultChatModel = values.chat;
            updateData.defaultEmbeddingModel = values.textEmbedding;
            setLLMValue(values.llm);
            setChatValue(values.chat);
            setEmbeddingValue(values.textEmbedding);
            break;
        }
        // 调用更新API
        await setting.updateAIConfig({
          ...aiConfig,
          ...updateData,
        });
      } catch (e) {
        // message.error('提交失败');
        console.error('保存失败:', e);
      } finally {
        setCurrentEditingSelect(ESelectType.NONE);
        setLoading(false);
      }
    },
    [form, aiConfig],
  );

  const renderOption = (option) => {
    const [vendorType, value] = (option.value as string)?.split('/');
    const config = VendorsConfig[vendorType];
    return (
      <Popover
        rootClassName={styles.llmDescription}
        placement="right"
        title={
          <span className={styles.modelDetailTitle}>
            <Icon component={config?.icon} style={{ fontSize: 16 }} />
            {config?.label}
          </span>
        }
        content={
          <div>
            <div className={styles.modelDetailContent}>{option?.label || '-'}</div>
            <div>
              <Tag>{option?.data?.data?.model?.modelType || '-'}</Tag>
            </div>
          </div>
        }
      >
        <span className={styles.optionContainer}>
          <Icon component={VendorsConfig[vendorType]?.icon} style={{ fontSize: 16 }} />
          <span style={{ marginLeft: 8 }}>{value}</span>
        </span>
      </Popover>
    );
  };
  const renderLabel = ({ label, tooltip }: { label: string; tooltip: string }) => {
    return (
      <span className={styles.labelContainer}>
        <span className={styles.labelText}>{label}</span>
        <Tooltip title={tooltip}>
          <QuestionCircleOutlined className={styles.helpIcon} />
        </Tooltip>
      </span>
    );
  };

  const spinningStatus = loading || updateLoading || modelsLoading;

  return (
    <Spin spinning={spinningStatus}>
      <div className={styles.wrapper}>
        <Form form={form} className={styles.formLayout} requiredMark="optional">
          <Row>
            <Col offset={0}>
              <Form.Item
                required
                layout="vertical"
                className={styles.field}
                label={renderLabel({
                  label: formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.4A130634',
                    defaultMessage: 'SQL 生成模型',
                  }),
                  tooltip: formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.F9A9FAAC',
                    defaultMessage: '设置 SQL 生成、改写和补全使用的默认模型',
                  }),
                })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.87AB2467',
                      defaultMessage: '请选择 LLM 模型',
                    }),
                  },
                ]}
              >
                {isEditing(ESelectType.LLM) ? (
                  <div className={styles.modelEditWrapper}>
                    <Form.Item name="llm" className={styles.selectField}>
                      <Select
                        placeholder={formatMessage({
                          id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.5A9D1247',
                          defaultMessage: '请选择',
                        })}
                        className={styles.selectInput}
                        notFoundContent={<LargeModelSelectEmpty />}
                        optionRender={(option) => renderOption(option)}
                        options={llmOptions}
                        styles={{ popup: { root: { maxHeight: 360, overflowY: 'scroll' } } }}
                        showSearch
                        filterOption={(input, option) => {
                          const searchText = input.toLowerCase();
                          // 从 option.value 中提取模型名称
                          const modelName = (option?.value as string)?.split('/')[1] || '';
                          return modelName.toLowerCase().includes(searchText);
                        }}
                      />
                    </Form.Item>
                    {llmValue && (
                      <div className={styles.editOperations}>
                        <CheckOutlined
                          style={{ color: '#0ac185' }}
                          onClick={() => handleSaveField(EFiledType.LLM)}
                        />

                        <CloseOutlined
                          style={{ color: '#f93939' }}
                          onClick={() => {
                            setCurrentEditingSelect(ESelectType.NONE);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {renderContent(llmValue) || (
                      <Typography.Text type="secondary">
                        {formatMessage({
                          id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.7BCD10C8',
                          defaultMessage: '(暂未选择模型)',
                        })}
                      </Typography.Text>
                    )}
                    {renderModelStatusWarning(
                      defaultModelStatuses?.llmStatus || EModelSatus.SUCCESS,
                    )}
                    <EditOutlined
                      className={styles.edit}
                      onClick={() => {
                        setCurrentEditingSelect(ESelectType.LLM);
                      }}
                    />
                  </>
                )}
              </Form.Item>
            </Col>
            <Col offset={0}>
              <Form.Item
                layout="vertical"
                required
                className={styles.field}
                label={renderLabel({
                  label: formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.08B00B84',
                    defaultMessage: 'Embedding 模型',
                  }),
                  tooltip: formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.7EE47F9F',
                    defaultMessage:
                      '设置文本嵌入处理的默认模型，切换后可能导致检索失败，请谨慎操作',
                  }),
                })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.680A368A',
                      defaultMessage: '请选择 Embedding 模型',
                    }),
                  },
                ]}
              >
                {isEditing(ESelectType.EMBEDDING) ? (
                  <div className={styles.modelEditWrapper}>
                    <Form.Item
                      name="textEmbedding"
                      className={styles.selectField}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.D5927A88',
                            defaultMessage: '请选择',
                          }),
                        },
                      ]}
                    >
                      <Select
                        placeholder={formatMessage({
                          id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.FBDA7C13',
                          defaultMessage: '请选择',
                        })}
                        className={styles.selectInput}
                        notFoundContent={<LargeModelSelectEmpty />}
                        options={embedingOptions}
                        optionRender={(option) => renderOption(option)}
                        styles={{ popup: { root: { maxHeight: 360, overflowY: 'scroll' } } }}
                        showSearch
                        filterOption={(input, option) => {
                          const searchText = input.toLowerCase();
                          // 从 option.value 中提取模型名称
                          const modelName = (option?.value as string)?.split('/')[1] || '';
                          return modelName.toLowerCase().includes(searchText);
                        }}
                      />
                    </Form.Item>
                    {embeddingValue && (
                      <div className={styles.editOperations}>
                        <Popconfirm
                          onConfirm={() => handleSaveField(EFiledType.TEXT_EMBEDDING)}
                          styles={{ root: { width: 292 } }}
                          title={formatMessage({
                            id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.8D48B36C',
                            defaultMessage:
                              '切换 Text Embedding 模型后将导致已导入的知识库与问题之间的向量维度不一致，从而导致检索失败，确认要切换吗？',
                          })}
                        >
                          <CheckOutlined style={{ color: '#0ac185' }} />
                        </Popconfirm>
                        <CloseOutlined
                          style={{ color: '#f93939' }}
                          onClick={() => {
                            setCurrentEditingSelect(ESelectType.NONE);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {renderContent(embeddingValue)}
                    {renderModelStatusWarning(
                      defaultModelStatuses?.embeddingStatus || EModelSatus.SUCCESS,
                    )}
                    <EditOutlined
                      className={styles.edit}
                      onClick={() => {
                        setCurrentEditingSelect(ESelectType.EMBEDDING);
                      }}
                    />
                  </>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className={styles.save}>
          <>
            {!embeddingValue && (
              <Button
                type="primary"
                onClick={() => handleSaveField(EFiledType.BOTH)}
                loading={loading || updateLoading}
                style={{ marginRight: 8 }}
              >
                {formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.ModelSelect.FBEE41E9',
                  defaultMessage: '保存',
                })}
              </Button>
            )}
          </>
        </div>
      </div>
    </Spin>
  );
};

export default ModelSelect;
