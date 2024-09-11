import { ISqlExecuteResultStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export const SqlExecuteResultStatusLabel = {
  [ISqlExecuteResultStatus.CREATED]: formatMessage({
    id: 'src.page.Workspace.components.SQLResultSet.6F910473',
    defaultMessage: '待执行',
  }),
  [ISqlExecuteResultStatus.SUCCESS]: formatMessage({
    id: 'odc.components.SQLResultSet.SuccessfulExecution',
    defaultMessage: '执行成功',
  }),

  [ISqlExecuteResultStatus.FAILED]: formatMessage({
    id: 'odc.components.SQLResultSet.ExecutionFailed',
    defaultMessage: '执行失败',
  }),

  [ISqlExecuteResultStatus.CANCELED]: formatMessage({
    id: 'odc.components.SQLResultSet.CancelExecution',
    defaultMessage: '执行取消',
  }),
  [ISqlExecuteResultStatus.RUNNING]: '执行中',
};
