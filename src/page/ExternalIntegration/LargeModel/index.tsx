import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Checkbox,
  List,
  message,
  Modal,
  Popconfirm,
  Switch,
  Tag,
  Tooltip,
  Typography,
  Form,
  Spin,
} from 'antd';
import VendorCard from './component/VendorCard';
import styles from './index.less';
import ModelSelect from './component/ModelSelect';
import { VendorsConfig } from './constant';
import Icon, { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import EditModal from './component/EditModal';
import APIKeyConfigModal from './component/APIKeyConfigModal';
import DescriptionModel from './component/DescriptionModel';
import {
  type EditModalRef,
  type APIKeyConfigModalRef,
  type DescriptionModelRef,
  IModelProvider,
  IAIConfig,
  IModelInfo,
} from '@/d.ts/llm';
import LargeModelListEmpty from '@/component/Empty/LargeModelListEmpty';
import {
  deleteProviderModel,
  toggleProviderModel,
  getProviderModels,
  getModelProviders,
  getAIConfig,
  updateAIConfig,
} from '@/util/request/largeModel';
import { useRequest } from 'ahooks';
import { EModelSatus, EAIFeatureType, type CardData } from '@/d.ts/llm';

const LargeModel = () => {
  const [items, setItems] = useState<CardData[]>([]);
  const [providers, setProviders] = useState<IModelProvider[]>([]);
  const [allModels, setAllModels] = useState<IModelInfo[]>([]);
  const [aiConfig, setAiConfig] = useState<IAIConfig | null>(null);
  const [filteredModelList, setFilteredModelList] = useState<IModelInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [deletePopconfirmOpen, setDeletePopconfirmOpen] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Modal refs
  const editModalRef = useRef<EditModalRef>(null);
  const apiKeyConfigModalRef = useRef<APIKeyConfigModalRef>(null);
  const descriptionModelRef = useRef<DescriptionModelRef>(null);

  // 获取AI配置
  const { run: fetchAIConfig, loading: aiConfigLoading } = useRequest(getAIConfig, {
    manual: true,
    onSuccess: (data) => {
      setAiConfig(data);
    },
  });

  // 更新AI配置
  const { run: updateAIConfigFunc, loading: updateLoading } = useRequest(updateAIConfig, {
    manual: true,
    onSuccess: (data) => {
      setAiConfig(data);
      message.success('配置更新成功');
    },
    onError: () => {
      message.error('配置更新失败');
    },
  });

  // 获取供应商列表
  const { run: fetchProviders, loading: providersLoading } = useRequest(getModelProviders, {
    manual: true,
    onSuccess: (data) => {
      setProviders(data);
    },
  });

  // 获取所有模型数据
  const { run: fetchAllModels, loading: modelsLoading } = useRequest(
    async () => {
      const models: IModelInfo[] = [];

      if (providers.length === 0) {
        return [];
      }

      // 并行获取所有供应商的模型
      const modelPromises = providers.map(async (provider) => {
        try {
          const providerModels = await getProviderModels(provider.provider);
          return providerModels;
        } catch (error) {
          console.error(`获取${provider.provider}的模型失败:`, error);
          return [];
        }
      });

      const modelsArrays = await Promise.all(modelPromises);
      modelsArrays.forEach((providerModels) => {
        models.push(...providerModels);
      });

      return models;
    },
    {
      manual: true,
      onSuccess: (data) => {
        setAllModels(data || []);
      },
      onError: (error) => {
        console.error('获取模型列表失败:', error);
        setAllModels([]);
      },
    },
  );

  // 初始化数据
  useEffect(() => {
    fetchAIConfig();
    fetchProviders();
  }, []);

  // 当providers变化时，获取模型数据
  useEffect(() => {
    if (providers?.length > 0) {
      fetchAllModels();
    }
  }, [providers]);

  // 计算属性：聊天模型列表（过滤不支持函数调用的CHAT模型）
  const chatModels = useMemo(() => {
    return allModels.filter((model) => {
      if (model.modelType === 'CHAT' && model.functionCallingSupport === false) {
        return false;
      }
      return model.modelType === 'CHAT';
    });
  }, [allModels]);

  // 计算属性：嵌入模型列表
  const embeddingModels = useMemo(() => {
    return allModels.filter((model) => model.modelType === 'EMBEDDING');
  }, [allModels]);

  // 计算属性：按供应商分组的模型
  const modelsByProvider = useMemo(() => {
    const map = new Map<string, IModelInfo[]>();
    allModels.forEach((model) => {
      const provider = model.providerName;
      if (!map.has(provider)) {
        map.set(provider, []);
      }
      map.get(provider)!.push(model);
    });
    return map;
  }, [allModels]);

  // 计算属性：默认模型状态检查
  const defaultModelStatuses = useMemo(() => {
    const checkModelStatus = (modelKey: string) => {
      if (!modelKey) {
        return EModelSatus.DELETED;
      }

      const [providerName, modelName] = modelKey.split('/');
      if (!providerName || !modelName) {
        return EModelSatus.DELETED;
      }

      const foundModel = allModels.find(
        (model) => model.providerName === providerName && model.modelName === modelName,
      );

      if (!foundModel) {
        return EModelSatus.DELETED;
      }

      if (foundModel.deprecated) {
        return EModelSatus.DEPERCATED;
      }

      if (!foundModel.enabled) {
        return EModelSatus.DISABLED;
      }

      return EModelSatus.SUCCESS;
    };

    return {
      llmStatus: checkModelStatus(aiConfig?.defaultLlmModel || ''),
      chatStatus: checkModelStatus(aiConfig?.defaultChatModel || ''),
      embeddingStatus: checkModelStatus(aiConfig?.defaultEmbeddingModel || ''),
    };
  }, [aiConfig, allModels]);

  // 获取模型选项（按供应商分组）
  const getModelOptions = useCallback(
    (modelType: 'CHAT' | 'EMBEDDING'): any[] => {
      const models = modelType === 'CHAT' ? chatModels : embeddingModels;
      const modelOptions: any[] = [];

      // 按供应商分组
      const providerModels = new Map<string, IModelInfo[]>();
      models.forEach((model) => {
        const provider = model.providerName;
        if (!providerModels.has(provider)) {
          providerModels.set(provider, []);
        }
        providerModels.get(provider)!.push(model);
      });

      // 构建选项
      providerModels.forEach((modelList, providerName) => {
        const options = modelList.map((model) => ({
          label: model.displayName || model.modelName,
          value: `${providerName}/${model.modelName}`,
          data: { model }, // 保存原始模型数据，方便使用
        }));

        if (options.length > 0) {
          modelOptions.push({
            label: providerName,
            options: options,
          });
        }
      });

      return modelOptions;
    },
    [chatModels, embeddingModels],
  );

  // 删除模型
  const { run: deleteModel } = useRequest(
    ({ provider, modelName, type }: { provider: string; modelName: string; type: string }) =>
      deleteProviderModel(provider, { model: modelName, type }),
    {
      manual: true,
      onSuccess: () => {
        message.success('模型已删除');
        fetchAllModels();
        fetchProviders();
      },
      onError: (error) => {
        message.error('删除模型失败');
        console.error('删除模型失败:', error);
      },
    },
  );

  // 启用/禁用模型
  const { run: toggleModel } = useRequest(
    ({ provider, modelName, enabled }: { provider: string; modelName: string; enabled: boolean }) =>
      toggleProviderModel(provider, { model: modelName, enabled }),
    {
      manual: true,
      onSuccess: (_, params) => {
        const [{ enabled }] = params;
        message.success(`模型已${enabled ? '启用' : '禁用'}`);
        fetchAllModels();
        fetchProviders();
      },
      onError: (error) => {
        message.error('操作失败');
        console.error('切换模型状态失败:', error);
      },
    },
  );

  // 初始化表单值
  useEffect(() => {
    if (aiConfig) {
      const featureMap = [
        { enabled: aiConfig.chatEnabled, type: EAIFeatureType.CHAT },
        { enabled: aiConfig.copilotEnabled, type: EAIFeatureType.ASSISTANT },
        { enabled: aiConfig.completionEnabled, type: EAIFeatureType.COMPLETION },
      ];

      const aiFeatures = featureMap
        .filter((feature) => feature.enabled)
        .map((feature) => feature.type);

      form.setFieldsValue({
        aiFeatures,
      });
    }
  }, [aiConfig, form]);

  // 处理providers数据变化，转换为CardData格式
  useEffect(() => {
    if (providers?.length > 0) {
      const cardData: CardData[] = providers.map((provider, index) => ({
        id: index + 1,
        content: {
          title: VendorsConfig[provider.provider]?.label || provider.provider,
          tags: provider.supportedModelTypes || [],
          apiKey: provider.credentialConfigured ? 'configured' : undefined,
          canConfigApiKey: provider.configurateMethods?.includes('predefined-model') || false,
        },
        provider, // 保存原始provider数据
      }));
      setItems(cardData);

      // 默认选中第一项
      if (providers?.length > 0 && !selectedProvider) {
        setSelectedProvider(providers?.[0]?.provider);
      }
    }
  }, [providers, selectedProvider]);

  // 根据选中的供应商过滤模型列表
  useEffect(() => {
    if (selectedProvider && allModels) {
      const filtered = allModels.filter((model) => model.providerName === selectedProvider);
      setFilteredModelList(filtered);
    } else {
      setFilteredModelList([]);
    }
  }, [selectedProvider, allModels]);

  // 处理供应商卡片点击事件
  const handleVendorCardClick = (provider: string) => {
    setSelectedProvider(provider);
  };

  const handleRefreshAll = useCallback(() => {
    fetchProviders();
    fetchAllModels();
  }, []);

  const handleSwitchChange = async (checked: boolean) => {
    try {
      if (!aiConfig) return;

      await updateAIConfigFunc({
        ...aiConfig,
        chatEnabled: checked,
        copilotEnabled: checked,
        completionEnabled: checked,
      });

      if (checked) {
        form.setFieldsValue({
          aiFeatures: [EAIFeatureType.CHAT, EAIFeatureType.ASSISTANT, EAIFeatureType.COMPLETION],
        });
      } else {
        form.resetFields();
      }
    } catch (error) {
      console.error('更新AI开关失败:', error);
    }
  };

  const handleFormValuesChange = async (changedValues, allValues) => {
    if (!aiConfig) return;

    const { aiFeatures = [] } = allValues;

    try {
      await updateAIConfigFunc({
        ...aiConfig,
        chatEnabled: aiFeatures.includes(EAIFeatureType.CHAT),
        copilotEnabled: aiFeatures.includes(EAIFeatureType.ASSISTANT),
        completionEnabled: aiFeatures.includes(EAIFeatureType.COMPLETION),
      });
    } catch (error) {
      console.error('更新AI功能配置失败:', error);
    }
  };

  const handleEditModel = (modelInfo: IModelInfo) => {
    const provider = providers.find((p) => p.provider === modelInfo.providerName);
    if (provider && editModalRef.current) {
      editModalRef.current.open({
        provider,
        model: modelInfo,
      });
    }
  };

  // 检查模型是否为默认模型之一
  const isDefaultModel = (modelInfo: IModelInfo): boolean => {
    if (!aiConfig) return false;

    const { defaultLlmModel, defaultChatModel, defaultEmbeddingModel } = aiConfig;
    const modelKey = `${modelInfo.providerName}/${modelInfo.modelName}`;

    return [defaultChatModel, defaultLlmModel, defaultEmbeddingModel].includes(modelKey);
  };

  const renderDeleteIcon = (item) => {
    const isDefault = isDefaultModel(item);
    const modelKey = `${item.providerName}-${item.modelName}`;

    if (isDefault) {
      return <DeleteOutlined onClick={() => handleDeleteModel(item)} className={styles.icon} />;
    } else {
      return (
        <Popconfirm
          title="确定要删除此模型吗？"
          open={deletePopconfirmOpen === modelKey}
          onConfirm={() => {
            deleteModel({
              provider: item.providerName,
              modelName: item.modelName,
              type: item.modelType,
            });
            setDeletePopconfirmOpen(null);
          }}
          onCancel={() => setDeletePopconfirmOpen(null)}
          placement="top"
          getPopupContainer={(triggerNode) => triggerNode.parentElement.parentElement}
        >
          <DeleteOutlined
            className={styles.icon}
            onClick={() => setDeletePopconfirmOpen(modelKey)}
          />
        </Popconfirm>
      );
    }
  };

  const handleDeleteModel = (modelInfo: IModelInfo) => {
    Modal.confirm({
      title: '确认要删除模型？',
      icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
      content: (
        <>
          <div>模型（{modelInfo.modelName}）已被设置为系统默认模型，</div>
          <div>删除可能会影响使用，建议调整系统默认模型后删除。</div>
        </>
      ),
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      closable: true,
      onOk() {
        deleteModel({
          provider: modelInfo.providerName,
          modelName: modelInfo.modelName,
          type: modelInfo.modelType,
        });
      },
    });
  };

  const handleToggleModel = (modelInfo: IModelInfo, enabled: boolean) => {
    toggleModel({
      provider: modelInfo.providerName,
      modelName: modelInfo.modelName,
      enabled,
    });
  };

  const { chatEnabled, completionEnabled, copilotEnabled } = aiConfig || {};

  const loading = aiConfigLoading || providersLoading || updateLoading;

  return (
    <>
      <EditModal ref={editModalRef} onRefresh={handleRefreshAll} />
      <APIKeyConfigModal ref={apiKeyConfigModalRef} onRefresh={handleRefreshAll} />
      <DescriptionModel ref={descriptionModelRef} onRefresh={handleRefreshAll} />
      <Spin spinning={loading}>
        <div className={styles.largeModelWrapper}>
          <div className={styles.aiConfig}>
            <div className={styles.title}>
              启用 AI 服务
              <Switch
                className={styles.switch}
                checked={chatEnabled || completionEnabled || copilotEnabled}
                onChange={handleSwitchChange}
                loading={updateLoading}
              />
            </div>

            {!(chatEnabled || completionEnabled || copilotEnabled) ? (
              <Typography.Text type="secondary" className={styles.tips}>
                开启后，项目内成员可使用代码补全、嵌入式对话等 AI 数据研发能力
              </Typography.Text>
            ) : (
              <Form
                form={form}
                onValuesChange={handleFormValuesChange}
                style={{ marginTop: 8 }}
                className={styles.aiFeatures}
                initialValues={{
                  aiFeatures: [EAIFeatureType.ASSISTANT],
                }}
              >
                <Form.Item name="aiFeatures" className={styles.aiFeaturesItem}>
                  <Checkbox.Group
                    options={[
                      { label: '嵌入式对话', value: EAIFeatureType.CHAT },
                      { label: '开发助理', value: EAIFeatureType.ASSISTANT },
                      { label: '代码补全', value: EAIFeatureType.COMPLETION },
                    ]}
                  />
                </Form.Item>
              </Form>
            )}
          </div>

          <div className={styles.modelConfig}>
            <div className={styles.title}>系统默认模型</div>
          </div>
          <ModelSelect
            allModels={allModels}
            modelsLoading={modelsLoading}
            aiConfig={aiConfig}
            updateAIConfig={updateAIConfigFunc}
            updateLoading={updateLoading}
            defaultModelStatuses={defaultModelStatuses}
            getModelOptions={getModelOptions}
          />
          <div className={styles.largeModel}>
            <div className={styles.title}>模型供应商</div>
            <div className={styles.largeModelContent}>
              <List
                className={styles.list}
                dataSource={items}
                loading={providersLoading}
                renderItem={(item, index) => {
                  const { tags, apiKey, title, canConfigApiKey } = item.content;
                  return (
                    <div key={item?.provider?.provider + index}>
                      <VendorCard
                        tags={tags}
                        apiKey={apiKey}
                        title={title}
                        canConfigApiKey={canConfigApiKey}
                        provider={item.provider} // 传递provider数据
                        isActive={selectedProvider === item.provider?.provider}
                        onClick={() => handleVendorCardClick(item.provider?.provider || '')}
                        editModalRef={editModalRef}
                        apiKeyConfigModalRef={apiKeyConfigModalRef}
                        descriptionModelRef={descriptionModelRef}
                        onRefreshModels={handleRefreshAll}
                      />
                    </div>
                  );
                }}
              />
              <div className={styles.modelList}>
                <div className={styles.title}>
                  {selectedProvider ? `${filteredModelList?.length} 个模型` : ''}
                </div>
                {filteredModelList?.length > 0 ? (
                  <List
                    dataSource={filteredModelList}
                    renderItem={(item) => {
                      return (
                        <div
                          key={`${item.providerName}-${item.modelName}`}
                          className={`${styles.modelItem} ${
                            deletePopconfirmOpen === `${item.providerName}-${item.modelName}`
                              ? styles.forceShowActions
                              : ''
                          }`}
                        >
                          <div
                            className={
                              item?.deprecated ? styles.greyDescription : styles.description
                            }
                          >
                            <Icon
                              component={VendorsConfig[item?.providerName]?.icon}
                              className={styles.icon}
                            />
                            <Typography.Text className={styles.modelName} ellipsis>
                              {item.modelName}
                            </Typography.Text>
                            <Typography.Text className={styles.tips} ellipsis>
                              {item.description}
                            </Typography.Text>
                            <Tag className={styles.tags}>{item.modelType}</Tag>
                            {item?.contextSize && (
                              <Tag className={styles.tags}>{item.contextSize / 1000}K</Tag>
                            )}
                            {item?.custom && <Tag className={styles.tags}>自定义</Tag>}
                          </div>
                          <div className={styles.operations}>
                            {item?.custom && (
                              <div className={styles.hidden}>
                                <EditOutlined
                                  onClick={() => handleEditModel(item)}
                                  className={styles.icon}
                                />
                                {renderDeleteIcon(item)}
                              </div>
                            )}
                            <Tooltip title={item.deprecated && '模型已废弃不可启用'}>
                              <Switch
                                checked={item.enabled && !item.deprecated}
                                disabled={item.deprecated}
                                onChange={(checked) => handleToggleModel(item, checked)}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      );
                    }}
                  />
                ) : (
                  <LargeModelListEmpty selectedProvider={selectedProvider} providers={providers} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </>
  );
};

export default LargeModel;
