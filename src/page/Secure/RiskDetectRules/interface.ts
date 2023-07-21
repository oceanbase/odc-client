import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { UserStore } from '@/store/login';
import { ITableLoadOptions } from '../components/SecureTable/interface';

export interface RiskLevelMapProps {
  value: number;
  label: string;
  level?: number;
  organizationId?: number;
  name?: string;
  style?: string;
}

export interface InnerRiskDetectRulesProps {
  userStore: UserStore;
  loading: boolean;
  exSearch: (args: ITableLoadOptions) => Promise<any>;
  exReload: (args: ITableLoadOptions) => Promise<any>;
  riskLevel: RiskLevelMapProps;
  selectedItem: number;
  riskDetectRules: IRiskDetectRule[];
  getListRiskDetectRules: (v: RiskLevelMapProps) => void;
}

export interface SelectItemProps {
  label: string;
  value: string | number;
}

export enum TaskTypeEnum {
  IMPORT = 'import',
  EXPORT = 'export',
  MOCKDATA = 'mockdata',
  ASYNC = 'async',
  PARTITION_PLAN = 'partition_plan',
  SQL_PLAN = 'sql_plan',
  ALTER_SCHEDULE = 'alter_schedule',
  SHADOWTABLE_SYNC = 'shadowtable_sync',
  DATA_SAVE = 'data_save',
}

export const TaskTypeTextMap = {
  [TaskTypeEnum.IMPORT]: 'IMPORT',
  [TaskTypeEnum.EXPORT]: 'EXPORT',
  [TaskTypeEnum.MOCKDATA]: 'MOCKDATA',
  [TaskTypeEnum.ASYNC]: 'ASYNC',
  [TaskTypeEnum.PARTITION_PLAN]: 'PARTITION_PLAN',
  [TaskTypeEnum.SQL_PLAN]: 'SQL_PLAN',
  [TaskTypeEnum.ALTER_SCHEDULE]: 'ALTER_SCHEDULE',
  [TaskTypeEnum.SHADOWTABLE_SYNC]: 'shadowtable_sync',
  [TaskTypeEnum.DATA_SAVE]: 'DATA_SAVE',
};
