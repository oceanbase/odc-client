const mockJs = require('mockjs');

export default {
  'GET /api/v1/task/list/:id': {
    ...mockJs.mock({
      'data|1-10': [
        {
          extendInfo: null,
          'gmtCreate|1610510145027-1610519145027': 1,
          gmtModify: null,
          'id|1-1000': 1,
          taskDetail: null,
          'taskName|1-15': /\w/,
          'taskStatus|1': ['INIT', 'ERROR', 'SUCCESS', 'STOP', 'RUNNING'],
          taskType: 'MOCK',
          'userId|1-100': 1,
        },
      ],
    }),
  },

  'GET /api/v1/task/tasks/list/': {
    data: {
      ...mockJs.mock({
        'infos|1-100': [
          {
            'connectionName|1-30': /\w/,
            'name|1-15': /\w/,
            'createTime|1610510145027-1610519145027': 1,
            'status|1': ['PREPARING', 'RUNNING', 'FAILED', 'CANCELED', 'DONE'],
            'id|1-1000': 1,
          },
        ],
      }),
    },
  },

  'DELETE /api/v1/task/:id': mockJs.mock({
    data: true,
  }),

  'GET /api/v1/task/:id': mockJs.mock({
    'id|1-10': 1,
    'userId|1-10': '12',
    taskType: 'DATAMOCK',
    taskName: '@word(10)',
    taskStatus: 'SUCCESS|FAILURE|RUNNING|KILLED',
    taskDetail: null,
    extendInfo: null,
    gmtCreate: {},
    gmtModify: {},
  }),

  'GET /api/v1/task/:id': {
    data: {
      infos: [
        {
          connectionName: 'ceshi',
          createTime: 1618223767000,
          id: 36,
          name: 'async_ceshi_SYS_20210412183449',
          status: 'CANCELED',
        },
        {
          connectionName: 'ceshi',
          createTime: 1618223688000,
          id: 35,
          name: 'async_ceshi_SYS_20210412183414',
          status: 'DONE',
        },
        {
          connectionName: 'ceshi',
          createTime: 1618223654000,
          id: 34,
          name: 'async_ceshi_SYS_20210412182215',
          status: 'DONE',
        },
        {
          connectionName: 'ceshi',
          createTime: 1618222935000,
          id: 33,
          name: 'async_ceshi_SYS_20210412182132',
          status: 'DONE',
        },
        {
          connectionName: 'ceshi',
          createTime: 1618222891000,
          id: 32,
          name: 'async_ceshi_SYS_20210412182034',
          status: 'DONE',
        },
        {
          connectionName: 'zeyuan_oms_71-oracle',
          createTime: 1618218567000,
          id: 30,
          name: 'async_zeyuan_oms_71-oracle_OBSCHEMA_20210412170840',
          status: 'DONE',
        },
        {
          connectionName: 'zeyuan_oms_71-oracle',
          createTime: 1618217949000,
          id: 29,
          name: 'async_zeyuan_oms_71-oracle_OBSCHEMA_20210412165836',
          status: 'DONE',
        },
        {
          connectionName: 'oracle-2275',
          createTime: 1618212778000,
          id: 28,
          name: 'async_oracle-2275_chz_20210412152931',
          status: 'CANCELED',
        },
        {
          connectionName: 'oracle-2275',
          createTime: 1618212571000,
          id: 27,
          name: 'async_oracle-2275_chz_20210412152700',
          status: 'DONE',
        },
        {
          connectionName: 'oracle-2275',
          createTime: 1618212092000,
          id: 26,
          name: 'async_oracle-2275_chz_20210412152034',
          status: 'CANCELED',
        },
      ],
      total: 19,
    },
    durationMillis: 3,
    errCode: null,
    errMsg: null,
    importantMsg: false,
    server: 'k69d03109.eu95sqa',
    timestamp: 1618223794.042,
    traceId: '366c043365b8438a',
  },
  // 'GET /api/v1/task/tasks/detail/:id': { "data": { "createTime": 1618222935000, "description": null, "failCount": 1, "id": 33, "log": null, "name": "async_ceshi_SYS_20210412182132", "parameters": "{\"errorStrategy\":\"ABORT\",\"sqlContent\":null,\"sqlFileName\":\"sql-test.sql\",\"timeoutMillis\":172800000}", "records": ["ErrorCode: 942, table or view 'SYS.A1' does not exist"], "result": "{\"failCount\":1,\"records\":[\"ErrorCode: 942, table or view 'SYS.A1' does not exist\"],\"successCount\":0}", "sqlContent": null, "sqlFileName": "sql-test.sql", "status": "DONE", "successCount": 0 }, "durationMillis": 2, "errCode": null, "errMsg": null, "importantMsg": false, "server": "k69d03109.eu95sqa", "timestamp": 1618223234.897000000, "traceId": "1624791b36ae4968" }

  'GET /api/v1/task/tasks/detail/:id': {
    data: {
      createTime: 1618211457000,
      description: null,
      failCount: 1,
      id: 16,
      log: null,
      name: 'async_oracle-2275_legend_20210412151012',
      parameters:
        '{"errorStrategy":"CONTINUE","sqlContent":"select 1 from dual;\\nselect 1;\\n","sqlFileName":null,"timeoutMillis":172800000}',
      records: [
        "ErrorCode: 900, ORA-00900: You have an error in your SQL syntax; check the manual that corresponds to your OceanBase version for the right syntax to use near '1' at line 1",
      ],
      result:
        '{"failCount":1,"records":["ErrorCode: 900, ORA-00900: You have an error in your SQL syntax; check the manual that corresponds to your OceanBase version for the right syntax to use near \'1\' at line 1"],"successCount":1}',
      sqlContent: 'select 1 from dual;\nselect 1;\n',
      sqlFileName: null,
      status: 'DONE',
      successCount: 1,
    },
    durationMillis: 2,
    errCode: null,
    errMsg: null,
    importantMsg: false,
    server: 'k69d03109.eu95sqa',
    timestamp: 1618223346.859,
    traceId: '80683856fb61432d',
  },

  'PUT /api/v1/task/tasks/cancel/:id': {
    data: true,
    durationMillis: 2,
    errCode: null,
    errMsg: null,
    importantMsg: false,
    server: 'k69d03109.eu95sqa',
    timestamp: 1618223771.315,
    traceId: 'c22a5cfe83fa4519',
  },
  'DELETE /api/v1/task/tasks/:id': {
    data: true,
    durationMillis: 3,
    errCode: null,
    errMsg: null,
    importantMsg: false,
    server: 'k69d03109.eu95sqa',
    timestamp: 1618223794.988,
    traceId: '7e9cb6023c10437c',
  },
};
