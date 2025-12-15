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

import { useSearchParams } from '@umijs/max';
import { ScheduleStatus, ScheduleType } from '@/d.ts/schedule';
import { Perspective, ScheduleTab } from '../interface';
import login from '@/store/login';
import { toInteger } from 'lodash';

const useScheduleSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultScheduleId = searchParams.get('scheduleId');
  const defaultScheduleType = searchParams.get('scheduleType') as ScheduleType;
  const defaultOrganizationId = searchParams.get('organizationId');
  const defaultSubTaskId = searchParams.get('subTaskId');
  const defaultScheduleStatus = searchParams.get('scheduleStatus') as ScheduleStatus;
  const defaultPerspective = searchParams.get('perspective') as Perspective;
  const defaultSubTaskStatus = searchParams.get('subTaskStatus');
  const defaultTab = searchParams.get('tab') as ScheduleTab;
  const defaultSubTaskTab = searchParams.get('subTaskTab');
  const defaultApproveStatus = searchParams.get('approveStatus');
  const timeValue = searchParams.get('timeValue');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const projectId = searchParams.get('projectId');
  const currentOrganizationId = login.organizationId;
  const isOrganizationMatch = toInteger(defaultOrganizationId) === toInteger(currentOrganizationId);

  const resetSearchParams = () => {
    setTimeout(() => {
      searchParams.delete('scheduleId');
      searchParams.delete('scheduleType');
      searchParams.delete('organizationId');
      searchParams.delete('subTaskId');
      searchParams.delete('scheduleStatus');
      searchParams.delete('perspective');
      searchParams.delete('subTaskStatus');
      searchParams.delete('tab');
      searchParams.delete('subTaskTab');
      searchParams.delete('approveStatus');
      // Delete filter parameters passed from Console
      searchParams.delete('timeValue');
      searchParams.delete('startTime');
      searchParams.delete('endTime');
      searchParams.delete('projectId');
      setSearchParams(searchParams);
    });
  };
  return {
    searchParams: {
      defaultScheduleId: isOrganizationMatch ? toInteger(defaultScheduleId) : null,
      defaultScheduleType,
      defaultSubTaskId: toInteger(defaultSubTaskId),
      defaultScheduleStatus,
      defaultPerspective,
      defaultSubTaskStatus: defaultSubTaskStatus ? defaultSubTaskStatus?.split(',') : [],
      defaultTab,
      defaultSubTaskTab,
      defaultApproveStatus:
        defaultApproveStatus !== null
          ? defaultApproveStatus
            ? defaultApproveStatus.split(',')
            : []
          : null,
      timeValue: timeValue ? (isNaN(Number(timeValue)) ? timeValue : Number(timeValue)) : null,
      startTime: startTime ? Number(startTime) : null,
      endTime: endTime ? Number(endTime) : null,
      projectId: projectId ? projectId : null,
    },
    resetSearchParams,
  };
};

export default useScheduleSearchParams;
