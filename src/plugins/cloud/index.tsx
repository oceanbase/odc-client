import { ODCErrorsCode } from '@/d.ts';
import cloud from '@/util/request/cloud';
import { ODC } from '../odc';

export function isOBCloud(): boolean {
  return window.currentEnv === 'obcloud';
}

function isCloudWeb(): boolean {
  return ENV_target === 'web' && ENV_environment === 'cloud';
}

export function apply(ODC: ODC) {
  isOBCloud() &&
    ODC.setRequestParamsResolver((opts, rid) => {
      return {
        Action: (opts.params as any)?.notLogin ? 'UnauthorizedOdcHttp' : 'OdcHttp',
        version: 'v2',
        rid,
      };
    });

  isOBCloud() &&
    ODC.setResponseJsonResolve((response, json) => {
      if (response?.status === 401) {
        /**
         * 多云登录失效处理逻辑
         */
        json.errCode = ODCErrorsCode.LoginExpired;
        json.errMsg = json.message;
      }
    });
  isCloudWeb() && (ODC.ODCRequest = cloud);
}
