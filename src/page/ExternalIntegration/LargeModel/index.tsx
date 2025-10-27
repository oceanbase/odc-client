import { formatMessage } from '@/util/intl';
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
  IModel,
} from '@/d.ts/llm';
import LargeModelListEmpty from '@/component/Empty/LargeModelListEmpty';
import {
  deleteProviderModel,
  toggleProviderModel,
  getProviderModels,
  getModelProviders,
} from '@/util/request/largeModel';
import { useRequest } from 'ahooks';
import { EModelSatus, EAIFeatureType, type CardData } from '@/d.ts/llm';
import { observer } from 'mobx-react';
import setting from '@/store/setting';

const LargeModel = () => {
  const [items, setItems] = useState<CardData[]>([]);
  const [providers, setProviders] = useState<IModelProvider[]>([]);
  const [allModels, setAllModels] = useState<IModel[]>([]);
  const [filteredModelList, setFilteredModelList] = useState<IModel[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [deletePopconfirmOpen, setDeletePopconfirmOpen] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Modal refs
  const editModalRef = useRef<EditModalRef>(null);
  const apiKeyConfigModalRef = useRef<APIKeyConfigModalRef>(null);
  const descriptionModelRef = useRef<DescriptionModelRef>(null);

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
      const models: IModel[] = [];

      if (providers.length === 0) {
        return [];
      }

      // 并行获取所有供应商的模型
      const modelPromises = providers.map(async (provider) => {
        try {
          const providerModels = await getProviderModels(provider.provider);
          return providerModels;
        } catch (error) {
          console.error(
            formatMessage(
              {
                id: 'src.page.ExternalIntegration.LargeModel.6F39B4A9',
                defaultMessage: '获取{providerProvider}的模型失败:',
              },
              { providerProvider: provider.provider },
            ),
            error,
          );
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
    const map = new Map<string, IModel[]>();
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
      llmStatus: checkModelStatus(setting.AIConfig?.defaultLlmModel || ''),
      chatStatus: checkModelStatus(setting.AIConfig?.defaultChatModel || ''),
      embeddingStatus: checkModelStatus(setting.AIConfig?.defaultEmbeddingModel || ''),
    };
  }, [setting.AIConfig, allModels]);

  // 获取模型选项（按供应商分组）
  const getModelOptions = useCallback(
    (modelType: 'CHAT' | 'EMBEDDING'): any[] => {
      const models = modelType === 'CHAT' ? chatModels : embeddingModels;
      const modelOptions: any[] = [];

      // 按供应商分组
      const providerModels = new Map<string, IModel[]>();
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
        message.success(
          formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.1D98BE2A',
            defaultMessage: '模型已删除',
          }),
        );
        fetchAllModels();
        fetchProviders();
      },
      onError: (error) => {
        message.error(
          formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.0E823981',
            defaultMessage: '删除模型失败',
          }),
        );
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
        message.success(
          formatMessage(
            {
              id: 'src.page.ExternalIntegration.LargeModel.BDF17AAE',
              defaultMessage: "模型已{enabled ? '启用' : '禁用'}",
            },
            {
              ConditionalExpression0: enabled
                ? formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.529B6611',
                    defaultMessage: '启用',
                  })
                : formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.8A7E4399',
                    defaultMessage: '禁用',
                  }),
            },
          ),
        );
        fetchAllModels();
        fetchProviders();
      },
      onError: (error) => {
        message.error(
          formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.4EB7DD25',
            defaultMessage: '操作失败',
          }),
        );
        console.error('切换模型状态失败:', error);
      },
    },
  );

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
      if (!setting.AIConfig) return;

      await setting.updateAIConfig({
        ...setting.AIConfig,
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

  const handleEditModel = (modelInfo: IModel) => {
    const provider = providers.find((p) => p.provider === modelInfo.providerName);
    if (provider && editModalRef.current) {
      editModalRef.current.open({
        provider,
        model: modelInfo,
      });
    }
  };

  // 检查模型是否为默认模型之一
  const isDefaultModel = (modelInfo: IModel): boolean => {
    if (!setting.AIConfig) return false;

    const { defaultLlmModel, defaultChatModel, defaultEmbeddingModel } = setting.AIConfig;
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
          title={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.1F5830DE',
            defaultMessage: '确定要删除此模型吗？',
          })}
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

  const handleDeleteModel = (modelInfo: IModel) => {
    Modal.confirm({
      title: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.6D4BBF49',
        defaultMessage: '确认要删除模型？',
      }),
      icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
      content: (
        <>
          <div>
            {formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.F385664D',
              defaultMessage: '模型（',
            })}
            {modelInfo.modelName}
            {formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.91CD645F',
              defaultMessage: '）已被设置为系统默认模型，',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.3A7A6B0A',
              defaultMessage: '删除可能会影响使用，建议调整系统默认模型后删除。',
            })}
          </div>
        </>
      ),

      okText: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.03FC9D5D',
        defaultMessage: '删除',
      }),
      okType: 'danger',
      cancelText: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.5ED4F750',
        defaultMessage: '取消',
      }),
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

  const handleToggleModel = (modelInfo: IModel, enabled: boolean) => {
    toggleModel({
      provider: modelInfo.providerName,
      modelName: modelInfo.modelName,
      enabled,
    });
  };

  return (
    <>
      <EditModal ref={editModalRef} onRefresh={handleRefreshAll} />
      <APIKeyConfigModal ref={apiKeyConfigModalRef} onRefresh={handleRefreshAll} />
      <DescriptionModel ref={descriptionModelRef} onRefresh={handleRefreshAll} />
      <Spin spinning={providersLoading}>
        <div className={styles.largeModelWrapper}>
          <div className={styles.aiConfig}>
            <div className={styles.title}>
              {formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.47608560',
                defaultMessage: '启用 AI 服务',
              })}

              <Switch
                size="small"
                className={styles.switch}
                checked={setting.AIEnabled}
                onChange={handleSwitchChange}
              />
            </div>

            {!setting.AIEnabled ? (
              <Typography.Text type="secondary" className={styles.tips}>
                {formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.A08AD755',
                  defaultMessage: '开启后，项目内成员可使用代码补全、嵌入式对话等 AI 数据研发能力',
                })}
              </Typography.Text>
            ) : (
              <div style={{ marginTop: 8 }} className={styles.aiFeatures}>
                <Checkbox
                  checked={setting.AIConfig.copilotEnabled}
                  onChange={async (e) => {
                    setting.AIConfig.copilotEnabled = e.target.checked;
                    await setting.updateAIConfig({
                      ...setting.AIConfig,
                      copilotEnabled: e.target.checked,
                    });
                  }}
                >
                  {formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.C88EA7B4',
                    defaultMessage: '嵌入式对话',
                  })}
                </Checkbox>
                <Checkbox
                  checked={setting.AIConfig.completionEnabled}
                  onChange={async (e) => {
                    setting.AIConfig.completionEnabled = e.target.checked;
                    await setting.updateAIConfig({
                      ...setting.AIConfig,
                      completionEnabled: e.target.checked,
                    });
                  }}
                >
                  {formatMessage({
                    id: 'src.page.ExternalIntegration.LargeModel.5605D3D8',
                    defaultMessage: '代码补全',
                  })}
                </Checkbox>
              </div>
            )}
          </div>

          <div className={styles.modelConfig}>
            <div className={styles.title}>
              {formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.DE880D1A',
                defaultMessage: '系统默认模型',
              })}
            </div>
          </div>
          <ModelSelect
            allModels={allModels}
            modelsLoading={modelsLoading}
            aiConfig={setting.AIConfig}
            updateLoading={setting.isAIThinking}
            defaultModelStatuses={defaultModelStatuses}
            getModelOptions={getModelOptions}
          />

          <div className={styles.largeModel}>
            <div className={styles.title}>
              {formatMessage({
                id: 'src.page.ExternalIntegration.LargeModel.348A7584',
                defaultMessage: '模型供应商',
              })}
            </div>
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
                  {selectedProvider
                    ? formatMessage(
                        {
                          id: 'src.page.ExternalIntegration.LargeModel.C791CB6C',
                          defaultMessage: '{filteredModelListLength} 个模型',
                        },
                        { filteredModelListLength: filteredModelList?.length },
                      )
                    : ''}
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
                            {item?.custom && (
                              <Tag className={styles.tags}>
                                {formatMessage({
                                  id: 'src.page.ExternalIntegration.LargeModel.40F9188D',
                                  defaultMessage: '自定义',
                                })}
                              </Tag>
                            )}
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
                            <Tooltip
                              title={
                                item.deprecated &&
                                formatMessage({
                                  id: 'src.page.ExternalIntegration.LargeModel.E2C4ABF7',
                                  defaultMessage: '模型已废弃不可启用',
                                })
                              }
                            >
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

export default observer(LargeModel);
