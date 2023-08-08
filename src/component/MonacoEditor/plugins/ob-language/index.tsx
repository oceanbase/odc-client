import Plugin from '@oceanbase-odc/monaco-plugin-ob';

let plugin = null;

export function register(): Plugin {
  if (plugin) {
    return plugin;
  }
  plugin = new Plugin();
  plugin.setup();
  return plugin;
}
