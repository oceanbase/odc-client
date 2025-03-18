/**
 * request 网络请求工具
 * axios文档：https://www.axios-http.cn
 */
import axios from 'axios';
import odc from '@/plugins/odc';
import login from '@/store/login';
import Cookies from 'js-cookie';
import { getLocale } from '@umijs/max';
import download from './download';
import { formatMessage } from '@/util/intl';
import { resolveODCError } from './errorResolve';
import notification from '../notification';
import type { AxiosInstance, AxiosHeaders } from 'axios';
import { cloneDeep } from 'lodash';
import qs from 'qs';

//  https://www.axios-http.cn/docs/req_config
const service: AxiosInstance = axios.create({
  baseURL: window.ODCApiHost || '',
  timeout: 1000 * 60 * 60 * 10, // 后端去除了queryTimeout，前端默认给一个超大的时间
  withCredentials: true,
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: 'repeat' });
  },
});

// 错误处理器
const errorHandler = (error) => {
  const { config, response } = error;
  let { message: msg, data } = response || {};
  msg = data?.message || msg;
  const errCode = data?.code || 'NetError';
  if (error?.code === 'ECONNABORTED') {
    // TODO：处理超时错误
    // @see aone/issue/22417174
    msg =
      msg || formatMessage({ id: 'request.execute.ddl.timeout', defaultMessage: '执行 DDL 超时' });
  } else if (!config?.params?.ignoreError) {
    notification.error({
      track: msg,
      supportRepeat: false,
      holdErrorTip: (config?.params as any)?.holdErrorTip,
      requestId: data?.requestId,
    });
  }
  return {
    errCode,
    errMsg: msg,
    isError: true,
    data: null,
  };
};

// @ts-ignore
service.interceptors.request.use((config) => {
  const requestId =
    Math.random().toString(36).substring(2).toUpperCase() +
    Math.random().toString(36).substring(2).toUpperCase();
  const extraParams = odc.requestParamsResolver?.(config, requestId) || {};
  if ((config.params as any)?.download) {
    config.responseType = 'blob';
  }
  return {
    ...config,
    params: {
      currentOrganizationId: login?.organizationId,
      ...extraParams,
      ...config?.params,
    },
    headers: {
      ...(config?.headers || {}),
      'X-XSRF-TOKEN': Cookies?.get('XSRF-TOKEN') || '',
      'Accept-Language': getLocale(),
      'X-Request-ID': requestId,
    },
  };
});

// 响应拦截器
service.interceptors.response.use(
  async (response) => {
    const { status, config, data: originalData } = response;
    const { params } = config || {};
    try {
      if ((params as any)?.download) {
        const downloadResponse = new Response(originalData, {
          status: response?.status,
          statusText: response?.statusText,
          // @ts-ignore
          headers: (response?.headers as AxiosHeaders)?.toJSON(),
        });
        await download(downloadResponse, (params as any)?.originalHref);
        return;
      }
    } catch (e) {
      console.error(e);
      response.data = {};
    }
    let json;
    let text = '';
    try {
      json = cloneDeep(originalData);
      text = JSON.stringify(originalData) || '';
    } catch (e) {
      const requestId = json?.requestId || undefined;
      json = {
        errCode: 'FORMAT_ERROR',
        errMsg: formatMessage({
          id: 'odc.util.request.private.AnErrorOccurredWhileParsing',
          defaultMessage: '解析结果出错，请检查部署配置',
        }),
        data: null,
        requestId,
        extraMessage: {
          isComponent: true,
          extraMessageParams: {
            requestUrl: response?.config.url,
            responseStatusCode: status,
            responseContentType: response?.headers['content-type'],
            reponseBody: text?.slice(0, 200),
          },
        },
      };
    }
    odc?.responseJsonResolver?.(
      new Response(JSON.stringify(originalData), {
        status: response?.status,
        statusText: response?.statusText,
        // @ts-ignore
        headers: (response?.headers as AxiosHeaders)?.toJSON(),
      }),
      json,
    );
    return response?.data;
  },
  (error) => {
    const { response, config, request } = error || {};
    const { data } = response || {};
    const { params } = config || {};
    const { responseURL: url } = request || {};
    const json = cloneDeep(data);

    if (json?.error) {
      json.errCode = json?.error?.code || json?.errCode;
      json.errMsg = json?.error?.message || json?.errMsg;
    }
    if (json instanceof Object) {
      json.isError = !!json?.errCode || !!json?.errMsg;
    }
    const isThrowError = resolveODCError(json, url, params, data);
    if (isThrowError) {
      return null;
    }
    const result = errorHandler(error);
    return result;
  },
);

export default service;
