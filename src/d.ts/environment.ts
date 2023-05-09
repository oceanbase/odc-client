import type { ProjectUser } from './project';

export interface IEnvironment {
  id: number;
  name: string;
  sqlInterceptorId: number;
  sqlInterceptorName: string;
  rulesetId: number;
  rulesetName: string;
  flowConfigId: number;
  flowConfigName: string;
  organizationId: number;
  builtIn: boolean;
  createTime: number;
  updateTime: number;
  creator: ProjectUser;
  lastModifier: ProjectUser;
}
