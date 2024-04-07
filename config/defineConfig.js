import getVersion from './version';
module.exports = function (type) {
  const base = {
    RELEASE_DATE: Date.now(),
    ODC_VERSION: getVersion(),
    HAVEOCP: process.env.HAVEOCP
  };
  const path = './define/' + (type || 'default')
  return Object.assign(base, require(path));
};
