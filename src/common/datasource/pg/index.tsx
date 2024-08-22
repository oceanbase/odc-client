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

import { ConnectType, TaskType } from '@/d.ts';
import { IDataSourceModeConfig } from '../interface';
import MySQLColumnExtra from '../oceanbase/MySQLColumnExtra';
import { haveOCP } from '@/util/env';

const tableConfig = {
  enableTableCharsetsAndCollations: true,
  enableConstraintOnUpdate: true,
  ColumnExtraComponent: MySQLColumnExtra,
  paritionNameCaseSensitivity: true,
  enableIndexesFullTextType: true,
  enableAutoIncrement: true,
  type2ColumnType: {
    id: 'int',
    name: 'varchar',
    date: 'datetime',
    time: 'timestamp',
  },
};

const functionConfig: IDataSourceModeConfig['schema']['func'] = {
  params: ['paramName', 'dataType', 'dataLength'],
  defaultValue: {
    dataLength: 45,
  },
  dataNature: true,
  sqlSecurity: true,
  deterministic: true,
};

const procedureConfig: IDataSourceModeConfig['schema']['proc'] = {
  params: ['paramName', 'paramMode', 'dataType', 'dataLength'],
  defaultValue: {
    dataLength: 45,
  },
  dataNature: true,
  sqlSecurity: true,
  deterministic: true,
};

const items: Record<ConnectType.PG, IDataSourceModeConfig> = {
  [ConnectType.PG]: {
    connection: {
      address: {
        items: ['ip', 'port', 'catalogName'],
      },
      account: true,
      sys: false,
      ssl: false,
      jdbcDoc: 'https://jdbc.postgresql.org/documentation/use/',
    },
    features: {
      task: [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE],
      obclient: false,
      recycleBin: false,
      sessionManage: false,
      sqlExplain: false,
      export: {
        fileLimit: false,
        snapshot: false,
      },
    },
    schema: {
      table: tableConfig,
      func: functionConfig,
      proc: procedureConfig,
      innerSchema: ['postgres'],
    },
    sql: {
      language: 'mysql',
      escapeChar: '"',
      caseSensitivity: true,
    },
  },
};

if (haveOCP()) {
  delete items[ConnectType.PG];
}

export default items;
