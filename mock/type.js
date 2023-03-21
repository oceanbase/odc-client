export default {
  'GET /api/v1/type/list/:sid': {
    data: [
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        typeName: '触发器1',
      },
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        typeName: '触发器2',
      },
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        typeName: '触发器3',
      },
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        typeName: '触发器4',
      },
      {
        ddl: 'test ddl string',
        definer: 'test definer string',
        typeName: '触发器5',
      },
    ],
  },
  'GET /api/v1/type/:sid': {
    data: {
      typeName: '触发器5',
      owner: 'owner_test1',
      ddl: 'test ddl string',
      variables: [
        {
          varName: 'v1',
          varType: 'number',
        },
        {
          varName: 'v2',
          varType: 'varchar2(100)',
        },
      ],
      functions: [
        {
          ddl: 'string',
          definer: 'string',
          funName: 'string',
          params: [
            {
              dataType: 'string',
              defaultValue: 'string',
              paramMode: 'string',
              paramName: 'string',
              seqNum: 0,
            },
          ],
          returnType: 'string',
          returnValue: 'string',
          types: [
            {
              typeName: 'string',
              typeVariable: 'string',
            },
          ],
          variables: [
            {
              varName: 'string',
              varType: 'string',
            },
          ],
        },
      ],
      procedures: [
        {
          ddl: 'string',
          definer: 'string',
          params: [
            {
              dataType: 'string',
              defaultValue: 'string',
              paramMode: 'string',
              paramName: 'string',
              seqNum: 0,
            },
          ],
          proName: 'string',
          types: [
            {
              typeName: 'string',
              typeVariable: 'string',
            },
          ],
          variables: [
            {
              varName: 'string',
              varType: 'string',
            },
          ],
        },
      ],
    },
  },
  'GET /api/v1/type/getCreateSql/:sid': {
    data: {
      sql: 'create type test sql 1',
    },
  },
};
