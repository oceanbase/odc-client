import type { ProjectUser } from './project';

export enum RuleType {
  SQL_CHECK = 'SQL_CHECK',
  SQL_CONSOLE = 'SQL_CONSOLE',
}

export interface IRule {
  id: number;
  name: string;
  description: string;
  value: string;
  type: RuleType;
  builtIn: boolean;
  enabled: boolean;
  organizationId: number;
  createTime: number;
  updateTime: number;
  creator: ProjectUser;
  lastModifier: ProjectUser;
}

export interface IRuleSet {
  id: number;
  name: string;
  description: string;
  rules: IRule[];
  organizationId: number;
  createTime: number;
  updateTime: number;
  creator: ProjectUser;
  lastModifier: ProjectUser;
}
