const pkg = require('../../package.json');
const path =require('path')
const jarUrl = `odc-build/${pkg.version}/jar/odc-slim.jar`;
const pluginUrl = `odc-build/${pkg.version}/plugins`;
const { oss } = require('./util');

exports.run = async function () {
  const plugins = await oss.getOSSFolderFiles(pluginUrl)
  for (let plugin of plugins) {
    const pluginFileName = path.relative(pluginUrl, plugin.name);
    const isSuccess = await oss.download(plugin.name, 'libraries/java/plugins', pluginFileName);
    if (!isSuccess) {
      console.error('Download plugin failed', pluginFileName)
      process.exit(-1);
    }
  }
  await oss.download(jarUrl, 'libraries/java', 'odc.jar');
};

