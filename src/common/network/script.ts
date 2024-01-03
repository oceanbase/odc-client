/*
 * Copyright 2024 OceanBase
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

import { IScript, IScriptMeta } from '@/d.ts';
import setting from '@/store/setting';
import { uploadFileToOSS } from '@/util/aliyun';
import { formatMessage } from '@/util/intl';
import request from '@/util/request';
import { downloadFile } from '@/util/utils';
import { message } from 'antd';
import { isArray } from 'lodash';

type ObjectId = string | number;
type ScriptId = string | number;

/**
 * 获取保存的脚本列表
 */
export async function getScriptList(): Promise<IScriptMeta[]> {
  const res = await request.get(`/api/v2/script/scripts`, {
    params: { pageable: false },
  });
  return res?.data?.contents ?? [];
}

/**
 * 获取脚本详情
 */
export async function getScript(scriptId: ScriptId): Promise<IScript> {
  const res = await request.get(`/api/v2/script/scripts/${scriptId}`);
  return res?.data;
}
/**
 * 新建脚本
 */
export async function newScript(
  files: File[],
  openApiName?: string,
): Promise<IScriptMeta[] | null> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('file', file, file.name);
  });
  if (setting.isUploadCloudStore) {
    const result = await uploadFileToOSS(files?.[0], openApiName, null);
    return result?.contents;
  }
  const result = await request.post(`/api/v2/script/scripts/batchUpload`, {
    body: formData,
  });

  return result?.data?.contents;
}

export async function downloadScript(scriptIds: ScriptId | ScriptId[]): Promise<void> {
  const MAX_DOWNLOAD_COUNT = 10;
  scriptIds = isArray(scriptIds) ? scriptIds : [scriptIds];
  if (scriptIds.length > MAX_DOWNLOAD_COUNT) {
    message.warn(
      formatMessage(
        {
          id: 'odc.common.network.script.YouCannotDownloadMoreThan',
        },
        { MAXDOWNLOADCOUNT: MAX_DOWNLOAD_COUNT },
      ), //`不能同时下载超过 ${MAX_DOWNLOAD_COUNT} 个文件`
    );
    return;
  }
  const res = await request.post(`/api/v2/script/scripts/batchGetDownloadUrl`, {
    data: scriptIds,
  });

  const urls = res?.data?.contents;
  if (urls?.length) {
    urls.forEach((url, i) => {
      setTimeout(() => {
        /**
         * 这里不加延迟的话，公有云微前端会出现只能下载一个的情况，大概率和pop的请求频率限制有关系
         */
        downloadFile(url);
      }, i * 400);
    });
  }
}

/**
 * 修改脚本
 */
export async function updateScript(
  scriptId: ScriptId,
  content: string,
  name: string,
): Promise<IScriptMeta | null> {
  const res = await request.put(`/api/v2/script/scripts/${scriptId}`, {
    data: {
      name,
      content,
    },
  });

  return res?.data?.scriptMeta;
}

/**
 * 删除脚本
 */
export async function deleteScript(scriptIds: ScriptId[]): Promise<boolean> {
  const res = await request.post(`/api/v2/script/scripts/batchDelete`, {
    data: scriptIds,
  });

  return !!res?.data?.contents;
}

export async function syncScript(id: ScriptId): Promise<boolean> {
  const res = await request.post(`/api/v2/script/scripts/${id}/sync`);
  return res?.successful;
}
