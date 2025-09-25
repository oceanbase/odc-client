import React, { useEffect, useState, useMemo } from 'react';
import ExcecuteDetail from '@/component/Schedule/components/ExcecuteDetail';
import SqlplanExcecuteDetail from '@/component/Schedule/components/ExcecuteDetail/SqlplanExcecuteDetail';
import {
  IDataArchiveParametersSubTaskParameters,
  IDataArchiveSubTaskExecutionDetails,
  IDataClearParametersSubTaskParameters,
  IDataDeleteSubTaskExecutionDetails,
  IScheduleTaskExecutionDetail,
  ISqlPlanParametersSubTaskParameters,
  ISqlPlanSubTaskExecutionDetails,
  scheduleTask,
  SubTaskParameters,
  SubTaskType,
} from '@/d.ts/scheduleTask';

interface ScheduleResultProps {
  subTask: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>;
}

const ScheduleResult: React.FC<ScheduleResultProps> = (props) => {
  const { subTask } = props;
  let result = null;
  switch (subTask?.type) {
    case SubTaskType.DATA_ARCHIVE:
    case SubTaskType.DATA_DELETE:
    case SubTaskType.DATA_ARCHIVE_ROLLBACK:
    case SubTaskType.DATA_ARCHIVE_DELETE: {
      result = (
        <ExcecuteDetail
          subTask={
            subTask as scheduleTask<
              IDataClearParametersSubTaskParameters | IDataArchiveParametersSubTaskParameters,
              IDataArchiveSubTaskExecutionDetails | IDataDeleteSubTaskExecutionDetails
            >
          }
        />
      );
      break;
    }
    case SubTaskType.SQL_PLAN:
    case SubTaskType.PARTITION_PLAN: {
      result = (
        <SqlplanExcecuteDetail
          subTask={
            subTask as scheduleTask<
              ISqlPlanParametersSubTaskParameters,
              ISqlPlanSubTaskExecutionDetails
            >
          }
        />
      );
      break;
    }
  }

  return result;
};

export default ScheduleResult;
