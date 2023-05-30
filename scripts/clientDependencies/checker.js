const path = require('path');
const fs = require('fs');

const fileList = [
  path.resolve(process.cwd(), 'libraries/java/odc.jar'),
  // path.resolve(process.cwd(), 'libraries/obclient/obclient.exe'),
];

module.exports = function () {
  for (const filePath of fileList) {
    if (!fs.existsSync(filePath)) {
      console.error('文件校验失败，文件名：', filePath);
      process.exit(1);
    }
    console.log('文件校验成功: ', filePath);
  }
};
