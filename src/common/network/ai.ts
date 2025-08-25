/*
 * Copyright 2025 OceanBase
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

import request from '@/util/request';

/**
 * AI功能状态响应接口
 */
export interface IAIStatusResponse {
  /** AI功能是否启用 */
  enabled: boolean;
  /** AI功能是否可用 */
  available: boolean;
  /** 使用的AI模型 */
  model: string;
  /** API基础URL */
  baseUrl: string;
  /** API密钥是否已配置 */
  apiKeyConfigured: boolean;
}

/**
 * 查询AI功能状态
 * @returns AI功能状态信息
 */
export async function getAIStatus(): Promise<IAIStatusResponse> {
  const res = await request.get('/api/v2/ai/status');
  return res?.data;
}

/**
 * 检查AI功能是否可用
 * @returns 是否可用
 */
export async function isAIAvailable(): Promise<boolean> {
  try {
    const status = await getAIStatus();
    return status.enabled && status.available;
  } catch (error) {
    console.warn('Failed to check AI status:', error);
    return false;
  }
}
