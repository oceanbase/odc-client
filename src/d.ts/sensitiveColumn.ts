/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IDatabase } from './database';
import { ProjectUser } from './project';

export enum Level {
  LOW,
  MEDIUM,
  HIGH,
  EXTREME_HIGH,
}
export enum ESensitiveColumnType {
  TABLE_COLUMN = 'TABLE_COLUMN',
  VIEW_COLUMN = 'VIEW_COLUMN',
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
  type: ESensitiveColumnType;
  creator: ProjectUser;
  createTime: number;
  updateTime: number;
  organizationId: number;
}
