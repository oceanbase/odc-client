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
