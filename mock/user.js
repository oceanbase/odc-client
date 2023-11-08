export default {
  'POST /api/v1/user/login': (req, res) => {
    res.setHeader(
      'set-cookie',
      'X-Token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6Inpob25neGluLnd6eCIsImV4cCI6MTYxMjI2MjkxMCwiaWF0IjoxNjEyMjM0MTEwLCJ1c2VyQ29kZSI6Inpob25neGluLnd6eEBhbnRmaW4uY29tIn0.E2YHW-3ACHk7RVDR0iMiTAMncoDvz5H2U3TJ9NnRsco;path=/',
    );
    res.end(
      JSON.stringify({
        data: true,
      }),
    );
  },
  'POST /api/v1/user/logout': (req, res) => {
    res.setHeader('set-cookie', 'X-Token=;Max-Age=0;domain=localhost;path=/;');
    res.end(
      JSON.stringify({
        data: true,
      }),
    );
  },
  'GET /api/v1/user/getCurrentUser': {
    // errCode: "LoginExpired",
    // errMsg: "Token已失效，请重新授权",
    // data: null,
    errCode: null,
    errMsg: null,
    data: {
      id: 69,
      name: 'admin',
      email: 'admin@oceanbase1024.com',
      password: 'admin',
      role: null,
      status: 1,
      desc: null,
      gmtCreated: null,
      gmtModified: null,
      enabled: true,
    },
    importantMsg: false,
  },

  'POST /api/v1/user/create': {
    data: true,
  },

  'PUT /api/v1/user/update': {
    data: true,
  },

  // 判断用户名是否存在
  '/api/v1/user/isUserExists': {
    data: false,
  },

  // 判断用户密码是否正确
  'POST /api/v1/user/userValidate': {
    data: true,
  },

  '/api/v1/script/:id': {
    // errCode: 'LoginExpired',
    // errMsg: 'please login...',
    data: {
      gmtCreate: 1,
      gmtModify: 1,
      id: 1,
      scriptName: 'script1script1script1script1script1script1',
      scriptText: `sq1 
      111
      222
      
      333`,
      scriptType: 'PL',
      userId: 1,
    },
  },

  '/api/v1/script/list/:userId': {
    data: [
      {
        gmtCreate: 1,
        gmtModify: 1,
        id: 1,
        scriptName: 'script1',
        scriptText: 'sql1...',
        scriptType: 'PL',
        userId: 1,
      },
      {
        gmtCreate: 1,
        gmtModify: 1,
        id: 2,
        scriptName: 'script2',
        scriptText: 'sql2...',
        scriptType: 'SQL',
        userId: 1,
      },
    ],
  },

  'POST /api/v1/script/:userId': {
    data: {
      id: 100,
      scriptName: '1111',
      scriptText: 'xxx',
    },
  },

  'DELETE /api/v1/script/:id': {
    data: {},
  },

  'PUT /api/v1/script/:id': {
    data: {},
  },

  'GET /api/v1/users/me/configurations': {
    data: [
      {
        key: 'sqlexecute.defaultDelimiter',
        value: '//',
      },
      {
        key: 'sqlexecute.mysqlAutoCommitMode',
        value: 'OFF',
      },
      {
        key: 'sqlexecute.oracleAutoCommitMode',
        value: 'OFF',
      },
      {
        key: 'sqlexecute.defaultQueryLimit',
        value: '200',
      },
    ],
  },
};
