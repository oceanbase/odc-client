/**
 * 把假的文件先删除，然后创建一个link到hidden.yaml文件
 */


const path = require('path');
const fs = require('fs');

// 参数 preinstall 和 postinstall
// preinstall 代表install
// postinstall 代表install完成之后

const lockFilePath = path.join(process.cwd(), 'hidden.yaml');

const fakeLockFilePath = path.join(process.cwd(), 'pnpm-lock.yaml');
console.log('init install lock file')

if (fs.existsSync(fakeLockFilePath)) {
    fs.unlinkSync(fakeLockFilePath);
}

fs.symlinkSync(lockFilePath, fakeLockFilePath, 'file');



