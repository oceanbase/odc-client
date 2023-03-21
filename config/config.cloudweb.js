/**
 * 公有云使用的 Web 版本
 */
import defineConfig from './defineConfig';
import routes from './routes';
export default {
  define: defineConfig('cloudweb'),

  //@see https://code.alipay.com/bigfish/bigfish/pull_requests/1556
  mountElementId: 'root-slave',

  runtimePublicPath: true,
  dynamicImport: {
    loading: "@/component/Loading"
  },
  dynamicImportSyntax: {},
  // publicPath: 'https://gw.alipayobjects.com/as/g/oceanbase/sqlConsole/renderer/',
  // 路由配置，客户端不需要 Login
  routes: routes
};
