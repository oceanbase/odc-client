// 模型状态枚举
export enum EModelSatus {
  DELETED = 'DELETED',
  DEPERCATED = 'DEPERCATED',
  DISABLED = 'DISABLED',
  SUCCESS = 'SUCCESS',
}

// 供应商类型枚举
export enum EVendorType {
  TONGYI = 'TONGYI',
  DEEPSEEK = 'DEEPSEEK',
  DOUBAO = 'DOUBAO',
  OPEN_AI = 'OPENAI_API_COMPATIBLE',
}

// Schema 字段类型枚举
export enum ESchemaFieldType {
  SECRET_INPUT = 'secret-input',
  TEXT_INPUT = 'text-input',
  SELECT = 'select',
}

// 配置方法枚举
export enum EConfigurationMethod {
  PREDEFINED_MODEL = 'predefined-model',
  CUSTOMIZABLE_MODEL = 'customizable-model',
}

// AI功能类型枚举
export enum EAIFeatureType {
  CHAT = 'chat',
  ASSISTANT = 'assistant',
  COMPLETION = 'completion',
}

// 卡片数据接口
export interface ICardData {
  id: number;
  content: {
    title: string;
    tags: string[];
    apiKey?: string;
    canConfigApiKey?: boolean;
  };
  provider?: IModelProvider;
}

// ModelSelect 组件属性接口
export interface ModelSelectProps {
  allModels: IModel[];
  modelsLoading: boolean;
  aiConfig: IAIConfig | null;
  updateLoading: boolean;
  defaultModelStatuses: {
    llmStatus: EModelSatus;
    chatStatus: EModelSatus;
    embeddingStatus: EModelSatus;
  };
  getModelOptions: (modelType: 'CHAT' | 'EMBEDDING') => any[];
}

// Modal 组件引用接口 - 只负责状态控制
export interface EditModalRef {
  open: (data?: { provider?: IModelProvider; model?: IModel }) => void;
}

export interface APIKeyConfigModalRef {
  open: (provider: IModelProvider) => void;
}

export interface DescriptionModelRef {
  open: (provider: IModelProvider) => void;
}

// Modal 组件属性接口 - 负责函数传递
export interface EditModalProps {
  onRefresh?: () => void;
}

export interface APIKeyConfigModalProps {
  onRefresh?: () => void;
}

export interface DescriptionModelProps {
  onRefresh?: () => void;
}

// AI配置相关的接口类型定义
export interface IAIConfig {
  organizationId: number;
  aiEnabled: boolean;
  chatEnabled: boolean;
  copilotEnabled: boolean;
  completionEnabled: boolean;
  defaultEmbeddingModel: string;
  defaultLlmModel: string;
  defaultChatModel: string;
}

export interface IAIConfigPayload {
  aiEnabled: boolean;
  chatEnabled: boolean;
  copilotEnabled: boolean;
  completionEnabled: boolean;
  defaultEmbeddingModel: string;
  defaultLlmModel: string;
  defaultChatModel: string;
}

// 模型供应商相关的接口类型定义
export interface IModelCredentialFormSchema {
  defaultValue: string | null;
  label: {
    en_US: string;
    zh_Hans: string | null;
  };
  options: Array<{
    label: {
      en_US: string;
      zh_Hans: string;
    };
    value: string;
  }> | null;
  placeholder: {
    en_US: string;
    zh_Hans: string;
  } | null;
  required: boolean;
  showOn: Array<{
    value: string;
    variable: string;
  }> | null;
  type: string;
  variable: string;
}

export interface IModelCredentialSchema {
  credentialFormSchemas: IModelCredentialFormSchema[];
  model?: {
    label: {
      en_US: string;
      zh_Hans: string;
    };
    placeholder: {
      en_US: string;
      zh_Hans: string;
    };
  };
}

export interface IModelProvider {
  credentialConfigured: boolean;
  modelCounts: number;
  description: string;
  withModels: boolean;
  configurateMethods: string[];
  help: {
    title: {
      en_US: string;
      zh_Hans: string;
    };
    url: {
      en_US: string;
      zh_Hans: string;
    };
  };
  modelCredentialSchema: IModelCredentialSchema;
  provider: string;
  providerCredentialSchema: IModelCredentialSchema;
  supportedModelTypes: string[];
}

export interface IModel {
  id: number;
  createTime: number;
  updateTime: number;
  organizationId: number;
  creatorId: number;
  lastModifierId: number;
  providerName: string;
  modelName: string;
  displayName: string;
  description?: string;
  modelType: string;
  contextSize?: number;
  enabled: boolean;
  deprecated: boolean;
  custom: boolean;
  maxToken: number;
  credential: Record<string, any>;
  type?: string;
  model?: string;
  functionCallingSupport?: boolean;
}

export interface IProviderCredential {
  provider: string;
  credential: Record<string, any>;
}
