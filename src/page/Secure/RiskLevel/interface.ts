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

import { ITableLoadOptions } from '@/component/CommonTable/interface';
import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { UserStore } from '@/store/login';

export interface RiskLevelMapProps {
  value: number;
  label: string;
  level?: number;
  organizationId?: number;
  name?: string;
  style?: string;
}

export interface InnerRiskDetectRulesProps {
  userStore: UserStore;
  loading: boolean;
  exSearch: (args: ITableLoadOptions) => Promise<any>;
  exReload: (args: ITableLoadOptions) => Promise<any>;
  riskLevel: RiskLevelMapProps;
  selectedItem: number;
  riskDetectRules: IRiskDetectRule[];
  getListRiskDetectRules: (v: RiskLevelMapProps) => void;
}

export interface SelectItemProps {
  label: string;
  value: string | number;
}

export enum Expression {
  ENVIRONMENT_ID = 'ENVIRONMENT_ID',
  TASK_TYPE = 'TASK_TYPE',
  SQL_CHECK_RESULT = 'SQL_CHECK_RESULT',
  PROJECT_NAME = 'PROJECT_NAME',
  DATABASE_NAME = 'DATABASE_NAME',
}
export const ExpressionMap = {
  [Expression.ENVIRONMENT_ID]: '环境',
  [Expression.TASK_TYPE]: '任务类型',
  [Expression.SQL_CHECK_RESULT]: 'SQL 检查结果',
  [Expression.PROJECT_NAME]: '项目名称',
  [Expression.DATABASE_NAME]: '数据库名称',
}
export enum EOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN'
}
export const OperatorMap = {
  [EOperator.EQUALS]: '等于',
  [EOperator.NOT_EQUALS]: '不等于',
  [EOperator.CONTAINS]: '包含',
  [EOperator.NOT_CONTAINS]: '不包含',
  [EOperator.IN]: '在',
  [EOperator.NOT_IN]: '不在',
}