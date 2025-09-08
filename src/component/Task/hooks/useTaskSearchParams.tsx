import { TaskType } from '@/d.ts';
import { useSearchParams } from '@umijs/max';
import { TaskTab } from '../interface';
import login from '@/store/login';
import { toInteger } from 'lodash';

const useTaskSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTaskId = searchParams.get('taskId');
  const defaultTaskType = searchParams.get('taskType') as TaskType;
  const defaultOrganizationId = searchParams.get('organizationId');
  const defaultTab = searchParams.get('tab') as TaskTab;
  const timeValue = searchParams.get('timeValue');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const projectId = searchParams.get('projectId');
  const currentOrganizationId = login.organizationId;
  const isOrganizationMatch = toInteger(defaultOrganizationId) === toInteger(currentOrganizationId);

  const resetSearchParams = () => {
    setTimeout(() => {
      searchParams.delete('taskId');
      searchParams.delete('taskType');
      searchParams.delete('organizationId');
      searchParams.delete('tab');
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
      defaultTaskId: isOrganizationMatch ? toInteger(defaultTaskId) : null,
      defaultTaskType,
      defaultTab,
      timeValue: timeValue ? (isNaN(Number(timeValue)) ? timeValue : Number(timeValue)) : null,
      startTime: startTime ? Number(startTime) : null,
      endTime: endTime ? Number(endTime) : null,
      projectId: projectId ? Number(projectId) : null,
    },
    resetSearchParams,
  };
};

export default useTaskSearchParams;
