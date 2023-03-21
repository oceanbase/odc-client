export default {
  'GET /api/v1/other/isConfigIntercept': {
    errCode: null,
    errMsg: null,
    data: false,
    importantMsg: false,
  },
  'GET /api/v1/info': {
    errCode: null,
    errMsg: null,
    data: {
      buildTime: 1614581941.079,
      loginUrl: '',
      logoutUrl: 'https://taobao.com',
      startTime: 1614592273.387,
      version: '2.4.0-20210226',
      webResourceLocation: null,
    },
    importantMsg: false,
  },
  'GET /api/v1/time': {
    data: Date.now() + 1500,
  },
};
