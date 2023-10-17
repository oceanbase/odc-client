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
import OracleColumnExtra from './OracleColumnExtra';
import { TableForeignConstraintOnDeleteType } from '@/d.ts/table';
import { haveOCP } from '@/util/env';

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

const items: Record<ConnectType.CLOUD_OB_ORACLE | ConnectType.OB_ORACLE, IDataSourceModeConfig> = {
  [ConnectType.OB_ORACLE]: {
    priority: 2,
    connection: {
      address: {
        items: ['ip', 'port', 'cluster', 'tenant'],
      },
      account: true,
      sys: true,
      ssl: true,
    },
    features: {
      task: Object.values(TaskType).filter(
        (type) =>
          ![
            TaskType.SHADOW,
            TaskType.SQL_PLAN,
            TaskType.DATA_ARCHIVE,
            TaskType.DATA_DELETE,
            TaskType.PARTITION_PLAN,
          ].includes(type),
      ),
      obclient: true,
      recycleBin: true,
      sqlExplain: true,
      compile: true,
      plEdit: true,
      anonymousBlock: true,
      supportOBProxy: true,
    },
    schema: {
      table: oracleTableConfig,
      func: functionConfig,
      proc: functionConfig,
    },
    sql: {
      language: 'oboracle',
      escapeChar: '"',
      plParamMode: 'text',
    },
  },
  [ConnectType.CLOUD_OB_ORACLE]: {
    connection: {
      address: {
        items: ['ip', 'port'],
      },
      account: true,
      sys: true,
      ssl: true,
    },
    features: {
      task: Object.values(TaskType).filter(
        (type) =>
          ![
            TaskType.SHADOW,
            TaskType.DATA_ARCHIVE,
            TaskType.DATA_DELETE,
            TaskType.PARTITION_PLAN,
          ].includes(type),
      ),
      obclient: true,
      recycleBin: true,
      sqlExplain: true,
      compile: true,
      plEdit: true,
      anonymousBlock: true,
      supportOBProxy: true,
    },
    schema: {
      table: oracleTableConfig,
      func: functionConfig,
      proc: functionConfig,
    },
    sql: {
      language: 'oboracle',
      escapeChar: '"',
      plParamMode: 'text',
    },
  },
};

if (haveOCP()) {
  delete items[ConnectType.CLOUD_OB_ORACLE];
}

export default items;
