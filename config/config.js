import getVersion from './version';
import defineConfig from './defineConfig';
import theme from './theme';
import routes from './routes';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin' 
import path from 'path';

const version = getVersion();
console.log('git last commit: ', version);
/**
 * 关闭浏览器的版本提示，避免出现第三方cdn加载（阿里专有云安全需求）
 */
const disableBrowserUpdate = process.env.DISABLE_BROWSER_UPDATE;

let enableSourceMap = process.env.ENABLE_SOURCEMAP === "true";

console.log(disableBrowserUpdate);

let publicPath = '/';

const define = defineConfig();

const config = {
  mock: false,
  publicPath,
  esbuildMinifyIIFE: true,
  runtimePublicPath: {},
  hash: true,
  esbuildMinifyIIFE: true,
  targets: {
    chrome: 76,
    firefox: 60,
    edge: 79,
  },
  metas: [
    {
      name: 'version',
      content: version,
    },
  ],
  devtool: enableSourceMap ? "hidden-cheap-module-source-map" : (process.env.NODE_ENV === 'development' ? 'cheap-module-source-map' : false),

  antd: {
    import: true,
  },

  theme: theme,
  proxy: {
    // 本地开发或者对内 Site 应用的开发环境的代理配置
    '/api/v1/webSocket/obclient': {
      target: 'http://dev.odc-local.net:7001/proxy/96',
      ws: true,
    },
    '/api/': {
      target: 'http://dev.odc-local.net:7001/proxy/96',
    },
    '/oauth2/': {
      target: 'http://dev.odc-local.net:7001/proxy/96',
    },
    '/login/': {
      target: 'http://dev.odc-local.net:7001/proxy/96',
    }
  },

  locale: {
    default: 'en-US',
    antd: true,
  },
  title: false,
  favicons: [publicPath + 'img/favicon.png'],
  // ctoken: false,

  externals: {
    electron: 'commonjs electron',
  },
  alias: {
    "@@node_modules": path.resolve(process.cwd(), 'node_modules')
  },
  chainWebpack(config) {
    config.plugin('monaco').use(MonacoWebpackPlugin, [
      {
        filename: '[name].worker.js',
        languages: ['yaml', 'json']
      }
    ])
  },

  history: {
    type: 'hash',
  },

  outputPath: './dist/renderer',

  define,
  routes: routes,
};
if (disableBrowserUpdate) {
  delete config.browserUpdate;
}
config.headScripts = [
  `window.currentEnv=window.currentEnv || '${process.env.CURRENT_ENV || ''}'`,
  `window.publicPath=window.publicPath || '${publicPath}'`,
];
if (process.env.CURRENT_ENV === 'obcloud') {
  config.headScripts.push(
    `window.ODCApiHost='${config.proxy['/api/'].target}'`,
  );
} else {
  config.headScripts.push(`window.ODCApiHost= window.ODCApiHost || ''`);
}
export default config;
