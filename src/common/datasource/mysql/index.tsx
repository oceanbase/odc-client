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
import { haveOCP } from '@/util/env';
import { IDataSourceModeConfig } from '../interface';
import MySQLColumnExtra from '../oceanbase/MySQLColumnExtra';
import { ScheduleType } from '@/d.ts/schedule';

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

const scheduleConfig: IDataSourceModeConfig['features']['scheduleConfig'] = {
  allowTargetConnectTypeByDataArchive: [
    ConnectType.COS,
    ConnectType.OBS,
    ConnectType.S3A,
    ConnectType.OSS,
    ConnectType.OB_MYSQL,
    ConnectType.CLOUD_OB_MYSQL,
    ConnectType.MYSQL,
  ],
};

const items: Record<ConnectType.MYSQL, IDataSourceModeConfig> = {
  [ConnectType.MYSQL]: {
    connection: {
      address: {
        items: ['ip', 'port'],
      },
      account: true,
      sys: false,
      ssl: false,
      jdbcDoc:
        'https://dev.mysql.com/doc/connector-j/en/connector-j-reference-configuration-properties.html',
    },
    features: {
      task: [
        TaskType.ASYNC,
        TaskType.DATAMOCK,
        TaskType.IMPORT,
        TaskType.EXPORT,
        TaskType.EXPORT_RESULT_SET,
        TaskType.STRUCTURE_COMPARISON,
        TaskType.MULTIPLE_ASYNC,
        TaskType.LOGICAL_DATABASE_CHANGE,
      ],
      schedule: [ScheduleType.SQL_PLAN, ScheduleType.DATA_ARCHIVE, ScheduleType.DATA_DELETE],
      scheduleConfig,
      obclient: true,
      recycleBin: false,
      plRun: true,
      sessionManage: true,
      sqlExplain: true,
      sessionParams: true,
      groupResourceTree: true,
      sqlconsole: true,
      export: {
        fileLimit: false,
        snapshot: false,
      },
    },
    schema: {
      table: tableConfig,
      func: functionConfig,
      proc: procedureConfig,
      innerSchema: ['information_schema', 'test', 'mysql'],
    },
    sql: {
      language: 'mysql',
      escapeChar: '`',
      caseSensitivity: true,
    },
  },
};

if (haveOCP()) {
  delete items[ConnectType.MYSQL];
}

export default items;
