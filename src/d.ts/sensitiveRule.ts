import { ProjectUser } from './project';
import { Level } from './sensitiveColumn';
export enum SensitiveRuleType {
  PATH = 'PATH',
  REGEX = 'REGEX',
  GROOVY = 'GROOVY',
}
export interface ISensitiveRule {
  id?: number;
  name: string;
  enabled: boolean;
  projectId: number;
  type: SensitiveRuleType;
  databaseRegexExpression: string;
  tableRegexExpression: string;
  columnRegexExpression: string;
  columnCommentRegexExpression: string;
  groovyScript: string;
  pathIncludes: string[];
  pathExcludes: string[];
  maskingAlgorithmId: number;
  level: Level;
  description: string;
  builtin: boolean;
  creator: ProjectUser;
  createTime: number;
  updateTime: number;
  organizationId: number;
}
