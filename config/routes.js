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
        { path: '/odc/gateway/*', redirect: '/gateway/*'},
        { path: '/gateway/*', component: '@/page/Gateway', spmBPos: 'b41899' },
        {
          path: '/',
          component: '../layout/UserWrapper',
          routes: [
            {
              path: '/',
              component: '../layout/SpaceContainer',
              wrappers: [
                "@/layout/OrganizationListenWrap"
              ],
              routes: [
                { path: '/project', component: '@/page/Project/Project', spmBPos: 'b64002' },
                { path: '/project/:id/:page', component: '@/page/Project', spmBPos: 'b64003' },
                { path: '/datasource', component: '@/page/Datasource/Datasource', spmBPos: 'b64004' },
                { path: '/datasource/:id/:page', component: '@/page/Datasource', spmBPos: 'b64005' },
                { path: '/task', component: '@/page/Task', spmBPos: 'b64006' },
                { path: '/auth/:page', component: '@/page/Auth', spmBPos: 'b64007' },
                { path: '/secure/:page', component: '@/page/Secure', spmBPos: 'b64008' },
                { path: '/externalIntegration/:page', component: '@/page/ExternalIntegration', spmBPos: 'b64009' },
                { path: '/', redirect: '/project'},
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
                // {
                //   path: '/spaceIndex',
                //   name: 'SpaceIndex',
                //   component: '@/page/SpaceIndex',
                //   spmBPos: 'b64001'
                // },
                {
                  path: '/sqlworkspace',
                  wrappers: [
                    "@/layout/OrganizationListenWrap",
                    "@/layout/ThemeWrap"
                  ],
                  name: 'sqlworkspace',
                  component: '@/page/Workspace',
                  spmBPos: 'b41896'
                },
                {
                  path: '/sqlworkspace/:tabKey/:datasourceId',
                  wrappers: [
                    "@/layout/OrganizationListenWrap",
                    "@/layout/ThemeWrap"
                  ],
                  name: 'sqlworkspaceSingle',
                  component: '@/page/Workspace',
                  spmBPos: 'b41896'
                },
              ],
            }
          ],
        },
      ],
    },
    {
      path: '/exception/403',
      name: '403',
      component: '@/page/Exception/403',
      spmBPos: 'b41897',
    },
    {
      path: '/*',
      component: '@/page/Exception/404',
      spmBPos: 'b41898',
    },
  ];
  