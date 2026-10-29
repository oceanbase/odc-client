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

import { SchemaChangeRecordStatus } from '@/d.ts/logicalDatabase';
import { formatMessage } from '@/util/intl';
import React from 'react';

const TaskProgressHeader: React.FC<{
  subTasks: any[];
  pendingExectionDatabases: number;
  isLogicalDb?: boolean;
}> = ({ subTasks, pendingExectionDatabases, isLogicalDb }) => {
  if (isLogicalDb) {
    const executeCount =
      subTasks?.find((i) => i?.status === SchemaChangeRecordStatus.RUNNING)?.length || 0;
    const successCount =
      subTasks?.find((i) => i?.status === SchemaChangeRecordStatus.SUCCESS)?.length || 0;
    const failedCount =
      subTasks?.find((i) => i?.status === SchemaChangeRecordStatus.FAILED)?.length || 0;
    return (
      <div>
        {formatMessage(
          {
            id: 'src.component.Task.component.CommonDetailModal.TaskProgress.4F56B34E',
            defaultMessage:
              '以下 {executeCount} 个数据库执行中， {successCount} 个数据库执行成功， {failedCount} 个数据库执行失败',
          },
          { executeCount, successCount, failedCount },
        )}
      </div>
    );
  }
  return (
    <div>
      {formatMessage(
        {
          id: 'src.component.Task.component.CommonDetailModal.E75BF608',
          defaultMessage: '共 ${subTasks?.length} 个数据库， ${pendingExectionDatabases} 个待执行',
        },
        {
          subTasksLength: subTasks?.length,
          pendingExectionDatabases: pendingExectionDatabases,
        },
      )}
    </div>
  );
};

export default TaskProgressHeader;
