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

import { ColumnStoreType } from '@/d.ts/table';
import { RefreshMethod, RefreshScheduleUnit } from '@/d.ts';
import type { Dayjs } from 'dayjs';

export enum MaterializedViewTabType {
  INFO = 'info',
  COLUMN = 'column',
  INDEX = 'index',
  CONSTRAINT = 'constranint',
  PARTITION = 'partition',
}

export interface MaterializedViewInfo {
  name: string;
  columnGroups?: ColumnStoreType[];
  refreshMethod: RefreshMethod;
  parallelismDegree?: number;
  refreshSchedule?: {
    // false用于前端选择值，取值为false时，refreshSchedule为空，不会传给服务端
    startStrategy?: StartStrategy | false;
    interval?: number;
    startWith?: Dayjs | number;
    unit?: RefreshScheduleUnit;
  };
  enableQueryRewrite?: boolean;
  enableQueryComputation?: boolean;
}

export enum TableSelectorNode {
  database = 'database',
  tableRoot = 'tableRoot',
  table = 'table',
  materializedViewRoot = 'materializedViewRoot',
  materializedView = 'materializedView',
}

export interface MvColumns {
  aliasName: string;
  columnName: string;
  dbName: string;
  tableName: string;
  tableOrViewAliasName: string;
  viewName: string;
  name?: string;
}

export interface MviewUnits {
  dbName: string;
  tableName: string;
  viewName: string;
  aliasName: string;
}

export enum StartStrategy {
  START_AT = 'START_AT',
  START_NOW = 'START_NOW',
}
