import { formatMessage } from '@/util/intl';
import React from 'react';
import { SchemaChangeRecordStatus, SqlExecuteStatus } from '@/d.ts/logicalDatabase';

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
      <div>{`以下 ${executeCount} 个数据库执行中， ${successCount} 个数据库执行成功， ${failedCount} 个数据库执行失败`}</div>
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
