const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const md5 = crypto.createHash('md5');




module.exports = function (type) {
  const base = {
    RELEASE_DATE: Date.now(),
    HAVEOCP: process.env.HAVEOCP
  };
  const path = './define/' + (type || 'default')
  return Object.assign(base, require(path));
};
