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

import {
  CsvColumnMapping,
  DataTransferTaskLogType,
  DbObjectType,
  ExportFormData,
  EXPORT_CONTENT,
  EXPORT_TYPE,
  FILE_DATA_TYPE,
  ImportFormData,
  IMPORT_CONTENT,
  IMPORT_TYPE,
  TaskType,
} from '@/d.ts';
import odc from '@/plugins/odc';
import request from '@/util/request';
import { encrypt } from '@/util/utils';
import { stringSeparatorToCRLF } from '@/util/data/string';
import { isNil } from 'lodash';

export async function getExportObjects(
  databaseId: number,
  type?: DbObjectType,
  cid?: number,
): Promise<{
  [key in DbObjectType]: string[];
}> {
  const result = await request.get(`/api/v2/dataTransfer/getExportObjects`, {
    params: {
      connectionId: cid,
      databaseId,
      objectType: type,
    },
  });
  const r = result?.data || {};
  Object.keys(r).forEach((key) => {
    r[key.toUpperCase()] = r[key];
    if (key !== key.toUpperCase()) {
      delete r[key];
    }
  });
  return r;
}

export async function createBatchExportTask(formData: ExportFormData) {
  const transferData = formData.exportContent !== EXPORT_CONTENT.STRUCT;
  const transferDDL = formData.exportContent !== EXPORT_CONTENT.DATA;
  const serverParams = {
    taskName: formData.taskName,
    dataTransferFormat: formData.dataTransferFormat,
    encoding: formData.encoding,
    exportFilePath: formData.exportFilePath,
    transferDDL,
    transferData,
    transferType: 'EXPORT',
    batchCommitNum: formData.batchCommit ? formData.batchCommitNum : undefined,
    globalSnapshot: formData.globalSnapshot,
    mergeSchemaFiles: formData.mergeSchemaFiles,
    exportFileMaxSize: formData.exportFileMaxSize,
    withDropDDL: transferDDL ? formData.withDropDDL : undefined,
    exportDbObjects: formData.exportDbObjects?.filter((obj) => {
      if (!transferDDL && obj.dbObjectType !== DbObjectType.table) {
        /**
         * 只导出数据的时候，只有表符合要求。
         */
        return false;
      }
      return true;
    }),
    exportAllObjects: formData.exportAllObjects,
    csvConfig:
      formData.dataTransferFormat === EXPORT_TYPE.CSV
        ? {
            skipHeader: !formData.withColumnTitle,
            blankToNull: formData.blankToNull,
            columnSeparator: formData.columnSeparator,
            columnDelimiter: formData.columnDelimiter,
            lineSeparator: stringSeparatorToCRLF(formData.lineSeparator),
            encoding: formData.encoding,
          }
        : null,
    sysUser: formData.useSys ? formData.sysUser : null,
    sysPassword: formData.useSys ? encrypt(formData.sysUserPassword) : null,
    overwriteSysConfig: formData.overwriteSysConfig,
  };
  // 单表导入需要传递表名
  const ret = await request.post('/api/v2/flow/flowInstances/', {
    data: {
      projectId: formData?.projectId,
      databaseName: formData?.databaseName,
      databaseId: formData?.databaseId,
      taskType: TaskType.EXPORT,
      executionStrategy: formData?.executionStrategy,
      executionTime: formData?.executionTime,
      description: formData?.description,
      parameters: {
        ...serverParams,
      },
    },
  });
  return ret && ret.data;
}

export async function createBatchImportTask(
  formData: ImportFormData,
  tableName?: string,
  csvColumnMappings?: CsvColumnMapping[],
) {
  let dataTransferFormat = formData.importFileName?.[0]?.response?.data?.format;
  /**
   * 导入数据
   */
  const importData = formData.importContent !== IMPORT_CONTENT.STRUCT;
  /**
   * 含有不导入的数据类型
   */
  const haveSkipDataType =
    importData &&
    (IMPORT_TYPE.CSV == formData.fileType || formData.dataTransferFormat === FILE_DATA_TYPE.CSV);
  const importStruct = formData.importContent !== IMPORT_CONTENT.DATA;
  const isSqlFileType = formData.fileType == IMPORT_TYPE.SQL;
  const isCsvFileType = formData.fileType == IMPORT_TYPE.CSV;
  if (isSqlFileType) {
    dataTransferFormat = FILE_DATA_TYPE.SQL;
  } else if (isCsvFileType) {
    dataTransferFormat = FILE_DATA_TYPE.CSV;
  }
  let serverParams = {
    transferType: 'IMPORT',
    dataTransferFormat,
    encoding: formData.encoding,
    importFileName: formData.importFileName?.map?.((res) => {
      return res?.response?.data?.fileName;
    }),
    stopWhenError: formData.stopWhenError,
    fileType: formData.fileType,
    transferDDL: !isNil(formData.importContent) && formData.importContent !== IMPORT_CONTENT.DATA,
    transferData: formData.importContent !== IMPORT_CONTENT.STRUCT,
    sysUser: formData.useSys ? formData.sysUser : null,
    sysPassword: formData.useSys ? encrypt(formData.sysUserPassword) : null,
    overwriteSysConfig: formData.overwriteSysConfig,
    exportDbObjects: tableName
      ? [
          {
            dbObjectType: DbObjectType.table,
            objectName: tableName,
          },
        ]
      : null,
  };
  /**
   * SQL文件不需要下列的参数
   */
  if (!isSqlFileType) {
    serverParams = Object.assign(serverParams, {
      ...serverParams,
      batchCommitNum: importData ? formData.batchCommitNum : undefined,
      truncateTableBeforeImport: importData ? formData.truncateTableBeforeImport : undefined,
      skippedDataType: haveSkipDataType ? formData.skippedDataType : undefined,
      replaceSchemaWhenExists: importStruct ? formData.replaceSchemaWhenExists : undefined,
    });
  }
  if (isCsvFileType) {
    serverParams = Object.assign(serverParams, {
      ...serverParams,
      csvConfig: {
        skipHeader: formData.skipHeader,
        blankToNull: formData.blankToNull,
        columnSeparator: formData.columnSeparator,
        columnDelimiter: formData.columnDelimiter,
        lineSeparator: stringSeparatorToCRLF(formData.lineSeparator),
        fileName: serverParams.importFileName?.[0],
        encoding: serverParams.encoding,
      },
      csvColumnMappings,
    });
  }
  const ret = await request.post('/api/v2/flow/flowInstances/', {
    data: {
      projectId: formData?.projectId,
      databaseName: formData?.databaseName,
      databaseId: formData?.databaseId,
      taskType: TaskType.IMPORT,
      executionStrategy: formData?.executionStrategy,
      executionTime: formData?.executionTime,
      description: formData?.description,
      parameters: {
        ...serverParams,
      },
    },
  });
  return ret && ret.data;
}

export function getImportUploadUrl() {
  return odc.appConfig.network?.baseUrl?.() + `/api/v2/dataTransfer/upload`;
}

export async function getCsvFileInfo(params: {
  blankToNull: boolean;
  columnSeparator: string;
  encoding: string;
  columnDelimiter: string;
  fileName: string;
  lineSeparator: string;
  skipHeader: boolean;
}): Promise<CsvColumnMapping[]> {
  const ret = await request.post(`/api/v2/dataTransfer/getCsvFileInfo`, {
    data: {
      ...params,
      lineSeparator: stringSeparatorToCRLF(params.lineSeparator),
    },
  });
  return ret?.data;
}

export async function deleteTask(taskId: number) {
  const res = await request.delete(`/api/v1/data/transfer/delete`, {
    data: {
      taskIdList: [taskId],
    },
  });
  return res?.data;
}
export async function killTask(taskId: number) {
  const res = await request.put(`/api/v1/data/transfer/cancel`, {
    data: {
      taskIdList: [taskId],
    },
  });
  return res?.data;
}
export async function retryTask(taskId: number) {
  const res = await request.put(`/api/v1/data/transfer/retry`, {
    data: {
      taskIdList: [taskId],
    },
  });
  return res?.data;
}

export async function getTaskInfoAndLog(
  taskId: number,
  logType: DataTransferTaskLogType = DataTransferTaskLogType.ALL,
) {
  const res = await request.get(`/api/v1/data/transfer/detail`, {
    params: {
      taskId,
      logType,
    },
  });
  return res?.data;
}

export async function getImportFileMeta(filePath: string, fileType: IMPORT_TYPE) {
  const res = await request.get(`/api/v2/dataTransfer/getMetaInfo`, {
    params: { fileName: filePath, fileType: fileType },
  });
  return res?.data;
}
