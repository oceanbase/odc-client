export type IRuleTip = [string, string][];

export enum CronInputName {
  second = 'second',
  minute = 'minute',
  hour = 'hour',
  dayOfMonth = 'dayOfMonth',
  month = 'month',
  dayOfWeek = 'dayOfWeek',
}

export enum CrontabMode {
  custom = 'custom',
  default = 'default',
}

export enum CrontabDateType {
  daily = 'DAY',
  weekly = 'WEEK',
  monthly = 'MONTH',
}

export interface ICrontab {
  mode: CrontabMode;
  cronString: string;
  dateType?: CrontabDateType;
  dayOfMonth?: number[];
  dayOfWeek?: number[];
  hour?: number[];
  error?: {
    [name: string]: string;
  };
}
