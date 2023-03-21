const { download } = require('./clientDependencies/util');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const run = async function () {
  console.log('开始下载文档包');
  const isSuccess = await download(
    `https://ob-front.oss-cn-hangzhou.aliyuncs.com/docs/${pkg.version}/doc.zip`,
    'public/help-doc',
    'doc.zip',
  );
  if (!isSuccess) {
    process.exit(1);
  }
  console.log('下载完成，开始解压');
  const zipPath = path.resolve(process.cwd(), 'public/help-doc/doc.zip');
  var zip = new AdmZip(zipPath);
  zip.extractAllTo(path.resolve(process.cwd(), 'public/help-doc/'), true);
  console.log('解压完成，删除压缩包');
  fs.unlinkSync(zipPath);
  console.log(zipPath, '删除完成');
};

run()
