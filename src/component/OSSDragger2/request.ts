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
import axios from 'axios';

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
  const formData = new FormData();
  const headers = option.headers || {};
  headers['currentOrganizationId'] = login.organizationId?.toString();
  if (headers['X-Requested-With'] !== null) {
    headers['X-Requested-With'] = 'XMLHttpRequest';
  }
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

  const axiosConfig = {
    method: option.method,
    url: option.action,
    data: formData,
    headers,
    withCredentials: option.withCredentials,
    onUploadProgress: (progressEvent: IProgressEvent) => {
      if (option.onProgress) {
        progressEvent.percent = (progressEvent.loaded / progressEvent.total) * 100;
        option.onProgress(progressEvent);
      }
    },
  };
  return axios(axiosConfig)
    .then((response) => {
      const { request }: { request?: XMLHttpRequest } = response || {};
      option.onSuccess(response.data, request);
      return getBody(request);
    })
    .catch((error) => {
      const { request }: { request?: XMLHttpRequest } = error || {};
      option.onError(getError(option, request), getBody(request));
      throw getError(option, request);
    });
}
