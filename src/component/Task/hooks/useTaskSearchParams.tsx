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
  const currentOrganizationId = login.organizationId;
  const isOrganizationMatch = toInteger(defaultOrganizationId) === toInteger(currentOrganizationId);

  const resetSearchParams = () => {
    setTimeout(() => {
      searchParams.delete('taskId');
      searchParams.delete('taskType');
      searchParams.delete('organizationId');
      searchParams.delete('tab');
      setSearchParams(searchParams);
    });
  };

  return {
    searchParams: {
      defaultTaskId: isOrganizationMatch ? toInteger(defaultTaskId) : null,
      defaultTaskType,
      defaultTab,
    },
    resetSearchParams,
  };
};

export default useTaskSearchParams;
