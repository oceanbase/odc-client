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
