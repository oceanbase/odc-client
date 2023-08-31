import { ConnectType, TaskType } from '@/d.ts';
import { IDataSourceModeConfig } from '../interface';
import MySQLColumnExtra from '../oceanbase/MySQLColumnExtra';

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

const items: Record<ConnectType.MYSQL, IDataSourceModeConfig> = {
  [ConnectType.MYSQL]: {
    connection: {
      address: {
        items: ['ip', 'port'],
      },
      account: true,
      sys: false,
      ssl: false,
    },
    features: {
      task: [TaskType.ASYNC, TaskType.DATAMOCK, TaskType.SQL_PLAN],
      allTask: false,
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
};

export default items;
