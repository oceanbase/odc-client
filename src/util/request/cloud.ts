import { formatMessage } from '@/util/intl';
import { isArray, isEmpty, isNil, isObject } from 'lodash';
import { stringify } from 'qs';
import { getLocale } from 'umi';
import { uploadFileToOSS } from '../aliyun';
import logger from '../logger';
import notification from '../notification';
import { generateUniqKey, safeParseJson } from '../utils';
import { resolveODCError } from './errorResolve';

type IHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const ERROR_MESSAGE_MAP = {
  EXECUTE_DDL_FAILED: formatMessage({ id: 'request.execute.ddl.error' }),
  CONNECTION_EXPIRED: formatMessage({ id: 'request.connection.expired' }),
  CONNECTION_KILLED: formatMessage({ id: 'request.connection.killed' }),
  SERVICE_UNAVAILABLE: formatMessage({
    id: 'odc.src.util.openapi.TheSystemIsBusyPlease',
  }),
};

/**
 * 懒加载，防止非公有云环境报配置错误
 */
let _createService = null;
// let axiosRequest = null;
async function getCreateService() {
  if (_createService) {
    return _createService;
  }
  _createService = window._odc_params.createService;
  // axiosRequest = window._odc_params.axiosRequest;
  return _createService;
}

export function resolveUrlAndParams(url: string, method: IHttpMethod, params: Record<string, any>) {
  const [realUrl, query] = url.split('?');
  params = Object.assign(
    {
      lang: getLocale(),
    },
    params,
  );
  const jsonStringifiedParams = {};
  Object.entries(params).forEach(([key, value]) => {
    let jsonStringifiedValue = value;
    if (isObject(value) && !isArray(value)) {
      jsonStringifiedValue = JSON.stringify(value);
    }
    jsonStringifiedParams[key] = jsonStringifiedValue;
  });
  return (
    realUrl +
    (!isEmpty(jsonStringifiedParams) || query
      ? `?${[
          stringify(jsonStringifiedParams, {
            arrayFormat: 'repeat',
            strictNullHandling: true,
          }),
          query,
        ]
          .filter(Boolean)
          .join('&')}`
      : '')
  );
}

function getRealODCRequestBody(method: IHttpMethod, params?: Record<string, any>) {
  return method === 'get' && !isNil(params) ? null : JSON.stringify(params);
}

const httpMethodToActionMap = {
  get: 'DescribeGetOdcHttp',
  post: 'DescribePostOdcHttp',
  put: 'DescribePutOdcHttp',
  patch: 'DescribePatchOdcHttp',
  delete: 'DescribeDeleteOdcHttp',
};

function resolveCloudError(result) {
  /**
   * 公有云 POP 网关 服务不可用格式适配
   * 谈层：弹出果系统繁忙中不可用提示
   */
  const code = result?.code;
  if (code === '200') {
    return null;
  }
  let msg;
  if (code) {
    /**
     * 公有云 POP 网关请求过期适配，适配到 ConnectionExpired 状态
     * aone/issue/31419666
     */
    switch (result.code) {
      case 'PostonlyOrTokenError':
      case 'ConsoleNeedLogin': {
        window._forceRefresh = true;
        notification.error({
          track: result.message,
          requestId: result.requestId,
        });
        window.location.reload();
        return {
          data: null,
          errMsg: result.message,
          errCode: 'ConnectionExpired',
          isError: true,
        };
      }
    }
    msg = window._odc_params.getLocaleErrorMessageByCode?.(code);
  }
  msg = msg || result?.message || `[${result?.code}]${ERROR_MESSAGE_MAP.SERVICE_UNAVAILABLE}`;
  notification.error({
    track: msg,
    supportRepeat: false,
    requestId: result.requestId,
  });
  return {
    data: null,
    errMsg: msg,
    errCode: result?.code,
    isError: true,
  };
}

const MAX_DATA_SIZE = (1024 * 400) / 2;

interface IOSSData {
  bucketName: string;
  objectName: string;
  region: string;
  tempAccessCredential: {
    expiration: string;
    accessKeyId: string;
    accessKeySecret: string;
    token: string;
  };
}

async function openAPIRequest(
  url: string,
  method: IHttpMethod,
  params: {
    data?: Record<string, any>;

    params?: Record<string, any>;
  } = {},
  requestParams: Partial<{ ignoreError: boolean; wantCatchError: boolean }> = {
    ignoreError: params.params?.ignoreError || false,
    wantCatchError: params.params?.wantCatchError || false,
  },
) {
  if (!window._odc_params) {
    notification.error({
      track: formatMessage({ id: 'odc.util.request.cloud.TheParamsParameterOfThe' }), // 主应用 Params 参数未传入
    });
    return null;
  }

  const { instanceId, tenantId, sourceVpcId, targetVpcId, regionId } = window._odc_params;
  const ODCUrl = resolveUrlAndParams(url, method, params?.params);
  const cloudServiceParams = {
    RealRequestBody: getRealODCRequestBody(method, params?.data),
    RealHttpUri: ODCUrl,
    RealHttpMethod: method.toUpperCase(),
    InstanceId: '*',
    RegionId: regionId,
    TenantId: '*',
    SourceVpcId: sourceVpcId,
    TargetVpcId: targetVpcId,
    OssObject: null,
  };

  const dataString = JSON.stringify(params.data);
  if (dataString?.length > MAX_DATA_SIZE) {
    logger.log(`OSS Request: (${method})${url}`);
    /**
     * 超限请求，需要上传OSS做拦截
     */
    const fileName = generateUniqKey();
    const file = new File([dataString], fileName);
    const result = await uploadFileToOSS(file, null, null);
    if (!result) {
      logger.error('Upload Request Body Failed: ', url);
      return null;
    }
    cloudServiceParams.RealHttpUri = resolveUrlAndParams(
      url,
      method,
      Object.assign({}, params?.params, { OssObject: result }),
    );
    cloudServiceParams.RealRequestBody = '{}';
  }

  const createService = await getCreateService();
  let action = httpMethodToActionMap[method];
  let result;
  try {
    // let responseHeaders;
    const requestCloud = createService('OceanBasePro', action, {
      // ignoreError: true,
      rawResponseData: true,
      headers: {
        'Accept-Language': getLocale(),
      },
      // transformResponse: axiosRequest.defaults.transformResponse.concat(function (
      //   data,
      //   _responseHeaders,
      // ) {
      //   responseHeaders = _responseHeaders;
      //   return data;
      // }),
    });
    result = await requestCloud(cloudServiceParams);
    if (result?.data?.ErrorCode === 'OssObject' && result?.data?.Data) {
      result.data.ErrorCode = null;
      logger.debug(`OSS Response: (${method})${url}`);
      /**
       * 返回内容超限，需要去 OSS 拿数据
       */
      const OSSUrl: string = result?.data?.Data;
      if (!OSSUrl) {
        logger.error('Parse OSSData Failed: ', url);
        /**
         * 解析失败的话，设为空代表错误。
         */
        result.data.Data = null;
      } else {
        const fileData = await (await fetch(OSSUrl)).text();
        result.data.Data = fileData;
      }
    }
  } catch (e) {
    logger.error('Xconsole API Error:', e);
    const data = e.response?.data;
    if (data) {
      result = data;
    }
  }
  /**
   * 公有云错误码处理
   */
  if (!result) {
    return null;
  }
  const cloudRes = resolveCloudError(result);
  if (cloudRes) {
    printAPILog(action, ODCUrl, cloudServiceParams, result?.data?.Data);
    return cloudRes;
  }

  const odcRes = safeParseJson(result?.data?.Data);
  if (!odcRes) {
    printAPILog(action, ODCUrl, cloudServiceParams, result?.data?.Data);
    /**
     * 无法解析或者获取到 ODC 的接口内容
     */
    notification.error({
      track: formatMessage({ id: 'odc.util.request.cloud.SystemErrorOdcresIsEmpty' }), // 系统错误(odcRes 为空)
      supportRepeat: false,
    });
    return null;
  }
  printAPILog(action, ODCUrl, cloudServiceParams, odcRes);

  if (odcRes.error) {
    odcRes.errCode = odcRes.error.code || odcRes.errCode;
    odcRes.errMsg = odcRes.error.message || odcRes.errMsg;
  }
  odcRes.isError = odcRes.errCode || odcRes.errMsg;

  const isThrowError = resolveODCError(odcRes, ODCUrl, requestParams, params?.data);
  if (isThrowError) {
    return null;
  }

  return odcRes;
}

function printAPILog(action, api, req, res) {
  if (location.hostname === 'oceanbasenext.console.aliyun.com') {
    return;
  }
  logger.warn(`[${Date()}]\n[openAPI][${action}] ${api}: `);
  logger.log(` - req: `, req);
  logger.log(` - res: `, res);
  logger.log(' ');
}

export default {
  get(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return openAPIRequest(url, 'get', data, params);
  },
  post(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return openAPIRequest(url, 'post', data, params);
  },
  put(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return openAPIRequest(url, 'put', data, params);
  },
  patch(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return openAPIRequest(url, 'patch', data, params);
  },
  delete(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return openAPIRequest(url, 'delete', data, params);
  },
};
