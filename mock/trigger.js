export default {
  'GET /api/v1/trigger/list/:sid': {
    data: [
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        triggerName: '触发器1',
        enableState: 'ENABLED',
      },
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        triggerName: '触发器2',
        enableState: 'DISABLED',
        status: 'INVALID',
      },
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        triggerName: '触发器3',
        enableState: 'DISABLED',
      },
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        triggerName: '触发器4',
        enableState: 'ENABLED',
      },
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        triggerName: '触发器5',
        enableState: 'DISABLED',
      },
    ],
  },
  'GET /api/v1/trigger/:sid': {
    data: {
      triggerName: '触发器5',
      enableState: 'DISABLED',
      owner: 'owner_test1',
      baseObject: {
        name: 'trigger name',
        owner: 'trigger owner',
        type: 'TABLE',
        status: '有效',
      },
      correlation: [
        {
          name: 'name 1',
          owner: 'owner 1',
          type: 'type 1',
          status: 'status 1',
        },
        {
          name: 'name 2',
          owner: 'owner 2',
          type: 'type 2',
          status: 'status 2',
        },
        {
          name: 'name 3',
          owner: 'owner 3',
          type: 'type 3',
          status: 'status 3',
        },
      ],
      ddl: 'test ddl string',
    },
  },
  'GET /api/v1/trigger/getCreateSql/:sid': {
    data: {
      sql: 'create trigger test sql 1',
    },
  },
};
