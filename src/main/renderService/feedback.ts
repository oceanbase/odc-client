import archiver from 'archiver';
import { app, dialog } from 'electron';
import fs from 'fs';
import os from 'os';
import path from 'path';
import pkg from '../../../package.json';
import { getJavaLogPath } from '../utils';
import log from '../utils/log';

export default async function () {
  const files = [];
  files.push({
    path: getJavaLogPath(),
    isDirectory: true,
    name: 'javaLog',
  });
  files.push({
    path: log.transports.file.getFile().path,
    name: 'main.log',
  });
  log.info(files);
  log.info(app.getPath('logs'));
  const fileName = 'odc_feedback_' + Date.now() + '.zip';
  const result = await dialog.showSaveDialog({
    defaultPath: path.join(app.getPath('desktop'), fileName),
    title: '保存ODC反馈文件',
  });
  if (!result?.filePath) {
    return;
  }
  log.info('保存反馈文件：', result.filePath);

  const output = fs.createWriteStream(result.filePath);
  const archive = archiver('zip');

  output.on('close', function () {
    log.info(archive.pointer() + ' total bytes');
    log.info('压缩文件写入关闭');
  });

  archive.on('error', function (err) {
    throw err;
  });
  archive.pipe(output);
  files.forEach((file) => {
    if (file.isDirectory) {
      archive.directory(file.path, file.name);
    } else {
      archive.append(fs.createReadStream(file.path), { name: file.name });
    }
  });
  archive.append(
    `os: ${os.type()}
        platform: ${os.platform()}
        arch: ${os.arch()}
        os_release: ${os.release()}
        uptime: ${os.uptime()}
        mem: ${os.totalmem()}
        cpu: ${JSON.stringify(os.cpus())}
        version: ${pkg?.version}
        env: ${JSON.stringify(process.env)}
        `,
    { name: 'odc.txt' },
  );
  archive.finalize();
  log.info('压缩结束');
}
