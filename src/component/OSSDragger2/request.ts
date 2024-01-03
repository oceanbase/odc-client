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

import login from '@/store/login';
import type { IProgressEvent, IRequestError, IRequestOption } from './interface';

function getError(option: IRequestOption, xhr: XMLHttpRequest) {
  const msg = `error: ${option.method} ${option.action} ${xhr.status}'`;
  const err = new Error(msg) as IRequestError;
  err.status = xhr.status;
  err.method = option.method;
  err.url = option.action;
  return err;
}

function getBody(xhr: XMLHttpRequest) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export function request(option: IRequestOption) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const headers = option.headers || {};
    headers['currentOrganizationId'] = login.organizationId?.toString();

    if (option.data) {
      Object.keys(option.data).forEach((key) => {
        const value = option.data[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
          return;
        }
        formData.append(key, value as string | Blob);
      });
    }

    if (option.file instanceof Blob) {
      formData.append(option.filename, option.file, (option.file as any).name);
    } else {
      // @ts-ignore
      formData.append(option.filename, option.file);
    }

    if (option.onProgress && xhr.upload) {
      xhr.upload.onprogress = function progress(e: IProgressEvent) {
        if (e.total > 0) {
          e.percent = (e.loaded / e.total) * 100;
        }
        option.onProgress(e);
      };
    }
    xhr.onerror = function error(e) {
      reject(e);
      option.onError(e);
    };

    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(getError(option, xhr));
        return option.onError(getError(option, xhr), getBody(xhr));
      }
      resolve(getBody(xhr));
      return option.onSuccess(getBody(xhr), xhr);
    };

    xhr.open(option.method, option.action, true);

    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }
    if (headers['X-Requested-With'] !== null) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }

    Object.keys(headers).forEach((h) => {
      if (headers[h] !== null) {
        xhr.setRequestHeader(h, headers[h]);
      }
    });

    xhr.send(formData);
  });
}
