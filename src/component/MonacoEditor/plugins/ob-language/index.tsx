import Plugin from '@alipay/monaco-plugin-ob';

let plugin = null;

export function register(): Plugin {
  if (plugin) {
    return plugin;
  }
  plugin = new Plugin();
  plugin.setup();
  return plugin;
}
