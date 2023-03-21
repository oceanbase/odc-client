export default {
  'POST /api/v1/diagnose/explain/:sid': {
    data: {
      expTree:
        '{"children":{" TABLE SCAN   ":{"children":{},"cost":"38","depth":0,"id":2,"name":"city","operator":" TABLE SCAN   ","outputFilter":"output([1]), filter(nil), \\n      access([city.__pk_increment(0x7fbb78dacfb0)]), partitions(p0), \\n      is_index_back=false, \\n      range_key([city.__pk_increment(0x7fbb78d97e80)], [city.__pk_cluster_id(0x7fbb78d981e0)], [city.__pk_partition_id(0x7fbb78d98540)]), range(MIN,MIN,MIN ; MAX,MAX,MAX)always true\\n\\n","rowCount":"9"}},"cost":"78","depth":-1,"id":0,"name":"","operator":"SUBPLAN FILTER","outputFilter":"output([city.name(0x7fbb78d5e2f0)], [city.age(0x7fbb78d5e650)], [city.sex(0x7fbb78d5df90)], [city.ban(0x7fbb78d5e9b0)]), filter(nil), \\n      exec_params_(nil), onetime_exprs_([subquery(1)(0x7fbb78d4b3d0)]), init_plan_idxs_(nil)\\n  ","rowCount":"2"}',
      outline: 'string',
      outputFilters: {
        additionalProp1: 'string',
        additionalProp2: 'string',
        additionalProp3: 'string',
      },
    },
  },

  'PATCH /api/v1/function/getCreateSql/:sid': {
    errCode: null,
    errMsg: null,
    data: {
      sql: 'create or replace function 11(\n1 in 2) \nreturn 22 as \nv1 int; \nbegin \nend',
      resource: null,
      beforeResource: null,
      tip: null,
    },
    importantMsg: false,
  },

  'POST /api/v1/diagnose/getExecExplain/:sid': {
    data: {
      expTree: JSON.stringify({
        ID: 2,
        OPERATOR: 'SUBPLAN FILTER',
        NAME: 'SUBPLAN FILTER',
        'EST.ROWS': 989,
        COST: 35471817,
        output: [
          'antbill.ins_biz_no',
          'antbill.bill_no',
          'antbill.type',
          'antbill.merchant_account_type',
          'antbill.merchant_account_id',
          'antbill.user_account_type',
          'antbill.user_account_id',
          'antbill.pay_time',
          'antbill.pay_amount',
          'antbill.pay_flow_id',
          'antbill.createDate',
          'antbill.createTime',
          'antbill.medicare_card_pay_amount',
        ],
        'TABLE SCAN': {
          ID: 0,
          OPERATOR: 'TABLE SCAN',
          NAME: 'TABLE SCAN',
          'EST.ROWS': 989,
          COST: 885,
          output: [
            'antbill.bill_no',
            'antbill.ins_biz_no',
            'antbill.type',
            'antbill.merchant_account_type',
            'antbill.merchant_account_id',
            'antbill.user_account_type',
            'antbill.user_account_id',
            'antbill.pay_time',
            'antbill.pay_amount',
            'antbill.pay_flow_id',
            'antbill.createDate',
            'antbill.createTime',
            'antbill.medicare_card_pay_amount',
          ],
        },
      }),
      outline: 'string',
      outputFilters: {
        additionalProp1: 'string',
        additionalProp2: 'string',
        additionalProp3: 'string',
      },
    },
  },

  'POST /api/v1/diagnose/getExecDetail/:sid': {
    data: {
      affectedRows: 0,
      execTime: 30,
      hitPlanCache: true,
      physicalRead: 30,
      planType: 'string',
      queueTime: 10,
      reqTime: 0,
      returnRows: 0,
      rpcCount: 20,
      sql: 'string',
      sqlId: 'string',
      ssstoreRead: 10,
      totalTime: 100000,
      traceId: 'string',
      waitTime: 20,
    },
  },

  'PUT /api/v1/pl/compile/:sid': {
    errCode: null,
    errMsg: null,
    data: {
      messages: '0 rows affected',
      columns: null,
      types: null,
      typeNames: null,
      total: 0,
      rows: null,
      elapsedTime: 0.059,
      executeTimestamp: 1594630115850,
      executeSql: 'alter procedure PL_TEST compile',
      track: null,
      status: true,
      sqlType: null,
      dbObjectType: null,
      dbObjectName: null,
      traceId: null,
    },
    importantMsg: false,
  },

  'PUT /api/v1/pl/parsePLNameType/:sid': {
    data: {
      obDbObjectType: 'PROCEDURE', // PROCEDURE、FUNCTION、PACKAGE
      plName: 'aaaa',
    },
    errCode: '',
    errMsg: '',
    importantMsg: true,
  },

  'PUT /api/v1/pl/callFunction/:sid': {
    data: {
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
    // "errCode": "string",
    // "errMsg": "string",
    importantMsg: true,
  },
  'PUT /api/v1/pl/callProcedure/:sid': {
    errCode: null,
    errMsg: "ORA-00904: invalid identifier 'CHZ' in 'field list'",
    data: null,
    importantMsg: false,
  },

  'PUT /api/v1/pl/startDebugProcedure/:sid': {
    data: true,
  },

  'PUT /api/v1/pl/startDebugAnonymousBlock/:sid': {
    data: true,
  },

  'PUT /api/v1/pl/startDebugFunction/:sid': {
    data: true,
  },

  'PUT /api/v1/pl/endDebug/:sid': {
    data: true,
  },

  'PUT /api/v1/pl/deleteBreakpoint/:sid': {
    data: true,
  },

  'PUT /api/v1/pl/setBreakpoint/:sid': {
    errCode: null,
    errMsg: null,
    data: { plName: 'PL_TEST', lineNum: 2, breakPointNum: 1, errMsg: null },
    importantMsg: false,
  },

  'PUT /api/v1/pl/continueNextBreakpoint/:sid': {
    errCode: '1222',
    errMsg: '3333',
    data: {
      result: 0,
      message: ' run_info.breakpoint = 1, run_info.stackdepth = 1, run_info.reason = 3',
    },
    importantMsg: false,
  },

  'PUT /api/v1/pl/continueNextLine/:sid': {
    data: true,
  },

  'PUT /api/v1/pl/continueStepIn/:sid': {
    data: true,
  },

  'PUT /api/v1/pl/continueStepOut/:sid': {
    data: true,
  },

  'GET /api/v1/pl/printBacktrace/:sid': {
    errCode: null,
    errMsg: null,
    data: { plName: 'PL_TEST', lineNum: '2', terminated: '0' },
    importantMsg: false,
  },

  'GET /api/v1/pl/getRuntimeInfo/:sid': {
    data: {
      terminated: true,
    },
  },

  'GET /api/v1/pl/getLine/:sid': {
    errCode: null,
    errMsg: null,
    data: { line: '122\n222\n333', status: 1 },
    importantMsg: false,
  },

  'GET /api/v1/pl/getErrors/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      {
        attribute: 'string',
        line: 0,
        messageNumber: 0,
        name: 'string',
        position: 0,
        text: 'some error log',
        type: 'string',
      },
    ],
    importantMsg: false,
  },

  'GET /api/v1/pl/showBreakpoints/:sid': {
    errCode: null,
    errMsg: null,
    data: [{ plName: 'PL_TEST', lineNum: 2, breakPointNum: null, errMsg: null }],
    importantMsg: false,
  },

  'GET /api/v1/pl/getValues/:sid': {
    errCode: null,
    errMsg: null,
    data: [
      { varialbeName: 'P1', frameNum: null, result: null, value: '111' },
      { varialbeName: 'P2', frameNum: null, result: null, value: '222' },
      { varialbeName: 'P3', frameNum: null, result: null, value: '0' },
    ],
    importantMsg: false,
  },

  'PUT /api/v1/pl/abort/:sid': {
    data: true,
  },
  'PUT /api/v1/pl/getValue/:sid': {
    data: {
      frameNum: 0,
      result: 0,
      value: 'string',
      varialbeName: 'string',
    },
  },

  'GET /api/v1/pl/getPLDebugRunResult/:sid': {
    data: [
      {
        dataType: 'string',
        defaultValue: 'string',
        paramMode: 'string',
        paramName: 'string',
        seqNum: 0,
      },
    ],
  },

  'GET /api/v1/pl/getFuncDebugRunResult/:sid': {
    data: {
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
  },

  'GET /api/v1/resultset/getSingleTableName/:sid': {
    data: 't_test_1',
  },
};
