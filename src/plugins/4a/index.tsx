import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { message } from 'antd';
import { ODC } from '../odc';

enum I4AErrorCode {
  SqlInterceptBlocked = 'SqlInterceptBlocked',
  SqlInterceptApprovalRequired = 'SqlInterceptApprovalRequired',
  SqlInterceptExternalServiceError = 'SqlInterceptExternalServiceError',
}

export function apply(ODC: ODC) {
  ODC.addErrorHandle(function (errCode, errMsg, url, params, data, requestId) {
    switch (errCode) {
      case I4AErrorCode.SqlInterceptBlocked: {
        /**
         * 不允许执行
         */
        notification.error({
          track: errMsg || formatMessage({ id: 'odc.plugins.4a.CurrentSqlExecutionIsNot' }), //不允许执行当前 SQL
          requestId: requestId,
        });
        return true;
      }
      case I4AErrorCode.SqlInterceptApprovalRequired: {
        /**
         * 需要审批，sql默认从data.sql取，目前只有tableModify和execute
         */
        message.warning(
          errMsg || formatMessage({ id: 'odc.plugins.4a.TheCurrentSqlCannotBe' }), //当前 SQL 无法直接执行，请提交审批
        );
        return true;
      }
      case I4AErrorCode.SqlInterceptExternalServiceError: {
        /**
         * 4a 故障
         */
        notification.error({
          track:
            errMsg ||
            formatMessage({
              id: 'odc.plugins.4a.ApprovalSystemFailurePleaseTry',
            }), //审批系统故障，请稍后再试
          requestId: requestId,
        });
        return true;
      }
    }

    return false;
  });
  console.log('apply 4a plugin success');
}
