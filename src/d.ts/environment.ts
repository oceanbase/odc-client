import type { ProjectUser } from './project';

export interface IEnvironment {
  id: number;
  name: string;
  description: string;
  rulesetId: number;
  rulesetName: string;
  organizationId: number;
  builtIn: boolean;
  createTime: string;
  updateTime: string;
  creator: ProjectUser;
  lastModifier: ProjectUser;
}
export interface DataType {
  key: string;
  envName: string;
  description: string;
  tag: string;
  sqlDevSpecification: string;
  riskSensitiveSpecification: string;
}

export type Creator = {
  id: number;
  name: string;
  accountName: string;
  roleNames: string[];
};

export enum envMap {
  dev = '开发',
  test = '测试',
  prod = '生产',
}

export enum RuleType {
  SQL_CHECK = 'SQL_CHECK',
  SQL_CONSOLE = 'SQL_CONSOLE',
}

export enum DialectType {
  OB_MYSQL = 'OB_MYSQL',
  OB_ORACLE = 'OB_ORACLE',
  ORACLE = 'ORACLE',
  MYSQL = 'MYSQL',
  UNKNOWN = 'UNKNOWN',
}

export type PropertyMetadata = {
  name: string;
  description: string;
  type: PropertyMetadataType;
  defaultValue: any;
  candidates: any[];
};

export enum PropertyMetadataType {
  INTEGER = 'INTEGER',
  STRING = 'STRING',
  LIST = 'LIST',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTI_CHOICES = 'MULTI_CHOICES',
}

export type Metadata = {
  id: number;
  name: string;
  description: string;
  type: RuleType;
  subTypes: string[];
  supportedDialectTypes: DialectType[];
  propertyMetadatas: PropertyMetadata[];
  builtIn: boolean;
};

export type Rule = {
  id: number;
  metadata: Metadata;
  rulesetId: number;
  level: number;
  appliedDialectTypes: DialectType[];
  properties: any;
  enabled: boolean;
  organizationId: number;
  createTime: string;
  updateTime: string;
};

export type LastModifier = {
  id: number;
  name: string;
  accountName: string;
  roleNames: string[];
};
export interface Ruleset {
  id: number;
  name: string;
  description: string;
  rules: Rule[];
  organizationId: number;
  createTime: string;
  updateTime: string;
  creator: Creator;
  lastModifier: LastModifier;
}
export interface Page {
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
export interface TagType {
  tabContent: string;
  tabStyle: string;
}
