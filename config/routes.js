module.exports = [
    {
      path: '/lock',
      component: '@/page/Lock',
      spmBPos: 'b46783',
    },
    {
      path: '/',
      component: '../layout/AppContainer',
      routes: [
        { path: '/gateway/*', component: '@/page/Gateway', spmBPos: 'b41899' },
        {
          path: '/',
          component: '../layout/UserWrapper',
          routes: [
            { layout: false },
            { path: '/index', redirect: '/index/connection' },
            { path: '/index/:page', wrappers: ['../layout/ThemeWrap'], component: '@/page/Index' },
            { path: '/', redirect: '/connections', spmBPos: 'b46782' },
            {
              path: '/login',
              name: 'login',
              component: '@/page/Login',
              spmBPos: 'b41895',
            },
            // 工作台
            {
              path: '/workspace/session/:tabKey/:sessionId',
              // name: 'workspace',
              // icon: 'table',
              component: '@/page/Workspace',
              wrappers: ['../layout/ThemeWrap'],
              spmBPos: 'b41896',
            },
            {
              path: '/',
              component: '../layout/DefaultContainer',
              routes: [
                // 数据库连接列表
                {
                  path: '/connections',
                  name: 'session.list',
                  icon: 'table',
                  spmBPos: 'b41879',
                  redirect: '/index',
                },
                {
                  path: '/manage/:activeKey',
                  name: 'manage',
                  icon: 'table',
                  component: '@/page/Manage',
                  wrappers: ['../layout/ThemeWrap'],
                  spmBPos: 'b41894',
                },
                {
                  path: '/exception/403',
                  name: '403',
                  component: '@/page/Exception/403',
                  spmBPos: 'b41897',
                },
                {
                  component: '@/page/Exception/404',
                  spmBPos: 'b41898',
                },
              ],
            },
            {
              component: '@/page/Exception/404',
              spmBPos: 'b41898',
            },
          ],
        },
      ],
    },
  ];
  