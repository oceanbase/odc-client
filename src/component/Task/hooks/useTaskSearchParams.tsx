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

import { TaskType } from '@/d.ts';
import { useSearchParams } from '@umijs/max';
import { TaskTab } from '../interface';
import login from '@/store/login';
import { toInteger } from 'lodash';

const useTaskSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTaskId = searchParams.get('taskId');
  const defaultTaskType = searchParams.get('taskType');
  const taskTypesStr = searchParams.get('taskTypes');
  const resolvedDefaultTaskType =
    defaultTaskType || (taskTypesStr ? (taskTypesStr.split(',')[0] as TaskType) : null);
  const defaultOrganizationId = searchParams.get('organizationId');
  const defaultTab = searchParams.get('tab') as TaskTab;
  const timeValue = searchParams.get('timeValue');
  const timeRange = searchParams.get('timeRange');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const projectId = searchParams.get('projectId');
  const statusesStr = searchParams.get('statuses');
  const currentOrganizationId = login.organizationId;
  const isOrganizationMatch = toInteger(defaultOrganizationId) === toInteger(currentOrganizationId);

  const resetSearchParams = () => {
    setTimeout(() => {
      searchParams.delete('taskId');
      searchParams.delete('taskType');
      searchParams.delete('organizationId');
      searchParams.delete('tab');
      searchParams.delete('timeValue');
      searchParams.delete('timeRange');
      searchParams.delete('startTime');
      searchParams.delete('endTime');
      searchParams.delete('projectId');
      searchParams.delete('taskTypes');
      searchParams.delete('statuses');
      setSearchParams(searchParams);
    });
  };

  return {
    searchParams: {
      defaultTaskId: isOrganizationMatch ? toInteger(defaultTaskId) : null,
      defaultTaskType: resolvedDefaultTaskType,
      defaultTab,
      timeValue: timeValue ? (isNaN(Number(timeValue)) ? timeValue : Number(timeValue)) : null,
      timeRange: timeRange ? (isNaN(Number(timeRange)) ? timeRange : Number(timeRange)) : null,
      startTime: startTime ? Number(startTime) : null,
      endTime: endTime ? Number(endTime) : null,
      projectId: projectId ? projectId : null,
      taskTypes: taskTypesStr ? taskTypesStr.split(',') : null,
      statuses: statusesStr !== null ? (statusesStr ? statusesStr.split(',') : []) : null,
    },
    resetSearchParams,
  };
};

export default useTaskSearchParams;
