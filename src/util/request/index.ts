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

import odc from '@/plugins/odc';
import service from './service';

function getRequest() {
  return odc.ODCRequest || service;
}

export function getODCServerHost() {
  return window.ODCApiHost || '';
}

export default {
  get(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().get(url, data, params);
  },
  post(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().post(url, data, params);
  },
  put(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().put(url, data, params);
  },
  patch(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().patch(url, data, params);
  },
  delete(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().delete(url, data, params);
  },
};
