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
import OpenAILogo from '@/svgr/vendor/openAI.svg';
import DouBaoLogo from '@/svgr/vendor/doubao.svg';

import { ReactComponent as TongyiSVG } from '@/svgr/vendor/tongyi.svg';
import TongyiLogo from '@/svgr/vendor/tongyi.svg';
import { ReactComponent as DeepSeekSVG } from '@/svgr/vendor/deepseek.svg';
import DeepSeekLogo from '@/svgr/vendor/deepseek.svg';
import { ReactComponent as DouBaoSVG } from '@/svgr/vendor/doubao.svg';
import { ReactComponent as OllmaSVG } from '@/svgr/vendor/ollama.svg';
import { ReactComponent as OpenAISVG } from '@/svgr/vendor/openAI.svg';
import { ReactComponent as VllmSVG } from '@/svgr/vendor/vllm.svg';
import { ReactComponent as GreyTongyiSVG } from '@/svgr/vendor/grey-tongyi.svg';
import { ReactComponent as GreyDeepSeekSVG } from '@/svgr/vendor/grey-deepseek.svg';
import { ReactComponent as GreyDouBaoSVG } from '@/svgr/vendor/grey-doubao.svg';
import { ReactComponent as GreyOllmaSVG } from '@/svgr/vendor/grey-ollama.svg';
import { ReactComponent as GreyOpenAISVG } from '@/svgr/vendor/grey-openAI.svg';
import { ReactComponent as GreyVllmSVG } from '@/svgr/vendor/grey-vllm.svg';
import { Input, Radio, Select } from 'antd';
import { EModelSatus, EVendorType, ESchemaFieldType, EConfigurationMethod } from '@/d.ts/llm';

export const modelSelectWarningTooltip = {
  [EModelSatus.DELETED]: '模型已被删除，为不影响正常使用，请更换其他模型',
  [EModelSatus.DEPERCATED]: '模型已废弃，为不影响正常使用，请更换其他模型',
  [EModelSatus.DISABLED]: '模型已禁用，为不影响正常使用，请重启模型或更换其他模型',
};

export const modelListAvatarTooltip = {
  [EModelSatus.DEPERCATED]: '已废弃，不可连接',
  [EModelSatus.DISABLED]: '已禁用',
  [EModelSatus.SUCCESS]: '连接正常',
};
export const VendorsConfig = {
  [EVendorType.TONGYI]: {
    label: '通义千问',
    icon: TongyiSVG,
    greyIcon: GreyTongyiSVG,
    logo: TongyiLogo,
  },
  [EVendorType.DEEPSEEK]: {
    label: 'DeepSeek',
    icon: DeepSeekSVG,
    greyIcon: GreyDeepSeekSVG,
    logo: DeepSeekLogo,
  },
  [EVendorType.DOUBAO]: {
    label: '豆包',
    icon: DouBaoSVG,
    greyIcon: GreyDouBaoSVG,
    logo: DouBaoLogo,
  },
  [EVendorType.OPEN_AI]: {
    label: 'OpenAl-API-compatible',
    icon: OpenAISVG,
    greyIcon: GreyOpenAISVG,
    logo: OpenAILogo,
  },
  // [EVendorType.OLLAMA]: {
  //   label: 'Ollama',
  //   icon: OllmaSVG,
  //   greyIcon: GreyOllmaSVG,
  //   logo: OllamaLogo,
  // },
  // [EVendorType.VLLM]: {
  //   label: 'Vllm',
  //   icon: VllmSVG,
  //   greyIcon: GreyVllmSVG,
  //   logo: VllmLogo,
  // },
};

export const listMock = [
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
  {
    title:
      'glm-4-flashx-xiyan_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multi_dialect_v3_multitijjjjjjjj',
    tags: ['LLM', '32K'],
  },
];

export const formBConfig = {
  [EVendorType.TONGYI]: [
    { label: '模型名称', placeholder: '输入模型名称' },
    { label: '模型显示名称', placeholder: '模型在界面的显示名称' },
    { label: 'API Key', placeholder: '在此输入您的 API Key' },
    { label: '基础模型', placeholder: '请选择' },
  ],
  [EVendorType.DEEPSEEK]: [
    { label: '模型名称', placeholder: '输入模型名称' },
    { label: '模型显示名称', placeholder: '模型在界面的显示名称' },
    { label: 'API Key', placeholder: '在此输入您的 API Key' },
    { label: '基础模型', placeholder: '请选择' },
  ],
  [EVendorType.OPEN_AI]: [
    { label: '模型名称', placeholder: '输入模型名称' },
    { label: '模型显示名称', placeholder: '模型在界面的显示名称' },
    { label: 'API Key', placeholder: '在此输入您的 API Key' },
    { label: 'API endpoint URL', placeholder: 'Base URL, e.g. https://api.openai.com/v1' },
    { label: 'API endpoint中的模型名称', placeholder: 'endpoint model name, e.g. chatgpt4.0' },
  ],
  [EVendorType.DOUBAO]: [
    { label: '模型名称', placeholder: '输入模型名称' },
    { label: '鉴权方式', placeholder: 'API Key' },
    { label: 'API Key', placeholder: '输入您的 API Key' },
    { label: '火山引擎地域', placeholder: 'cn-beijing' },
    { label: 'API Endpoint Host', placeholder: 'https://ark.cn-beijing.volces.com/api/v3' },
    { label: 'Endpoint ID', placeholder: '输入您的 Endpoint ID' },
    { label: '基础模型', placeholder: '请选择' },
  ],
};

const radioOptions = [
  { label: 'LLM', value: 'LLM' },
  { label: 'Text Embedding', value: 'TextEmbedding' },
  { label: 'Rerank', value: 'Rerank' },
  { label: 'TTS', value: 'TTS' },
];

export const formConfig = {
  [EVendorType.DEEPSEEK]: [
    {
      label: '模型类型',
      name: 'modelType',
      initialValue: 'LLM',
      rules: [{ required: true, message: '请输入类型' }],
      component: <Radio.Group options={radioOptions} />,
    },
    {
      label: '模型名称',
      name: 'modelName',
      rules: [{ required: true, message: '请输入名称' }],
      component: <Input placeholder="请输入模型名称" />,
    },
    {
      label: '访问地址',
      name: 'visitUrl',
      rules: [{ required: true, message: '请输入访问地址' }],
      component: <Input placeholder="请输入访问地址" />,
    },
    {
      label: 'API Key',
      name: 'apiKey',
      component: <Input placeholder="请输入" />,
    },
    {
      label: '上下文长度',
      name: 'contextLength',
      rules: [{ required: true, message: '请输入上下文长度' }],
      component: <Input />,
    },
  ],
  [EVendorType.TONGYI]: [
    {
      label: '模型类型',
      name: 'modelType',
      initialValue: 'LLM',
      rules: [{ required: true, message: '请输入类型' }],
      component: <Radio.Group options={radioOptions} />,
    },
    {
      label: '模型名称',
      name: 'modelName',
      rules: [{ required: true, message: '请输入名称' }],
      component: <Input placeholder="请输入模型名称" />,
    },
    {
      label: '访问地址',
      name: 'visitUrl',
      rules: [{ required: true, message: '请输入访问地址' }],
      component: <Input placeholder="请输入访问地址" />,
    },
    {
      label: 'API Key',
      name: 'apiKey',
      component: <Input placeholder="请输入" />,
    },
    {
      label: '上下文长度',
      name: 'contextLength',
      rules: [{ required: true, message: '请输入上下文长度' }],
      component: <Input />,
    },
  ],
  [EVendorType.OPEN_AI]: [
    {
      label: '模型类型',
      name: 'modelType',
      initialValue: 'LLM',
      rules: [{ required: true, message: '请输入类型' }],
      component: <Radio.Group options={radioOptions} />,
    },
    {
      label: '模型名称',
      name: 'modelName',
      rules: [{ required: true, message: '请输入名称' }],
      component: <Input placeholder="请输入模型名称" />,
    },
    {
      label: 'API Key',
      name: 'apiKey',
      component: <Input placeholder="请输入" />,
    },
    {
      label: 'API endpoint URL',
      name: 'endpointUrl',
      rules: [{ required: true, message: '请输入 API endpoint URL' }],
      placeholder: <Input placeholder="Base URL, e.g. https://api.openai.com/v1" />,
    },
    {
      label: 'API endpoint中的模型名称',
      component: <Input placeholder="endpoint model name, e.g. chatgpt4.0" />,
    },
    {
      label: '上下文长度',
      name: 'contextLength',
      rules: [{ required: true, message: '请输入上下文长度' }],
      component: <Input />,
    },
  ],
  [EVendorType.DOUBAO]: [
    {
      label: '模型类型',
      name: 'modelType',
      initialValue: 'LLM',
      rules: [{ required: true, message: '请输入类型' }],
      component: <Radio.Group options={radioOptions} />,
    },
    {
      label: '模型名称',
      name: 'modelName',
      rules: [{ required: true, message: '请输入名称' }],
      component: <Input placeholder="请输入模型名称" />,
    },
    { label: '鉴权方式', name: 'auth', component: <Input placeholder="API Key" /> },
    {
      label: 'API Key',
      name: 'apiKey',
      component: <Input placeholder="请输入" />,
    },
    { label: '火山引擎地域', name: 'engine', component: <Input placeholder="cn-beijing" /> },
    {
      label: 'API Endpoint Host',
      name: 'host',
      component: <Input placeholder="https://ark.cn-beijing.volces.com/api/v3" />,
    },
    {
      label: 'Endpoint ID',
      name: 'endpointId',
      component: <Input placeholder="输入您的 Endpoint ID" />,
    },
    { label: '基础模型', name: 'model', component: <Select placeholder="请选择" /> },
  ],
};

// UI 颜色常量
export const UI_COLORS = {
  SUCCESS_GREEN: '#52c41a',
  ERROR_RED: '#ff4d4f',
  WHITE: '#fff',
  WARNING_ORANGE: '#faad14',
} as const;

// UI 尺寸常量
export const UI_SIZES = {
  ICON_SIZE_LARGE: 24,
  ICON_SIZE_MEDIUM: 16,
  ICON_SIZE_SMALL: 14,
  STATUS_DOT_SIZE: 6,
  SPACING_SMALL: 4,
  SPACING_MEDIUM: 8,
  SPACING_LARGE: 16,
} as const;

// 文本常量
export const TEXT_CONSTANTS = {
  // 按钮文案
  CONFIGURE_API_KEY: '配置 API KEY',
  MODIFY_API_KEY: '修改 API KEY',

  // 提示信息
  NO_MODELS: '暂无模型',
  CONFIGURE_API_KEY_FIRST: '请先配置 API Key 获取模型',
  MODELS_COUNT: (count: number) => `${count} 个模型`,

  // 模态框标题
  EDIT_MODEL_TITLE: '编辑模型',
  ADD_MODEL_TITLE: '添加模型',
} as const;

export { EModelSatus };
