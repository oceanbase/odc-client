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

import {
  IAIConfig,
  IAIConfigPayload,
  IModel,
  IModelProvider,
  IProviderCredential,
} from '@/d.ts/llm';
import request from '@/util/request';

/**
 * 获取AI配置
 */
export async function getAIConfig(): Promise<IAIConfig> {
  const result = await request.get('/api/v2/integration/ai/config');
  return result;
}

/**
 * 更新AI配置
 */
export async function updateAIConfig(data: IAIConfigPayload): Promise<IAIConfig> {
  const result = await request.post('/api/v2/integration/ai/config', {
    data,
  });
  return result;
}

/**
 * 获取所有模型供应商列表
 */
export async function getModelProviders(): Promise<IModelProvider[]> {
  const result = await request.get('/api/v2/integration/llm/providers');
  return result?.data?.contents;
}

/**
 * 获取指定供应商的模型列表
 */
export async function getProviderModels(provider: string): Promise<IModel[]> {
  const result = await request.get(`/api/v2/integration/llm/providers/${provider}/models`);
  return result?.data?.contents;
}

/**
 * 创建/配置模型供应商
 */
export async function postAPIKey(data: {
  provider: string;
  credential: Record<string, any>;
}): Promise<IModelProvider> {
  const result = await request.post('/api/v2/integration/llm/providers', {
    data,
  });
  return result?.data;
}

/**
 * 获取指定供应商的指定模型详情
 */
export async function getModelDetail(provider: string, modelName: string): Promise<IModel> {
  const result = await request.get(
    `/api/v2/integration/llm/providers/${provider}/models/${modelName}`,
  );
  return result?.data;
}

/**
 * 为指定供应商创建模型
 */
export async function createProviderModel(
  provider: string,
  data: {
    model: string;
    type: string;
    provider: string;
    credential: {
      dashscope_api_key: string;
    };
  },
): Promise<IModel> {
  const result = await request.post(`/api/v2/integration/llm/providers/${provider}/models`, {
    data,
  });
  return result?.data;
}

/**
 * 获取指定供应商的凭证信息
 */
export async function getProviderCredential(provider: string): Promise<IProviderCredential> {
  const result = await request.get(`/api/v2/integration/llm/providers/${provider}`);
  return result?.data;
}

/**
 * 删除指定供应商的模型
 */
export async function deleteProviderModel(
  provider: string,
  data: { model: string; type: string },
): Promise<void> {
  const result = await request.delete(`/api/v2/integration/llm/providers/${provider}/models`, {
    data,
  });
  return result?.data;
}

/**
 * 启用/禁用指定供应商的模型
 */
export async function toggleProviderModel(
  provider: string,
  data: {
    model: string;
    enabled: boolean;
  },
): Promise<void> {
  const { model } = data || {};
  const result = await request.post(
    `/api/v2/integration/llm/providers/${provider}/models/${model}/setEnabled`,
    {
      data,
    },
  );
  return result?.data;
}

/**
 * 设置指定供应商的描述/备注
 */
export async function updateProviderDescription(
  provider: string,
  data: {
    description: string;
  },
): Promise<void> {
  const result = await request.post(
    `/api/v2/integration/llm/providers/${provider}/setDescription`,
    {
      data,
    },
  );

  return result?.data;
}
