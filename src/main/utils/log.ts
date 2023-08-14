/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
