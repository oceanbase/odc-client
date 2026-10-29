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

import { ConnectType } from '@/d.ts';
import defaultConfig from './defaultConfig';
import type { InternalAxiosRequestConfig } from 'axios';
import { IDataSourceModeConfig } from '@/common/datasource/interface';
interface IODCErrorHandle {
  (
    errCode: string,
    errMsg: string,
    url: string,
    params,
    data,
    requestId?: string | number,
  ): boolean;
}

interface IRequestParamsResolver {
  (options: InternalAxiosRequestConfig, requestId): Record<string, any>;
}

interface IResponseJsonResolver {
  (response: Response, json: Record<string, any>): void;
}

interface IDataSourceSupport {
  (type: ConnectType, config: IDataSourceModeConfig): boolean;
}

export class ODC {
  public ODCErrorHandle: Set<IODCErrorHandle> = new Set();

  public ODCRequest: {
    get(url: string, data?: Record<string, any>, params?: Record<string, any>): Promise<any>;
    post(url: string, data?: Record<string, any>, params?: Record<string, any>): Promise<any>;
    put(url: string, data?: Record<string, any>, params?: Record<string, any>): Promise<any>;
    patch(url: string, data?: Record<string, any>, params?: Record<string, any>): Promise<any>;
    delete(url: string, data?: Record<string, any>, params?: Record<string, any>): Promise<any>;
  } = null;

  public requestParamsResolver: IRequestParamsResolver;

  public responseJsonResolver: IResponseJsonResolver;

  public datasourceSupport: IDataSourceSupport;

  public addErrorHandle(handle: IODCErrorHandle) {
    this.ODCErrorHandle.add(handle);
  }

  public setRequestParamsResolver(handle: IRequestParamsResolver) {
    this.requestParamsResolver = handle;
  }

  public setResponseJsonResolve(handle: IResponseJsonResolver) {
    this.responseJsonResolver = handle;
  }
  public setDataSourceSupport(handle: IDataSourceSupport) {
    this.datasourceSupport = handle;
  }
  public appConfig: Partial<typeof defaultConfig> = defaultConfig;
}

export default new ODC();
