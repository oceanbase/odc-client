import defineConfig from './defineConfig';
import routes from './routes';

export default {
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
      target: 'http://localhost:8989',
    },
  },
  // 路由配置，客户端不需要 Login
  routes: routes
};
