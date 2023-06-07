import { ProjectUser } from './project';
export interface Condition {
  id: number;
  ruleId: number;
  expression: string;
  operation: string;
  value: string;
}
export interface Action {
  id: number;
  level: number;
  description: string;
  organizationId: number;
}
export interface IRiskDetectRule {
  id: number;
  name: string;
  organizationId: number;
  conditions: Condition[];
  action: Action;
  creator: ProjectUser;
}
