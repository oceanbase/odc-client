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

import { ISystemConfig, ServerSystemInfo } from '@/d.ts';
import request from '@/util/request';

/**
 * 解密接口
 */
export async function decrypt(data: string): Promise<string> {
  const ret = await request.post(`/api/v2/bastion/encryption/decrypt`, {
    data: {
      data,
    },
  });
  return ret?.data;
}

/**
 * 获取 ODC 系统基本信息
 */

export async function getServerSystemInfo(): Promise<ServerSystemInfo> {
  const res = await request.get('/api/v1/info', { params: { notLogin: true } });
  return res?.data;
}

/**
 * 获取非对称加密的公钥
 */
export async function getPublicKey(): Promise<string> {
  const res = await request.get('/api/v2/encryption/publicKey', { params: { notLogin: true } });
  return res?.data;
}

/**
 * 获取ODC后端时间戳【UTC时间】
 */
export async function getDurationTimes(): Promise<{
  start: number;
  duration: number;
  utc: string;
}> {
  const clientNow = Date.now();
  const result = await request.get(`/api/v1/time`);
  return {
    start: clientNow,
    duration: Date.now() - clientNow,
    utc: result?.data,
  };
}

/**
 * 系统配置信息
 * 说明：目前仅考虑 odc.data.export.enabled 配置项，其余配置331版本不需要处理
 */

export async function getSystemConfig(): Promise<ISystemConfig> {
  const result = await request.get('/api/v2/config/system/configurations');
  const res = result?.data?.contents ?? [];
  return res.reduce((data, item) => {
    data[item.key] = item.value;
    return data;
  }, {});
}

export async function getTutorialList(): Promise<
  { id: string; name: string; overview: string; filename: string }[]
> {
  const res = await request.get(`/api/v2/lab/tutorials`);
  return res?.data?.contents;
}

export async function getTutorialById(id: string) {
  const res = await request.get(`/api/v2/lab/tutorials/${id}`);
  return res?.data;
}

export async function checkQueueStatus() {
  const res = await request.get(`/api/v2/lab/status`);
  return res?.data;
}

export const odcServerLoginUrl = '/api/v1/sso-login';

export const odcServerLogoutUrl = '/api/v1/sso-logout';

export const uploadSSLFileUrl = window.ODCApiHost + `/api/v2/objectstorage/ssl/files/batchUpload`;
