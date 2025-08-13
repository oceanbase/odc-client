import { SchemaChangeRecordStatus } from '@/d.ts/logicalDatabase';
import { formatMessage } from '@/util/intl';
import React from 'react';

const TaskProgressHeader: React.FC<{
  subTasks: any[];
  pendingExectionDatabases: number;
  isLogicalDb?: boolean;
}> = ({ subTasks, pendingExectionDatabases, isLogicalDb }) => {
  if (isLogicalDb) {
    let executeCount = 0;
    let successCount = 0;
    let failedCount = 0;
    subTasks?.forEach((i) => {
      if (i?.status === SchemaChangeRecordStatus.RUNNING) {
        executeCount++;
      }
      if (i?.status === SchemaChangeRecordStatus.SUCCESS) {
        successCount++;
      }
      if (i?.status === SchemaChangeRecordStatus.FAILED) {
        failedCount++;
      }
    });
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
