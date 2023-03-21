export default {
  'GET /api/v1/package/list/:sid': {
    data: [
      {
        packageBody: null,
        packageHead: null,
        packageName: 'hellopkg',
        packageType: 'string',
      },
    ],
  },

  'POST /api/v1/package/:sid': {
    data: [
      {
        packageBody: null,
        packageHead: null,
        packageName: 'hellopkg',
        packageType: 'string',
      },
    ],
  },

  'GET /api/v1/package/:sid': {
    data: {
      packageBody: {
        basicInfo: {
          createTime: {
            date: 0,
            day: 0,
            hours: 0,
            minutes: 0,
            month: 0,
            nanos: 0,
            seconds: 0,
            time: 0,
            timezoneOffset: 0,
            year: 0,
          },
          ddl:
            'create or replace package t_package is v1 number; type cur_emp is ref cursor; procedure append_proc(p1 in out varchar2, p2 number); function append_fun(p2 out varchar2) return varchar2; end',
          definer: 'string',
          modifyTime: {
            date: 0,
            day: 0,
            hours: 0,
            minutes: 0,
            month: 0,
            nanos: 0,
            seconds: 0,
            time: 0,
            timezoneOffset: 0,
            year: 0,
          },
          refer: 'string',
          referd: 'string',
        },
        functions: [
          {
            ddl: 'string',
            definer: 'string',
            funName: 'fun111',
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
            proName: 'pro111',
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
      packageHead: {
        basicInfo: {
          createTime: {
            date: 0,
            day: 0,
            hours: 0,
            minutes: 0,
            month: 0,
            nanos: 0,
            seconds: 0,
            time: 0,
            timezoneOffset: 0,
            year: 0,
          },
          ddl: 'string',
          definer: 'string',
          modifyTime: {
            date: 0,
            day: 0,
            hours: 0,
            minutes: 0,
            month: 0,
            nanos: 0,
            seconds: 0,
            time: 0,
            timezoneOffset: 0,
            year: 0,
          },
          refer: 'string',
          referd: 'string',
        },
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
      packageName: 'string',
      packageType: 'string',
    },
  },

  'DELETE /api/v1/package/:sid': {
    data: true,
  },

  'DELETE /api/v1/package/deletePackageBody/:sid': {
    data: true,
  },
};
