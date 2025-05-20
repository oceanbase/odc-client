import { getCronExecuteCycleByObject, translator } from '@/component/Crontab';
import { ICycleTaskTriggerConfig, TaskExecStrategy, TaskStatus } from '@/d.ts';

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
    text: string;
  };
}) => {
  return Object.keys(status)
    ?.filter((key) => key !== TaskStatus.WAIT_FOR_CONFIRM)
    .map((key) => {
      return {
        text: status?.[key].text,
        value: key,
      };
    });
};
