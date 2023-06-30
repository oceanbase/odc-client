import { ProjectUser } from './project';
import { IRiskLevel } from './riskLevel';
export interface RiskDetectRuleCondition {
  id?: number;
  expression: string;
  operation: string;
  value: string;
}
export interface Action {
  id?: number;
  level: number;
  description: string;
  organizationId: number;
}
export interface IRiskDetectRule {
  id?: number;
  name: string;
  organizationId: number;
  conditions: RiskDetectRuleCondition[];
  riskLevelId: number;
  riskLevel: IRiskLevel;
  builtIn: boolean;
  creator: ProjectUser;
  createTime: number;
}
