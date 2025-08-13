import React, { useEffect, useState, useMemo } from 'react';
import ExcecuteDetail from '@/component/Schedule/components/ExcecuteDetail';
import SqlplanExcecuteDetail from '@/component/Schedule/components/ExcecuteDetail/SqlplanExcecuteDetail';
import { scheduleTask, SubTaskType } from '@/d.ts/scheduleTask';

interface ScheduleResultProps {
  subTask: scheduleTask;
}

const ScheduleResult: React.FC<ScheduleResultProps> = (props) => {
  const { subTask } = props;

  if (
    [
      SubTaskType.DATA_ARCHIVE,
      SubTaskType.DATA_DELETE,
      SubTaskType.DATA_ARCHIVE_ROLLBACK,
      SubTaskType.DATA_ARCHIVE_DELETE,
    ].includes(subTask.type)
  ) {
    return <ExcecuteDetail subTask={subTask} />;
  }

  return <SqlplanExcecuteDetail subTask={subTask} />;
};

export default ScheduleResult;
