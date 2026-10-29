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

import { getCronExecuteCycleByObject, translator } from '@/component/Crontab';
import { ICycleTaskTriggerConfig, TaskExecStrategy, TaskStatus } from '@/d.ts';
import { flowStatusSelectOptions, PrivateSpaceflowStatusSelectOptions } from '../Status';
import login from '@/store/login';

export const getCronCycle = (triggerConfig: ICycleTaskTriggerConfig) => {
  const { triggerStrategy, days, hours, cronExpression } = triggerConfig;
  return triggerStrategy !== TaskExecStrategy.CRON
    ? getCronExecuteCycleByObject(triggerStrategy as any, {
        hour: hours,
        dayOfWeek: days,
        dayOfMonth: days,
      })
    : translator.parse(cronExpression).toLocaleString();
};

export const getStatusFilters = (status: {
  [key: string]: {
    text: string | JSX.Element;
    desc?: React.ReactNode;
  };
}) => {
  return Object.keys(status)
    ?.filter((key) => {
      if (login.isPrivateSpace()) {
        return PrivateSpaceflowStatusSelectOptions.includes(key as TaskStatus);
      } else {
        return flowStatusSelectOptions.includes(key as TaskStatus);
      }
    })
    .map((key) => {
      return {
        text: (
          <>
            {status?.[key].text}
            {status?.[key]?.desc}
          </>
        ),
        value: key,
      };
    });
};
