import { ConnectType, TaskType } from '@/d.ts';
import { IDataSourceModeConfig } from '../interface';
import MySQLColumnExtra from './MySQLColumnExtra';
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

const items: Record<
  ConnectType.OB_MYSQL | ConnectType.CLOUD_OB_MYSQL | ConnectType.ODP_SHARDING_OB_MYSQL,
  IDataSourceModeConfig
> = {
  [ConnectType.OB_MYSQL]: {
    connection: {
      address: {
        items: ['ip', 'port', 'cluster', 'tenant'],
      },
      account: true,
      sys: true,
      ssl: true,
    },
    features: {
      task: [],
      allTask: true,
      obclient: true,
      recycleBin: true,
      sqlExplain: true,
    },
    schema: {
      table: tableConfig,
    },
    sql: {
      language: 'obmysql',
      escapeChar: '`',
    },
  },
  [ConnectType.CLOUD_OB_MYSQL]: {
    connection: {
      address: {
        items: ['ip', 'port'],
      },
      account: true,
      sys: true,
      ssl: true,
    },
    features: {
      task: [],
      allTask: true,
      obclient: true,
      recycleBin: true,
      sqlExplain: true,
    },
    schema: {
      table: tableConfig,
    },
    sql: {
      language: 'obmysql',
      escapeChar: '`',
    },
  },
  [ConnectType.ODP_SHARDING_OB_MYSQL]: {
    connection: {
      address: {
        items: ['ip', 'port'],
      },
      account: true,
      sys: false,
      ssl: true,
      defaultSchema: true,
    },
    features: {
      task: [TaskType.ASYNC, TaskType.SQL_PLAN],
      allTask: false,
      obclient: false,
      recycleBin: false,
      sqlExplain: false,
    },
    schema: {
      table: tableConfig,
    },
    sql: {
      language: 'obmysql',
      escapeChar: '`',
    },
  },
};
if (haveOCP()) {
  delete items[ConnectType.ODP_SHARDING_OB_MYSQL];
  delete items[ConnectType.CLOUD_OB_MYSQL];
}

export default items;
