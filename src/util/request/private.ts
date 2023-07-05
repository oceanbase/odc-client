/**
 * request 网络请求工具
 * 更详细的api文档: umi-request
 */
import odc from '@/plugins/odc';
import { formatMessage } from '@/util/intl';
import Cookies from 'js-cookie';
import { getLocale } from 'umi';
import type { ResponseError } from 'umi-request';
import { extend } from 'umi-request';
import notification from '../notification';
import download from './download';
import { resolveODCError } from './errorResolve';

/**
 * 异常处理程序
 */
const errorHandler = (error: ResponseError) => {
  let { name, message: msg, request, data } = error;
  msg = data?.errMsg || msg;
  const errCode = data?.errCode || 'NetError';
  // 超时
  if (name === 'RequestError') {
    // TODO：处理超时错误
    // @see aone/issue/22417174
    msg = msg || formatMessage({ id: 'request.execute.ddl.timeout' });
  }
  if (!(request?.options?.params as any)?.ignoreError && name !== 'ResponseError') {
    notification.error({
      track: msg,
      supportRepeat: false,
      holdErrorTip: (request?.options?.params as any)?.holdErrorTip,
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

/**
 * 配置request请求时的默认参数
 * TODO：客户端需要改成运行时读取配置文件确定端口
 */
const request = extend({
  prefix: window.ODCApiHost || '',
  timeout: 1000 * 60 * 60 * 10, // 后端去除了queryTimeout，前端默认给一个超大的时间
  errorHandler,
  credentials: 'include', // 默认请求是否带上cookie
});

request.interceptors.request.use((url, options) => {
  const requestId =
    Math.random().toString(36).substring(2).toUpperCase() +
    Math.random().toString(36).substring(2).toUpperCase();
  const extraParams = odc.requestParamsResolver?.(options, requestId) || {};
  return {
    url,
    options: {
      ...options,
      params: {
        ...extraParams,
        ...options.params,
      },
      headers: {
        ...(options.headers || {}),
        'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
        'Accept-Language': getLocale(),
        'X-Request-ID': requestId,
      },
    },
  };
});

request.interceptors.response.use(async (response, req) => {
  const { status, url } = response;
  const { params, data } = req;

  const r = response.clone();

  try {
    if ((params as any).download) {
      await download(response, (params as any).originalHref);
      return;
    }
  } catch (e) {
    console.error(e);
    // TODO:
    // @ts-ignore
    response.data = {};
  }
  let json;
  let text = '';
  try {
    json = await r.json();
    text = (await response.clone().text()) || '';
  } catch (e) {
    const requestId = json?.requestId || undefined;
    json = {
      errCode: 'FORMAT_ERROR',
      errMsg: formatMessage({
        id: 'odc.util.request.private.AnErrorOccurredWhileParsing',
      }), // 解析结果出错，请检查部署配置
      data: null,
      requestId,
      extraMessage: {
        isComponent: true,
        extraMessageParams: {
          requestUrl: r.url,
          responseStatusCode: r.status,
          responseContentType: r.headers?.get('content-type'),
          reponseBody: text.slice(0, 200),
        },
      },
    };
  }
  odc.responseJsonResolver?.(response, json);
  if (json.error) {
    json.errCode = json.error.code || json.errCode;
    json.errMsg = json.error.message || json.errMsg;
  }
  json.isError = json.errCode || json.errMsg;
  response = new Response(JSON.stringify(json), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  const isThrowError = resolveODCError(json, url, params, data);
  if (isThrowError) {
    return null;
  }
  return response;
});

export default request;
