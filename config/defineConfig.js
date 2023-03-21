const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const md5 = crypto.createHash('md5');

const worker = fs
  .readFileSync(path.resolve(__dirname, '../src/workers/sql-oceanbase-oracle.worker.min.js'))
  .toString();

const result = md5.update(worker).digest('hex');

const MONACO_VERSION = result.substring(0, 2) + result.substring(8, 12) + result.substring(28, 2);

module.exports = function (type) {
  const base = {
    RELEASE_DATE: Date.now(),
    MONACO_VERSION,
    HAVEOCP: process.env.HAVEOCP
  };
  const path = './define/' + (type || 'default')
  return Object.assign(base, require(path));
};
