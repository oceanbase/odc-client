import defineConfig from './defineConfig';
import routes from './routes';

export default {
  // windows 下无法安装 @ali/xconsole，导致构建客户端失败，因此客户端使用 stub
  alias: {
    '@ali/xconsole': '../util/xconsoleStub',
  },

  define: defineConfig('client'),
  targets: {
    chrome: 83,
  },
  proxy: {
    // 本地开发或者对内 Site 应用的开发环境的代理配置
    '/api/v1/webSocket/obclient': {
      target: 'http://localhost:8989',
      ws: true,
    },
    '/api/': {
      // target: 'http://11.124.185.132',
      // target: 'http://100.81.152.104:8989',
      // target: 'http://100.81.152.113:9000',
      // target: 'http://100.81.152.113:8989',
      target: 'http://localhost:8989',
    },
  },
  // 路由配置，客户端不需要 Login
  routes: routes
};
