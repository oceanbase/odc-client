import { IDatabase } from './database';
import { ProjectUser } from './project';

export enum Level {
  LOW,
  MEDIUM,
  HIGH,
  EXTREME_HIGH,
}

export interface ISensitiveColumn {
  id?: number;
  enabled: boolean;
  database: IDatabase;
  tableName: string;
  columnName: string;
  maskingAlgorithmId: number;
  sensitiveRuleId: number;
  level: Level;
  creator: ProjectUser;
  createTime: number;
  updateTime: number;
  organizationId: number;
}
