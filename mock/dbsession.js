export default {
  // 获取会话列表
  'GET /api/v1/dbsession/list/:sid': {
    data: new Array(200).fill(undefined).map((_, i) => ({
      command: 'string',
      database: `db${i}`,
      dbUser: `dbUser${i}`,
      executeTime: 0,
      obproxyIp: `ip${i}`,
      sessionId: i,
      sql: Math.random() > 0.5 ? `sql${i}` : null,
      srcIp: 'string',
      status: 'string',
    })),
  },

  // 获取关闭会话 SQL
  'PATCH /api/v1/dbsession/getDeleteSql/:sid': {
    data: {
      beforeResource: {},
      resource: {},
      sql: 'close dbsessions sql...',
      tip: 'string',
    },
  },
};
