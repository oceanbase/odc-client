const pkg = require('../../package.json');

const jarUrl = `odc-build/${pkg.version}/jar/odc-slim.jar`;
const { oss } = require('./util');

exports.run = async function () {
  await oss.download(jarUrl, 'libraries/java', 'odc.jar');
};

