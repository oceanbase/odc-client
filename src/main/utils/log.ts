import log from 'electron-log';
import path from 'path';
/**
 * 日志文件分割粒度
 */
log.transports.file.maxSize = 1024 * 1024 * 3;
log.transports.file.resolvePath = (v) => {
  return path.join(v.userData, '/logs/client/' + v.fileName);
};
log.catchErrors({
  showDialog: false,
  onError(error, versions, submitIssue) {
    log.error(
      `Unhandle Error!!!!!!${error.stack}\n os:${versions.os} | app:${versions.app} | os:${versions.os}`,
    );
  },
});

export default log;
