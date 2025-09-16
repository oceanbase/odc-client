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

import request from '@/util/request';
import { generateDatabaseSid } from './pathUtil';
import { ICreateExternalResourceParams, IExternalResource } from '@/d.ts/externalResoruce';

/**
 * 获取外部资源列表
 */
export async function getExternalResourceList(
  dbName: string,
  sessionId: string,
): Promise<IExternalResource[]> {
  const sid = generateDatabaseSid(dbName, sessionId);
  const res = await request.get(
    `/api/v2/connect/sessions/sid:${sessionId}/databases/${dbName}/externalResources`,
  );

  return (
    res?.data?.contents?.map((resource: any) => ({
      id: resource.id || resource.name,
      name: resource.name,
      type: resource.type,
      url: resource.url || '',
      description: resource.comment || '',
      createTime: resource.createTime,
      modifyTime: resource.modifyTime,
      schemaName: resource.schemaName,
    })) || []
  );
}

/**
 * 加载外部资源详情
 */
export async function loadExternalResourceDetail(
  resourceName: string,
  dbName: string,
  sessionId: string,
): Promise<any> {
  const res = await request.get(
    `/api/v2/connect/sessions/sid:${sessionId}/databases/${dbName}/externalResources/${resourceName}`,
    {
      params: {
        schemaName: dbName,
        name: resourceName,
      },
    },
  );

  if (res?.data) {
    return {
      name: res.data.name,
      type: res.data.type,
      size: res.data.size,
      description: res.data.comment,
      comment: res.data.comment,
      createTime: res.data.createTime,
      updateTime: res.data.updateTime,
      owner: res.data.owner,
      status: res.data.status,
      content: res.data.context,
      schemaName: res.data.schemaName,
    };
  }

  return null;
}

/**
 * 下载外部资源
 */
export async function downloadExternalResourceFile(
  resourceName: string,
  dbName: string,
  sessionId: string,
): Promise<boolean> {
  try {
    await request.get(
      `/api/v2/connect/sessions/sid:${sessionId}/databases/${dbName}/externalResources/${resourceName}/download`,
      {
        params: {
          download: true,
        },
      },
    );
    return true;
  } catch (error) {
    console.error('下载外部资源失败:', error);
    return false;
  }
}

/**
 * 删除外部资源
 */
export async function removeExternalResource(
  resourceName: string,
  dbName: string,
  sessionId: string,
  type: string,
): Promise<boolean> {
  try {
    const res = await request.delete(
      `/api/v2/connect/sessions/sid:${sessionId}/databases/${dbName}/externalResources/${resourceName}`,
      {
        params: {
          type,
        },
      },
    );

    return res?.successful !== false;
  } catch (error) {
    console.error('删除外部资源失败:', error);
    return false;
  }
}

export async function createExternalResource({
  formData,
  sessionId,
  databaseName,
  resourceName,
}: ICreateExternalResourceParams) {
  const response = await request.post(
    `/api/v2/connect/sessions/sid:${sessionId}/databases/${databaseName}/externalResources/${resourceName}/upload`,
    {
      data: formData,
    },
  );
  if (!response.data) {
    throw new Error(response?.errMsg || '创建失败');
  }
}
