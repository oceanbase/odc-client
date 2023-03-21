import notification from '@/util/notification';
import { message } from 'antd';
import { RequestOptionsInit } from 'umi-request';

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
  (options: RequestOptionsInit, requestId): Record<string, any>;
}

interface IResponseJsonResolver {
  (response: Response, json: Record<string, any>): void;
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

  public utils = {
    notification,
    message,
  };

  public requestParamsResolver: IRequestParamsResolver;

  public responseJsonResolver: IResponseJsonResolver;

  public addErrorHandle(handle: IODCErrorHandle) {
    this.ODCErrorHandle.add(handle);
  }

  public setRequestParamsResolver(handle: IRequestParamsResolver) {
    this.requestParamsResolver = handle;
  }

  public setResponseJsonResolve(handle: IResponseJsonResolver) {
    this.responseJsonResolver = handle;
  }
}

export default new ODC();
