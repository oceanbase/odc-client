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
  [ISqlExecuteResultStatus.RUNNING]: formatMessage({
    id: 'src.page.Workspace.components.SQLResultSet.2B7B765F',
    defaultMessage: '执行中',
  }),
};
