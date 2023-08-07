
module.exports = function (type) {
  const base = {
    RELEASE_DATE: Date.now(),
    HAVEOCP: process.env.HAVEOCP
  };
  const path = './define/' + (type || 'default')
  return Object.assign(base, require(path));
};
