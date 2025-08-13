import { ScheduleType } from '@/d.ts/schedule';
import { SchedulePageType } from '@/d.ts/schedule';
import { formatMessage } from '@/util/intl';
import settingStore from '@/store/setting';
import { SchedulePageTextMap } from '@/constant/schedule';

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
    enabled: () => true,
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
