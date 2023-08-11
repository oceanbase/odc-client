import { EBooleanOperator, EConditionType } from '@/page/Secure/RiskLevel/components/InnerRiskLevel';
import { ProjectUser } from './project';
import { IRiskLevel } from './riskLevel';
import { Expression } from '@/page/Secure/RiskLevel/interface';
export interface RiskDetectRuleCondition {
  id?: number;
  expression: string;
  operation: string;
  value: string;
}
export interface ICondition {
  expression: Expression;
  operator: EBooleanOperator;
  type: EConditionType;
  value: string | string[];
}
export interface IConditionGroup {
  booleanOperator: EBooleanOperator;
  children: ICondition[];
  type: EConditionType;
}
export interface Action {
  id?: number;
  level: number;
  description: string;
  organizationId: number;
}
export type RootNode = ICondition | IConditionGroup;
export interface IRiskDetectRule {
  id?: number;
  name: string;
  organizationId: number;
  rootNode: RootNode;
  riskLevelId: number;
  riskLevel: IRiskLevel;
  builtIn: boolean;
  creator: ProjectUser;
  createTime: number;
}
