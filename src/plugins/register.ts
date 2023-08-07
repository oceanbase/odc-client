import * as _4a from './4a';
import odc from './odc';
import plugins from './pluginList';

export default function () {
  _4a.apply(odc);
  plugins?.forEach((plugin) => {
    plugin.apply(odc);
  });
}
