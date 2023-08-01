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

export enum Expression {
  ENVIRONMENT_ID = 'EnvironmentId',
  TASK_TYPE = 'TaskType',
  SQL_CHECK_RESULT = 'SqlCheckResult',
}
