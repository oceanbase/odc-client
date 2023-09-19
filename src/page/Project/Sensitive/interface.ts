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

import { formatMessage } from '@/util/intl';
export enum AddSensitiveColumnType {
  Manual,
  Scan,
}
export interface SelectItemProps {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FilterItemProps {
  text: string;
  value: any;
}
export interface ScanTableDataItem {
  columnName: string;
  maskingAlgorithmId: number;
  sensitiveRuleId: number;
}
export interface ScanTableData {
  header: {
    database: string;
    tableName: string;
  };
  dataSource: ScanTableDataItem[];
}

export enum DetectRuleType {
  PATH = 'PATH',
  REGEX = 'REGEX',
  GROOVY = 'GROOVY',
}

export interface CheckboxInputValue {
  readonly label: string;
  checked?: string[];
  regExp?: string;
}
export interface CheckboxInputProps {
  name?: string[];
  checkValue?: string;
  hasLabel?: boolean;
  formRef: any;
  value?: CheckboxInputValue;
  onChange?: (value: CheckboxInputValue) => void;
}

export const DetectRuleTypeMap = {
  PATH: formatMessage({ id: 'odc.Project.Sensitive.interface.Path' }), //路径
  REGEX: formatMessage({ id: 'odc.Project.Sensitive.interface.Regular' }), //正则
  GROOVY: formatMessage({ id: 'odc.Project.Sensitive.interface.Script' }), //脚本
};

export enum EColumnType {
  NUMBER = 'NUMBER',
  VARCHAR2 = 'VARCHAR2',
  BLOB = 'BLOB',
  DATE = 'DATE',
  CHAR = 'CHAR',
  NCHAR = 'NCHAR',
  CLOB = 'CLOB',
  TIMESTAMP = 'TIMESTAMP',
  TIMESTAMP_WITH_TIME_ZONE = 'TIMESTAMP WITH TIME ZONE',
  TIMESTAMP_WITH_LOCAL_TIME_ZONE = 'TIMESTAMP WITH LOCAL TIME ZONE',
  RAW = 'RAW',
  INTERVAL_DAY_TO_SECOND = 'INTERVAL DAY TO SECOND',
  INTERVAL_YEAR_TO_MONTH = 'INTERVAL YEAR TO MONTH',
}
