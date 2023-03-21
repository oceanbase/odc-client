export default {
  'PATCH /api/v1/sequence/getCreateSql/:sid': {
    data: {
      sql: 'Create Sequence ...',
    },
  },

  'PATCH /api/v1/sequence/getUpdateSql/:sid': {
    data: {
      sql: 'Update Sequence ...',
    },
  },

  'GET /api/v1/sequence/:sid': {
    data: {
      cacheSize: 100,
      cached: true,
      cycled: true,
      increament: 1,
      maxValue: 100,
      minValue: 2,
      name: 's1',
      orderd: true,
      startValue: 10,
      user: '100',
      ddl: 'ddl',
    },
  },

  'DELETE /api/v1/sequence/:sid': {
    data: true,
  },

  'GET /api/v1/sequence/list/:sid': {
    data: [
      {
        cacheSize: 100,
        cached: true,
        cycled: true,
        increament: 1,
        maxValue: 100,
        minValue: 2,
        name: 's1',
        orderd: true,
        startValue: 10,
        user: '100',
      },
      {
        cacheSize: 100,
        cached: true,
        cycled: true,
        increament: 1,
        maxValue: 100,
        minValue: 2,
        name: 's2',
        orderd: true,
        startValue: 10,
        user: '100',
      },
      {
        cacheSize: 100,
        cached: true,
        cycled: true,
        increament: 1,
        maxValue: 100,
        minValue: 2,
        name: 's3',
        orderd: true,
        startValue: 10,
        user: '100',
      },
    ],
  },
};
