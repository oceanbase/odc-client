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

import type { TaskExecStrategy } from '@/d.ts';
import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CharRuleType } from './RuleContent/ruleItems/CharItem';
import { DateRuleType } from './RuleContent/ruleItems/DateItem';
import { IntervalRuleType } from './RuleContent/ruleItems/IntervalItem';
import { NumberRuleType } from './RuleContent/ruleItems/NumberItem';
import { OtherRuleType } from './RuleContent/ruleItems/OtherItem';

export enum RuleItem {
  NUMBER = 'NUMBER',
  CHAR = 'CHAR',
  DATE = 'DATE',
  INTERVAL_YEAR_TO_MONTH = 'INTERVAL_YEAR_TO_MONTH',
  INTERVAL_DAY_TO_SECOND = 'INTERVAL_DAY_TO_SECOND',
}

/**
 * 把数据类型转换成规则组件类型
 */
const _columnTypeToRuleMap = {
  [ConnectionMode.OB_ORACLE]: {
    INTEGER: RuleItem.NUMBER,
    NUMBER: RuleItem.NUMBER,
    CHAR: RuleItem.CHAR,
    VARCHAR2: RuleItem.CHAR,
    RAW: RuleItem.CHAR,
    BLOB: RuleItem.CHAR,
    CLOB: RuleItem.CHAR,
    DATE: RuleItem.DATE,
    TIMESTAMP: RuleItem.DATE,
    TIMESTAMP_WITH_TIME_ZONE: RuleItem.DATE,
    TIMESTAMP_WITH_LOCAL_TIME_ZONE: RuleItem.DATE,
    // INTERVAL_YEAR_TO_MONTH: RuleItem.INTERVAL_YEAR_TO_MONTH,
    // INTERVAL_DAY_TO_SECOND: RuleItem.INTERVAL_DAY_TO_SECOND,
  },
  [ConnectionMode.OB_MYSQL]: {
    INT: RuleItem.NUMBER,
    INT_UNSIGNED: RuleItem.NUMBER,
    NUMERIC: RuleItem.NUMBER,
    NUMERIC_UNSIGNED: RuleItem.NUMBER,
    TINYINT: RuleItem.NUMBER,
    TINYINT_UNSIGNED: RuleItem.NUMBER,
    SMALLINT: RuleItem.NUMBER,
    SMALLINT_UNSIGNED: RuleItem.NUMBER,
    MEDIUMINT: RuleItem.NUMBER,
    MEDIUMINT_UNSIGNED: RuleItem.NUMBER,
    BIGINT: RuleItem.NUMBER,
    BIGINT_UNSIGNED: RuleItem.NUMBER,
    DECIMAL: RuleItem.NUMBER,
    DECIMAL_UNSIGNED: RuleItem.NUMBER,
    FLOAT: RuleItem.NUMBER,
    FLOAT_UNSIGNED: RuleItem.NUMBER,
    DOUBLE: RuleItem.NUMBER,
    DOUBLE_UNSIGNED: RuleItem.NUMBER,
    TIMESTAMP: RuleItem.DATE,
    DATE: RuleItem.DATE,
    TIME: RuleItem.DATE,
    DATETIME: RuleItem.DATE,
    YEAR: RuleItem.DATE,
    VARCHAR: RuleItem.CHAR,
    CHAR: RuleItem.CHAR,
    TINYTEXT: RuleItem.CHAR,
    MEDIUMTEXT: RuleItem.CHAR,
    TEXT: RuleItem.CHAR,
    LONGTEXT: RuleItem.CHAR,
    TINYBLOB: RuleItem.CHAR,
    BLOB: RuleItem.CHAR,
    MEDIUMBLOB: RuleItem.CHAR,
    LONGBLOB: RuleItem.CHAR,
    BIT: RuleItem.CHAR,
    BINARY: RuleItem.CHAR,
    VARBINARY: RuleItem.CHAR,
  },
};
_columnTypeToRuleMap[ConnectionMode.MYSQL] = _columnTypeToRuleMap[ConnectionMode.OB_MYSQL];
export const columnTypeToRuleMap = _columnTypeToRuleMap;
export interface IMockFormColumn {
  columnName: string;
  columnType: string;
  columnObj?: any;
  rule: CharRuleType | DateRuleType | IntervalRuleType | NumberRuleType | OtherRuleType;
  typeConfig: {
    _isEditing?: boolean;
    [key: string]: any;
  };
}

export interface IMockFormData {
  connectionId: number;
  databaseId: number;
  databaseName: string;
  executionStrategy: TaskExecStrategy;
  executionTime?: number;
  tableName: string;
  taskName?: string;
  totalCount: number;
  batchSize: number;
  whetherTruncate: boolean;
  strategy: MockStrategy;
  columns: IMockFormColumn[];
  description?: string;
}

export enum MockStrategy {
  IGNORE = 'IGNORE',
  OVERWRITE = 'OVERWRITE',
  TERMINATE = 'TERMINATE',
}

export const MockStrategyTextMap = {
  [MockStrategy.IGNORE]: formatMessage({
    id: 'odc.component.DataMockerDrawer.type.Ignore',
  }), // 忽略
  [MockStrategy.OVERWRITE]: formatMessage({
    id: 'odc.component.DataMockerDrawer.type.Cover',
  }), // 覆盖
  [MockStrategy.TERMINATE]: formatMessage({
    id: 'odc.component.DataMockerDrawer.type.Termination',
  }), // 终止
};
