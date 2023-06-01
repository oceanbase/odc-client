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
        { path: '/gateway/*', component: '@/page/Gateway' },
        {
          path: '/',
          component: '../layout/UserWrapper',
          routes: [
            {
              path: '/',
              component: '../layout/SpaceContainer',
              routes: [
                { path: '/project', component: '@/page/Project/Project' },
                { path: '/project/:id/:page', component: '@/page/Project' },
                { path: '/datasource', component: '@/page/Datasource/Datasource' },
                { path: '/datasource/:id/:page', component: '@/page/Datasource' },
                { path: '/task', component: '@/page/Task' },
                { path: '/auth/:page', component: '@/page/Auth' },
                { path: '/secure/:page', component: '@/page/Secure' },
                { path: '/externalIntegration/:page', component: '@/page/ExternalIntegration' },
              ],
            },
            {
              path: '/login',
              name: 'login',
              component: '@/page/Login',
              spmBPos: 'b41895',
            },
            {
              path: '/',
              component: '../layout/DefaultContainer',
              routes: [
                {
                  path: '/spaceIndex',
                  name: 'SpaceIndex',
                  component: '@/page/SpaceIndex',
                },
                {
                  path: '/sqlworkspace',
                  wrappers: [
                    "@/layout/ThemeWrap"
                  ],
                  name: 'sqlworkspace',
                  component: '@/page/Workspace',
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
  