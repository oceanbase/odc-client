import showErrorConfirmModal from '@/component/ErrorConfirmModal';
import showSysAccountConfigModal from '@/component/SysAccountConfigModal';
import { ODCErrorsCode } from '@/d.ts';
import odc from '@/plugins/odc';
import loginStore from '@/store/login';
import { message } from 'antd';
import { history } from '@umijs/max';
import { formatMessage } from '../intl';
import notification from '../notification';

const errorMsgMap = {
  EXECUTE_DDL_FAILED: formatMessage({ id: 'request.execute.ddl.error' }),
  ConnectionExpired: formatMessage({ id: 'request.connection.expired' }),
  ConnectionKilled: formatMessage({ id: 'request.connection.killed' }),
};

/**
 * return: 是否抛出错误
 */
export function resolveODCError(
  res: {
    errCode: string;
    errMsg: string;
    requestId: string | number;
    extraMessage?: {
      isComponent?: boolean;
      extraMessageParams?: {
        [key in string]: string;
      };
    };
  },
  url: string,
  params: any,
  data: any,
): boolean {
  let errCode = null;
  let errMsg = '';
  let requestId;
  errCode = res.errCode;
  errMsg = res.errMsg;
  requestId = res.requestId;
  switch (errCode) {
    case ODCErrorsCode.LoginExpired: {
      if (url?.indexOf('/login') > -1 || url?.endsWith('/me/organizations')) {
        /**
         * 1. 登录接口出现这个异常的话，需要直接抛出去。
         * 2. 处理的场景：在未登录或登录超时的时候，访问/路由，会首先经过AppContainer（此时会调用/me接口，错误码LoginExpired，则会弹窗提示'登录超时'）,然后会进入/login登录页（详见：config配置）
         *    此时会造成登录页面展示'登录超时'的弹窗。这里设置/me接口在登录超时场景下，不进行弹窗展示，可以规避这个问题（和 @山露 已确认，所有处于登录保护下的接口，在未登录或登录超时的场景，均会返回LoginExpired，
         *    所以，这个跳过/me接口提示，更符合交互体验，也没有遗漏掉需要提示的场景）
         */
        return false;
      }
      /**
       * 在登录页面，不特殊处理
       */
      if (location.hash.endsWith('login')) {
        return true;
      } else if (location.hash.indexOf('gateway/') > -1 || url?.indexOf('/lab/status') > -1) {
        /**
         * gateway 不出现弹窗
         */
        loginStore.gotoLoginPage();
        return true;
      }
      showErrorConfirmModal(errCode, errMsg);
      return true;
    }
    case ODCErrorsCode.UnauthorizedSessionAccess: {
      window._forceRefresh = true;
      history.replace('/project');
      window._forceRefresh = false;
      return true;
    }
    case ODCErrorsCode.ConnectionExpired:
    case ODCErrorsCode.ConnectionKilled: {
      message.error('Connection closed');
      return true;
    }
    case ODCErrorsCode.SysTenantAccountNotSet: {
      showSysAccountConfigModal();
      return true;
    }
    case ODCErrorsCode.SysTenantAccountInvalid: {
      showSysAccountConfigModal(true);
      return true;
    }
    case ODCErrorsCode.PermissionChanged: {
      showErrorConfirmModal(errCode, errMsg);
      return true;
    }
  }
  /**
   * plugin 部分
   */
  for (const func of odc.ODCErrorHandle) {
    const throwError = func(errCode, errMsg, url, params, data, requestId);
    if (throwError) {
      return true;
    }
  }
  const isError = errCode || errMsg;
  if (isError) {
    let hasShow = false;
    if (!params.ignoreError) {
      hasShow = true;
      notification.error({
        track:
          errMsg || errorMsgMap[errCode] || formatMessage({ id: 'request.execute.ddl.default' }),
        supportRepeat: true,
        holdErrorTip: params.holdErrorTip,
        requestId,
        extraMessage: res?.extraMessage,
      });
      if (!hasShow && params.wantCatchError) {
        throw new Error(errMsg);
      }
    }
  }
  return false;
}
