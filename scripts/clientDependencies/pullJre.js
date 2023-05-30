const { oss } = require('./util');
const AdmZip = require('adm-zip');
const execSync = require('child_process').execSync
const fs = require('fs');
const path = require('path');

const platform = process.env.platform || 'mac';

exports.run = async function () {
  console.log('开始下载 Jre');
  const jrePath = path.resolve(process.cwd(), 'libraries/jre');
  if (fs.existsSync(jrePath)) {
    fs.rmSync(jrePath, { recursive: true, force: true });
  }
  const isSuccess = await oss.download(
    `library/jre/${platform}/jre.zip`,
    'libraries/jre',
    'jre.zip',
  );
  if (!isSuccess) {
    process.exit(1);
  }
  console.log('下载完成，开始解压');
  const jreZipPath = path.resolve(process.cwd(), 'libraries/jre/jre.zip');
  var zip = new AdmZip(jreZipPath);
  zip.extractAllTo(path.resolve(process.cwd(), 'libraries/jre/'), true);
  if (platform.includes('linux')) {
    execSync('chmod -R a+x ' + path.resolve(process.cwd(), 'libraries/jre/'), {
      stdio: 'inherit'
    })
  }
  console.log('解压完成，删除压缩包');
  fs.unlinkSync(jreZipPath);
  console.log(jreZipPath, '删除完成');
};
