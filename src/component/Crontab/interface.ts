/*
 * Copyright 2024 OceanBase
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
