export default {
  'GET /api/v1/table/list/:sid': {
    errCode: null,
    errMsg: null,
    data: new Array(400).fill().map((m, i) => ({
      sid: null,
      databaseSid: null,
      tableName: `odc_env_${i}`,
      character: null,
      collation: null,
      comment: null,
      increment: null,
      properties: null,
      columns: null,
      indexes: null,
      shardRule: null,
      gmtCreated: null,
      gmtModified: null,
    })),
  },

  // 'POST /api/v1/console/sql-execute/:sid': async (req, res) => {
  //   await new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve();
  //       res.json({
  //         errCode: 'ConnectionKilled',
  //         data: true,
  //       });
  //     }, 10000);
  //   });
  // },

  // 'POST /api/v1/console/sql-execute/:sid': {
  //   errCode: null,
  //   errMsg:
  //     "ErrorCode: 900, ORA-00900: You have an error in your SQL syntax; check the manual that corresponds to your OceanBase version for the right syntax to use near '11212' at line 1",
  //   data: [
  //     {
  //       messages: null,
  //       columns: null,
  //       types: null,
  //       typeNames: null,
  //       total: null,
  //       rows: null,
  //       elapsedTime: 0.014,
  //       executeTimestamp: 1610446318764,
  //       executeSql: '11212',
  //       originSql: null,
  //       track:
  //         "ErrorCode: 900, ORA-00900: You have an error in your SQL syntax; check the manual that corresponds to your OceanBase version for the right syntax to use near '11212' at line 1",
  //       status: false,
  //       sqlType: null,
  //       dbObjectType: null,
  //       dbObjectName: null,
  //       traceId: null,
  //     },
  //   ],
  //   importantMsg: false,
  // },

  // 'POST /api/v1/console/sql-execute/:sid': {
  //   errCode: '',
  //   errMsg: '',
  //   // errMsg:
  //   //   "You have an error in your SQL syntax; check the manual that corresponds to your OceanBase version for the right syntax to use near 'sss' at line 1",
  //   data: [
  //     // {
  //     //   messages: 'xxxx',
  //     //   columns: null,
  //     //   types: null,
  //     //   typeNames: null,
  //     //   total: 0,
  //     //   rows: [],
  //     //   elapsedTime: 0.001,
  //     //   executeTimestamp: 1561444681237,
  //     //   executeSql:
  //     //     'SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;SELECT * FROM odc_env;',
  //     //   track:
  //     //     "You have an error in your SQL syntax; check the manual that corresponds to your OceanBase version for the right syntax to use near 'sss' at line 1You have an error in your SQL syntax; check the manual that corresponds to your OceanBase version for the right syntax to use near 'sss' at line 1You have an error in your SQL syntax; check the manual that corresponds to your OceanBase version for the right syntax to use near 'sss' at line 1",
  //     //   status: true,
  //     //   sqlType: 'CREATE',
  //     //   dbObjectType: 'DATABASE',
  //     // },
  //     {
  //       messages: null,
  //       columns: ['LOG_NR_', 'TYPE_', 'DATA_'],
  //       types: null,
  //       typeNames: null,
  //       total: 200,
  //       rows: new Array(200).fill(undefined).map(() => [null, '4op22322322232op', '(BLOB)']),
  //       // rows: [],
  //       elapsedTime: 0.001,
  //       executeTimestamp: 1561444681237,
  //       executeSql: 'SELECT * FROM odc_env;',
  //       track: null,
  //       status: true,
  //       // sqlType: 'DROP',
  //       // dbObjectType: 'DATABASE',
  //       // dbObjectName: 'mysql',
  //     },
  //   ],
  // },

  'POST /api/v1/console/sql-execute/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      {
        messages: null,
        columns: ['EnvId', 'EnvName', 'Desc', 'modifyTime', 'createTime', 'RegionId'],
        types: null,
        typeNames: null,
        total: 0,
        rows: new Array(100000).fill({
          EnvId: 1,
          EnvName: 'a',
          Desc: 'b',
          modifyTime: 'c',
          createTime: 'd',
          RegionId: 'e',
        }),
        elapsedTime: 0.001,
        executeTimestamp: 1561444681237,
        executeSql: 'SELECT * FROM odc_env;',
        track: null,
        status: true,
        queryCostMillis: 100, // sql执行在ob查询消耗的时间
        odcProcessCostMillis: 200, // sql结果在odc中处理消耗的时间
      },
    ],
  },

  'GET /api/v1/table/:sid': {
    errCode: null,
    errMsg: null,
    data: {
      tableName: 'act_evt_log',
      character: 'utf8mb4',
      collation: 'utf8mb4_bin',
      comment: null,
      tableSize: '0.00MB',
      ddlSql:
        "CREATE TABLE `act_evt_log` (\n  `LOG_NR_` bigint(20) NOT NULL AUTO_INCREMENT,\n  `TYPE_` varchar(64) COLLATE utf8mb4_bin DEFAULT NULL,\n  `PROC_DEF_ID_` varchar(64) COLLATE utf8mb4_bin DEFAULT NULL,\n  `PROC_INST_ID_` varchar(64) COLLATE utf8mb4_bin DEFAULT NULL,\n  `EXECUTION_ID_` varchar(64) COLLATE utf8mb4_bin DEFAULT NULL,\n  `TASK_ID_` varchar(64) COLLATE utf8mb4_bin DEFAULT NULL,\n  `TIME_STAMP_` timestamp(3) NOT NULL,\n  `USER_ID_` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,\n  `DATA_` longblob DEFAULT NULL,\n  `LOCK_OWNER_` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,\n  `LOCK_TIME_` timestamp(3) NULL DEFAULT NULL,\n  `IS_PROCESSED_` tinyint(4) DEFAULT '0',\n  PRIMARY KEY (`LOG_NR_`)\n) AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin COMPRESSION = 'lz4_1.0' REPLICA_NUM = 3 BLOCK_SIZE = 16384 USE_BLOOM_FILTER = FALSE TABLET_SIZE = 134217728 PCTFREE = 10",
      partitioned: true,
    },
  },
  'PUT /api/v1/table/:sid': {
    data: true,
    errCode: null,
    errMsg: null,
  },
  'DELETE /api/v1/table/:sid': {
    errCode: null,
    errMsg: null,
    data: {
      tableName: null,
      character: null,
      collation: null,
      comment: null,
      tableSize: null,
      ddlSql: null,
      incrementValue: null,
      type: null,
      partitioned: false,
    },
    importantMsg: false,
  },

  'GET /api/v1/column/list/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      {
        tableName: 'mysql',
        ordinalPosition: 1,
        columnName: 'LOG_NR_',
        dataType: 'int',
        length: null,
        allowNull: false,
        autoIncreament: true,
        defaultValue: null,
        comment: '',
      },
      {
        tableName: 'mysql',
        ordinalPosition: 2,
        columnName: 'TYPE_',
        dataType: 'varchar',
        dataShowType: 'TEXT',
        length: null,
        allowNull: true,
        autoIncreament: false,
        defaultValue: null,
        comment: '',
      },
      {
        tableName: 'mysql',
        ordinalPosition: 9,
        columnName: 'DATA_',
        dataType: 'blob',
        length: null,
        allowNull: true,
        autoIncreament: false,
        defaultValue: null,
        comment: '',
      },
    ],
  },

  'GET /api/v1/index/list/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      {
        name: 'PRIMARY',
        type: 'BTREE',
        range: 'GLOBAL',
        tableName: 'act_ru_job',
        unique: true,
        columnNames: ['ID_'],
        comment: '',
      },
      {
        name: 'pro_inst_index',
        type: 'BTREE',
        range: 'GLOBAL',
        tableName: 'act_ru_job',
        unique: false,
        columnNames: ['PROCESS_INSTANCE_ID_'],
        comment: '',
      },
      {
        name: 'proc_def_id_idx',
        type: 'BTREE',
        range: 'GLOBAL',
        tableName: 'act_ru_job',
        unique: false,
        columnNames: ['PROC_DEF_ID_'],
        comment: '',
      },
    ],
  },

  'GET /api/v1/partition/list/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      {
        tableName: null,
        partName: 'P1',
        position: 0,
        partType: 'RANGE',
        partNumber: 0,
        expression: 'id',
        desc: null,
        comment: null,
        partValues: '1230',
        tableRows: null,
        avgRowLength: null,
        subPartList: null,
      },
      {
        tableName: null,
        partName: 'P2',
        position: 1,
        partType: 'RANGE',
        partNumber: 0,
        expression: 'id',
        desc: null,
        comment: null,
        partValues: '23434',
        tableRows: null,
        avgRowLength: null,
        subPartList: null,
      },
      {
        tableName: null,
        partName: 'P3',
        position: 2,
        partType: 'RANGE',
        partNumber: 0,
        expression: 'id',
        desc: null,
        comment: null,
        partValues: '345665',
        tableRows: null,
        avgRowLength: null,
        subPartList: null,
      },
    ],
    importantMsg: false,
  },

  // 'POST /api/v1/schema/tableModify/:sid': async (req, res) => {
  //   await new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve();
  //       res.json({
  //         errCode: 'ConnectionKilled',
  //         data: true,
  //       });
  //     }, 1000);
  //   });
  // },
  'POST /api/v1/schema/tableModify/:sid': {
    data: true,
  },
  'POST /api/v1/schema/plModify/:sid': {
    data: true,
  },

  // 约束
  'GET /api/v1/constraint/list/:sid': {
    data: [
      {
        columns: ['c1', 'c2'],
        name: 'c1',
        tableName: 'string',
        type: 'PRIMARY',
      },
      {
        columns: ['c1', 'c2'],
        name: 'c1',
        tableName: 'string',
        type: 'UNIQUE',
        enableConstraint: true,
        delayConfig: 'INITIALLY DEFERRED',
        refDatabase: 'db',
        refTable: 'table',
        refColumns: ['c1', 'c2'],
        deleteAction: 'CASCADE',
        updateAction: 'CASCADE',
        condition: 'condition',
      },
      {
        columns: ['c1', 'c2'],
        name: 'c1',
        tableName: 'string',
        type: 'FOREIGN',
        enableConstraint: true,
        delayConfig: 'INITIALLY DEFERRED',
        refDatabase: 'db',
        refTable: 'table',
        refColumns: ['c1', 'c2'],
        deleteAction: 'CASCADE',
        updateAction: 'CASCADE',
        condition: 'condition',
      },
      {
        columns: ['c1', 'c2'],
        name: 'c1',
        tableName: 'string',
        type: 'CHECK',
        enableConstraint: true,
        delayConfig: 'INITIALLY DEFERRED',
        refDatabase: 'db',
        refTable: 'table',
        refColumns: ['c1', 'c2'],
        deleteAction: 'CASCADE',
        updateAction: 'CASCADE',
        condition: 'condition',
      },
    ],
  },

  'PATCH /api/v1/constraint/getDeleteSql/:sid': {
    data: {
      beforeResource: {},
      resource: {},
      sql: 'delete constraint...',
    },
  },

  'PATCH /api/v1/constraint/getCreateSql/:sid': {
    data: {
      beforeResource: {},
      resource: {},
      sql: 'create constraint...',
    },
  },
};
