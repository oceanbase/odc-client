import { formatMessage } from '@/util/intl';
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
  [EModelSatus.DELETED]: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.ABF7A1A2',
    defaultMessage: '模型已被删除，为不影响正常使用，请更换其他模型',
  }),
  [EModelSatus.DEPERCATED]: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.C8488E59',
    defaultMessage: '模型已废弃，为不影响正常使用，请更换其他模型',
  }),
  [EModelSatus.DISABLED]: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.B5502063',
    defaultMessage: '模型已禁用，为不影响正常使用，请重启模型或更换其他模型',
  }),
};

export const modelListAvatarTooltip = {
  [EModelSatus.DEPERCATED]: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.4F3C3853',
    defaultMessage: '已废弃，不可连接',
  }),
  [EModelSatus.DISABLED]: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.C016951E',
    defaultMessage: '已禁用',
  }),
  [EModelSatus.SUCCESS]: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.EA7F91A3',
    defaultMessage: '连接正常',
  }),
};
export const VendorsConfig = {
  [EVendorType.TONGYI]: {
    label: formatMessage({
      id: 'src.page.ExternalIntegration.LargeModel.constant.3A35F81A',
      defaultMessage: '通义千问',
    }),
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
    label: formatMessage({
      id: 'src.page.ExternalIntegration.LargeModel.constant.8984A8F1',
      defaultMessage: '豆包',
    }),
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
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.AACE4A66',
        defaultMessage: '模型名称',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.72418E8D',
        defaultMessage: '输入模型名称',
      }),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.1AA6993B',
        defaultMessage: '模型显示名称',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.680A70B1',
        defaultMessage: '模型在界面的显示名称',
      }),
    },
    {
      label: 'API Key',
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.4403BB2A',
        defaultMessage: '在此输入您的 API Key',
      }),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.00DC2135',
        defaultMessage: '基础模型',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.65FEF0D7',
        defaultMessage: '请选择',
      }),
    },
  ],

  [EVendorType.DEEPSEEK]: [
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.76D0DDAE',
        defaultMessage: '模型名称',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.5916FA22',
        defaultMessage: '输入模型名称',
      }),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.E611D916',
        defaultMessage: '模型显示名称',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.DDF9C4D9',
        defaultMessage: '模型在界面的显示名称',
      }),
    },
    {
      label: 'API Key',
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.F06A01AF',
        defaultMessage: '在此输入您的 API Key',
      }),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.CA39ED39',
        defaultMessage: '基础模型',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.5051CD20',
        defaultMessage: '请选择',
      }),
    },
  ],

  [EVendorType.OPEN_AI]: [
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.4F30D9AE',
        defaultMessage: '模型名称',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.8757DB24',
        defaultMessage: '输入模型名称',
      }),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.84D80E03',
        defaultMessage: '模型显示名称',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.3F1D2C5E',
        defaultMessage: '模型在界面的显示名称',
      }),
    },
    {
      label: 'API Key',
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.8A8962A4',
        defaultMessage: '在此输入您的 API Key',
      }),
    },
    { label: 'API endpoint URL', placeholder: 'Base URL, e.g. https://api.openai.com/v1' },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.893EFC85',
        defaultMessage: 'API endpoint中的模型名称',
      }),
      placeholder: 'endpoint model name, e.g. chatgpt4.0',
    },
  ],

  [EVendorType.DOUBAO]: [
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.DE939F1B',
        defaultMessage: '模型名称',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.6639EA1C',
        defaultMessage: '输入模型名称',
      }),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.B6B07D7D',
        defaultMessage: '鉴权方式',
      }),
      placeholder: 'API Key',
    },
    {
      label: 'API Key',
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.DEE25258',
        defaultMessage: '输入您的 API Key',
      }),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.502651A0',
        defaultMessage: '火山引擎地域',
      }),
      placeholder: 'cn-beijing',
    },
    { label: 'API Endpoint Host', placeholder: 'https://ark.cn-beijing.volces.com/api/v3' },
    {
      label: 'Endpoint ID',
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.FB5CCD46',
        defaultMessage: '输入您的 Endpoint ID',
      }),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.1000E15A',
        defaultMessage: '基础模型',
      }),
      placeholder: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.D4043185',
        defaultMessage: '请选择',
      }),
    },
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
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.118F23DF',
        defaultMessage: '模型类型',
      }),
      name: 'modelType',
      initialValue: 'LLM',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.F3174DDF',
            defaultMessage: '请输入类型',
          }),
        },
      ],
      component: <Radio.Group options={radioOptions} />,
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.E9318E17',
        defaultMessage: '模型名称',
      }),
      name: 'modelName',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.53BD42DC',
            defaultMessage: '请输入名称',
          }),
        },
      ],
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.818F380E',
            defaultMessage: '请输入模型名称',
          })}
        />
      ),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.393F4DC9',
        defaultMessage: '访问地址',
      }),
      name: 'visitUrl',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.001485F1',
            defaultMessage: '请输入访问地址',
          }),
        },
      ],
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.04A7CF33',
            defaultMessage: '请输入访问地址',
          })}
        />
      ),
    },
    {
      label: 'API Key',
      name: 'apiKey',
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.40261F5D',
            defaultMessage: '请输入',
          })}
        />
      ),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.879A1F1E',
        defaultMessage: '上下文长度',
      }),
      name: 'contextLength',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.44C3525A',
            defaultMessage: '请输入上下文长度',
          }),
        },
      ],
      component: <Input />,
    },
  ],

  [EVendorType.TONGYI]: [
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.7D50A825',
        defaultMessage: '模型类型',
      }),
      name: 'modelType',
      initialValue: 'LLM',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.47F8657C',
            defaultMessage: '请输入类型',
          }),
        },
      ],
      component: <Radio.Group options={radioOptions} />,
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.FEF4B94F',
        defaultMessage: '模型名称',
      }),
      name: 'modelName',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.322E46C2',
            defaultMessage: '请输入名称',
          }),
        },
      ],
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.105E3F7F',
            defaultMessage: '请输入模型名称',
          })}
        />
      ),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.C5CD2C96',
        defaultMessage: '访问地址',
      }),
      name: 'visitUrl',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.FA09A6BE',
            defaultMessage: '请输入访问地址',
          }),
        },
      ],
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.26CF3729',
            defaultMessage: '请输入访问地址',
          })}
        />
      ),
    },
    {
      label: 'API Key',
      name: 'apiKey',
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.AAB0E73A',
            defaultMessage: '请输入',
          })}
        />
      ),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.2DC2C52A',
        defaultMessage: '上下文长度',
      }),
      name: 'contextLength',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.6F5B2640',
            defaultMessage: '请输入上下文长度',
          }),
        },
      ],
      component: <Input />,
    },
  ],

  [EVendorType.OPEN_AI]: [
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.0A4A6474',
        defaultMessage: '模型类型',
      }),
      name: 'modelType',
      initialValue: 'LLM',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.867DE58B',
            defaultMessage: '请输入类型',
          }),
        },
      ],
      component: <Radio.Group options={radioOptions} />,
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.F3222298',
        defaultMessage: '模型名称',
      }),
      name: 'modelName',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.3E654A87',
            defaultMessage: '请输入名称',
          }),
        },
      ],
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.70E43DB4',
            defaultMessage: '请输入模型名称',
          })}
        />
      ),
    },
    {
      label: 'API Key',
      name: 'apiKey',
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.3E24C481',
            defaultMessage: '请输入',
          })}
        />
      ),
    },
    {
      label: 'API endpoint URL',
      name: 'endpointUrl',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.F225349E',
            defaultMessage: '请输入 API endpoint URL',
          }),
        },
      ],
      placeholder: <Input placeholder="Base URL, e.g. https://api.openai.com/v1" />,
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.E5B349C2',
        defaultMessage: 'API endpoint中的模型名称',
      }),
      component: <Input placeholder="endpoint model name, e.g. chatgpt4.0" />,
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.DE803616',
        defaultMessage: '上下文长度',
      }),
      name: 'contextLength',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.EBF31DE2',
            defaultMessage: '请输入上下文长度',
          }),
        },
      ],
      component: <Input />,
    },
  ],

  [EVendorType.DOUBAO]: [
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.0D4FBF35',
        defaultMessage: '模型类型',
      }),
      name: 'modelType',
      initialValue: 'LLM',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.1F058B21',
            defaultMessage: '请输入类型',
          }),
        },
      ],
      component: <Radio.Group options={radioOptions} />,
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.29D80246',
        defaultMessage: '模型名称',
      }),
      name: 'modelName',
      rules: [
        {
          required: true,
          message: formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.FC1F4162',
            defaultMessage: '请输入名称',
          }),
        },
      ],
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.A1CD0E5A',
            defaultMessage: '请输入模型名称',
          })}
        />
      ),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.71491E27',
        defaultMessage: '鉴权方式',
      }),
      name: 'auth',
      component: <Input placeholder="API Key" />,
    },
    {
      label: 'API Key',
      name: 'apiKey',
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.D49672B2',
            defaultMessage: '请输入',
          })}
        />
      ),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.B20BCA6A',
        defaultMessage: '火山引擎地域',
      }),
      name: 'engine',
      component: <Input placeholder="cn-beijing" />,
    },
    {
      label: 'API Endpoint Host',
      name: 'host',
      component: <Input placeholder="https://ark.cn-beijing.volces.com/api/v3" />,
    },
    {
      label: 'Endpoint ID',
      name: 'endpointId',
      component: (
        <Input
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.DE6664BF',
            defaultMessage: '输入您的 Endpoint ID',
          })}
        />
      ),
    },
    {
      label: formatMessage({
        id: 'src.page.ExternalIntegration.LargeModel.constant.9D7B7FB0',
        defaultMessage: '基础模型',
      }),
      name: 'model',
      component: (
        <Select
          placeholder={formatMessage({
            id: 'src.page.ExternalIntegration.LargeModel.constant.BC6ABB3E',
            defaultMessage: '请选择',
          })}
        />
      ),
    },
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
  CONFIGURE_API_KEY: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.DC86B5E9',
    defaultMessage: '配置 API KEY',
  }),
  MODIFY_API_KEY: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.67ECD80F',
    defaultMessage: '修改 API KEY',
  }),

  // 提示信息
  NO_MODELS: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.4940629C',
    defaultMessage: '暂无模型',
  }),
  CONFIGURE_API_KEY_FIRST: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.FD72F318',
    defaultMessage: '请先配置 API Key 获取模型',
  }),
  MODELS_COUNT: (count: number) =>
    formatMessage(
      {
        id: 'src.page.ExternalIntegration.LargeModel.constant.2502F7AD',
        defaultMessage: '{count} 个模型',
      },
      { count },
    ),

  // 模态框标题
  EDIT_MODEL_TITLE: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.6CBCB022',
    defaultMessage: '编辑模型',
  }),
  ADD_MODEL_TITLE: formatMessage({
    id: 'src.page.ExternalIntegration.LargeModel.constant.F18E5C37',
    defaultMessage: '添加模型',
  }),
} as const;

export { EModelSatus };
