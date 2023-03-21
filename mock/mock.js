const mockJs = require('mockjs');

export default {
  'GET /api/v1/mock/list/:userid': {
    ...mockJs.mock({
      'data|1-10': [
        {
          extendInfo: null,
          'gmtCreate|1610520145027-1610529145027': 1,
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

  'DELETE /api/v1/mock/delete/:id': mockJs.mock({
    'data|1-2': true,
  }),

  'GET /api/v1/mock/detail/:id': {
    data: mockJs.mock({
      'id|1-10': 1,
      'userId|1-10': '12',
      taskType: 'MOCK',
      taskName: '@word(10)',
      taskStatus: 'SUCCESS',
      taskDetail:
        '{"tables":[{"tableName":"EMP","totalCount":2000,"batchSize":10,"whetherTruncate":true,"strategy":"IGNORE","columns":[{"columnName":"COL","typeConfig":{"columnType":"NUMBER","lowValue":"0","highValue":"100000","generator":"UNIFORM_GENERATOR","precision":"10","scale":"2"}},{"columnName":"COL2","typeConfig":{"columnType":"NUMBER","lowValue":"0","highValue":"999","generator":"UNIFORM_GENERATOR","precision":"5","scale":"2"}},{"columnName":"COL3","typeConfig":{"columnType":"NUMBER","lowValue":"0","highValue":"999","generator":"UNIFORM_GENERATOR","precision":"5","scale":"2"}},{"columnName":"COL4","typeConfig":{"columnType":"NUMBER","lowValue":"0","highValue":"999","generator":"UNIFORM_GENERATOR","precision":"5","scale":"2"}}],"schemaName":"fanqiu"}]}',
      extendInfo: null,
      gmtCreate: {},
      gmtModify: {},
    }),
  },

  'PUT /api/v1/mock/stop/:id': mockJs.mock({
    'data|1-2': true,
  }),
};
