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
import { TableForeignConstraintOnDeleteType } from '@/d.ts/table';
import { haveOCP } from '@/util/env';
import { IDataSourceModeConfig } from '../interface';
import OracleColumnExtra from '../oceanbase/OracleColumnExtra';
import { ScheduleType } from '@/d.ts/schedule';

const oracleTableConfig = {
  constraintEnableConfigurable: true,
  constraintDeferConfigurable: true,
  enableCheckConstraint: true,
  ColumnExtraComponent: OracleColumnExtra,
  constraintForeignOnDeleteConfig: [
    TableForeignConstraintOnDeleteType.CASCADE,
    TableForeignConstraintOnDeleteType.NO_ACTION,
    TableForeignConstraintOnDeleteType.SET_NULL,
  ],
  disableRangeColumnsPartition: true,
  disableListColumnsPartition: true,
  disableKeyPartition: true,
  disableLinearHashPartition: true,
  enableIndexScope: true,
  enableIndexVisible: true,
  type2ColumnType: {
    id: 'NUMBER',
    name: 'VARCHAR',
    date: 'DATE',
    time: 'TIMESTAMP',
  },
};

const functionConfig: IDataSourceModeConfig['schema']['func'] = {
  params: ['paramName', 'paramMode', 'dataType', 'defaultValue'],
};

const scheduleConfig: IDataSourceModeConfig['features']['scheduleConfig'] = {
  allowTargetConnectTypeByDataArchive: [
    ConnectType.COS,
    ConnectType.OBS,
    ConnectType.S3A,
    ConnectType.OSS,
    ConnectType.OB_ORACLE,
    ConnectType.CLOUD_OB_ORACLE,
    ConnectType.ORACLE,
  ],
};

const items: Record<ConnectType.ORACLE, IDataSourceModeConfig> = {
  [ConnectType.ORACLE]: {
    priority: 2,
    connection: {
      address: {
        items: ['ip', 'port', 'sid'],
      },
      account: true,
      role: true,
      sys: false,
      ssl: false,
      jdbcDoc:
        'https://docs.oracle.com/en/database/oracle/oracle-database/21/jajdb/oracle/jdbc/OracleConnection.html',
      disableURLParse: true,
    },
    features: {
      scheduleConfig,
      task: [
        TaskType.IMPORT,
        TaskType.EXPORT,
        TaskType.EXPORT_RESULT_SET,
        TaskType.ASYNC,
        TaskType.MULTIPLE_ASYNC,
      ],
      schedule: [ScheduleType.SQL_PLAN, ScheduleType.DATA_ARCHIVE, ScheduleType.DATA_DELETE],
      obclient: false,
      recycleBin: false,
      sqlExplain: false,
      sessionManage: true,
      sessionParams: true,
      groupResourceTree: true,
      sqlconsole: true,
      disableTriggerSwitch: true,
      compile: false,
      plEdit: true,
      anonymousBlock: true,
      supportOBProxy: false,
      export: {
        fileLimit: false,
        snapshot: false,
      },
    },
    schema: {
      table: oracleTableConfig,
      func: functionConfig,
      proc: functionConfig,
      innerSchema: ['SYS'],
    },
    sql: {
      language: 'oboracle',
      escapeChar: '"',
      plParamMode: 'text',
    },
  },
};
if (haveOCP()) {
  delete items[ConnectType.ORACLE];
}

export default items;
