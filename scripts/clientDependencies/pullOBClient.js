const { oss } = require('./util');
const tar = require('tar');
const fs = require('fs');
const path = require('path');

const run = async function () {
  console.log('开始下载 OBClient');
  const isSuccess = await oss.download(
    `library/obclient/1_2_8/windows/obclient.tar.gz`,
    'libraries',
    'obclient.tar.gz',
  );
  if (!isSuccess) {
    process.exit(1);
  }
  console.log('下载完成，开始解压');
  const tarPath = path.resolve(process.cwd(), 'libraries/obclient.tar.gz');
  await tar.x({
    file: tarPath,
    cwd: path.resolve(process.cwd(), 'libraries'),
    filter: (filePath) => {
      const fileName = path.basename(filePath);
      if (fileName.indexOf('.') === 0) {
        return false
      }
      return true;
    }
  });
  console.log('解压完成，删除压缩包');
  fs.unlinkSync(tarPath);
  console.log(tarPath, '删除完成');
};

