import { useSearchParams } from '@umijs/max';
import { ScheduleType } from '@/d.ts/schedule';
import { Perspective, ScheduleTab } from '../interface';
import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';
import login from '@/store/login';
import { toInteger } from 'lodash';

const useScheduleSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultScheduleId = searchParams.get('scheduleId');
  const defaultScheduleType = searchParams.get('scheduleType') as ScheduleType;
  const defaultOrganizationId = searchParams.get('organizationId');
  const defaultSubTaskId = searchParams.get('subTaskId');
  const defaultScheduleStatus = searchParams.get('scheduleStatus');
  const defaultPerspective = searchParams.get('perspective') as Perspective;
  const defaultSubTaskStatus = searchParams.get('subTaskStatus') as ScheduleTaskStatus;
  const defaultTab = searchParams.get('tab') as ScheduleTab;
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
      defaultSubTaskStatus,
      defaultTab,
    },
    resetSearchParams,
  };
};

export default useScheduleSearchParams;
