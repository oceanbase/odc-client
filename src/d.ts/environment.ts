import { formatMessage } from '@/util/intl';
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
  style: string;
}
export interface DataType {
  key: string;
  envName: string;
  description: string;
  tag: string;
  sqlDevSpecification: string;
  riskSensitiveSpecification: string;
}

export const envMap = {
  dev: formatMessage({ id: 'odc.src.d.ts.environment.Development' }), //开发
  test: formatMessage({ id: 'odc.src.d.ts.environment.Test' }), //测试
  prod: formatMessage({ id: 'odc.src.d.ts.environment.Production' }), //生产
};

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
