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

import type { EXPORT_TYPE } from '@/d.ts';
import { IMPORT_TYPE } from '@/d.ts';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { formatBytes } from '@/util/utils';
import { message, Upload } from 'antd';

export const MAX_FILE_SIZE = isClient() ? -1 : 1024 * 1024 * 1024 * 2;
export function checkImportFile(file, fileList?: any, silence?: boolean) {
  const { size } = file;
  if (MAX_FILE_SIZE === -1 || size <= MAX_FILE_SIZE) {
    return true;
  }
  if (!silence) {
    message.error(getSizeLimitTip());
  }
  return Upload.LIST_IGNORE;
}
export function getSizeLimitTip() {
  if (MAX_FILE_SIZE === -1) {
    return null;
  }
  const size = formatBytes(MAX_FILE_SIZE, 0);
  return formatMessage(
    {
      id: 'odc.ImportDrawer.ImportForm.helper.TheFileSizeCannotExceed.1',
    },
    { size },
  );
}

export function getFileTypeWithImportType(importType: IMPORT_TYPE | EXPORT_TYPE) {
  const _m = {
    [IMPORT_TYPE.ZIP]: '.zip',
    [IMPORT_TYPE.SQL]: '.sql',
    [IMPORT_TYPE.CSV]: '.csv, .txt',
  };

  return _m[importType];
}

export function getFileMIMETypeWithImportType(importType: IMPORT_TYPE | EXPORT_TYPE) {
  const _m = {
    // 使用MIME判断时, 不同浏览器的支持不一样, 如sql文件就无法被识别成application/sql, 因此采用文件名后缀的形式判断
    [IMPORT_TYPE.ZIP]: ['zip'],
    [IMPORT_TYPE.SQL]: ['sql'],
    [IMPORT_TYPE.CSV]: ['csv', 'txt'],
  };

  return _m[importType];
}
