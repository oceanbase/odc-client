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
