import getVersion from './version';
import pkg from "@oceanbase-odc/monaco-plugin-ob/package.json"

const MONACO_VERSION = pkg.version?.replace(/\./g,'_');

module.exports = function (type) {
  const base = {
    RELEASE_DATE: Date.now(),
    ODC_VERSION: getVersion(),
    HAVEOCP: process.env.HAVEOCP,
    MONACO_VERSION
  };
  const path = './define/' + (type || 'default')
  return Object.assign(base, require(path));
};
