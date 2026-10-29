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

import { ScheduleType } from '@/d.ts/schedule';
import { SchedulePageType } from '@/d.ts/schedule';
import { formatMessage } from '@/util/intl';
import settingStore from '@/store/setting';
import { SchedulePageTextMap } from '@/constant/schedule';
import { isClient } from '@/util/env';

export interface ITaskModeConfig {
  pageType: SchedulePageType;
  label: string;
  enabled: () => boolean;
}
export type PartialTaskConfig = { [K in SchedulePageType]?: ITaskModeConfig };
const schedlueConfig: PartialTaskConfig = {
  [SchedulePageType.ALL]: {
    label: SchedulePageTextMap[SchedulePageType.ALL],
    pageType: SchedulePageType.ALL,
    enabled: () => !isClient(),
  },
  [SchedulePageType.DATA_ARCHIVE]: {
    label: SchedulePageTextMap[SchedulePageType.DATA_ARCHIVE],
    pageType: SchedulePageType.DATA_ARCHIVE,
    enabled: () => settingStore.enableDataArchive,
  },
  [SchedulePageType.DATA_DELETE]: {
    label: SchedulePageTextMap[SchedulePageType.DATA_DELETE],
    pageType: SchedulePageType.DATA_DELETE,
    enabled: () => settingStore.enableDataClear,
  },
  [SchedulePageType.SQL_PLAN]: {
    label: SchedulePageTextMap[SchedulePageType.SQL_PLAN],
    pageType: SchedulePageType.SQL_PLAN,
    enabled: () => settingStore.enableSQLPlan,
  },
  [SchedulePageType.PARTITION_PLAN]: {
    label: SchedulePageTextMap[SchedulePageType.PARTITION_PLAN],
    pageType: SchedulePageType.PARTITION_PLAN,
    enabled: () => settingStore.enablePartitionPlan,
  },
};

export { schedlueConfig };
