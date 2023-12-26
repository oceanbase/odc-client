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

import { generateDatabaseSid } from '@/common/network/pathUtil';
import request from './request';
import logger from './logger';

// 上传文件到 OSS
// @see https://help.aliyun.com/document_detail/64047.html
export async function uploadFileToOSS(file, uploadFileOpenAPIName, sessionId, onProgress?: (e: any) => void) {
  // 1. 获取文档上传坐标
  const uploadMeta = await request.post('/api/v2/cloud/resource/generateTempCredential', {
    data: {
      fileName: file.name,
    },
  });
  if (!uploadMeta?.data) {
    return null;
  }
  const {
    filePath,
    bucket: bucketName,
    region,
    endpoint,
    securityToken,
    accessKeySecret,
    accessKeyId,
  } = uploadMeta.data;
  // 3. 上传文件
  const S3 = await import('aws-sdk/clients/s3').then((module) => module.default);
  let beginTime, uploadTime, pullTime;
  const s3 = new S3({
    credentials: {
      secretAccessKey: accessKeySecret,
      accessKeyId: accessKeyId,
      sessionToken: securityToken,
    },
    endpoint: endpoint,
    region: region,
    httpOptions: {
      timeout: 60 * 15 * 1000,
    },
  });
  const isSuccess = await new Promise((resolve) => {
    beginTime = Date.now();
    const req = s3.putObject(
      {
        Bucket: bucketName,
        Body: file,
        ContentDisposition: 'attachment',
        Key: filePath,
      },
      (err, data) => {
        if (err) {
          resolve(false);
        } else {
          resolve(data);
        }
      },
    );
    // 获取进度
    req.on('httpUploadProgress', (e) => {
      const newP = {...e, percent: 0};
      if (e.total > 0) {
        /**
         * 后续还需要后端去pull资源，空出10%当作pull时间
         */
        newP.percent = (e.loaded / e.total) * 100 * 0.9;
      }
      onProgress?.(newP)
    })
  });
  uploadTime = Date.now();
  if (!isSuccess) {
    return null;
  }
  if (!uploadFileOpenAPIName) {
    return filePath;
  }
  // 3. 报告记录
  const resUpload = await request.post('/api/v2/aliyun/specific/asyncUpload', {
    data: {
      bucketName,
      objectName: filePath,
      region,
      sid: generateDatabaseSid(null, sessionId),
      type: uploadFileOpenAPIName
    },
  });
  const uploadId = resUpload.data;
  if (!uploadId) {
    return null;
  }
  async function getResult() {
    const result = await request.get("/api/v2/aliyun/specific/getUploadResult/" + uploadId);
    if (result?.isError) {
      pullTime = Date.now();
      logger.info('upload:', (uploadTime - beginTime)/1000, 'pull:', (pullTime - uploadTime)/1000)
      return null;
    } else if (result?.data) {
      pullTime = Date.now();
      logger.info('upload:', (uploadTime - beginTime)/1000, 'pull:', (pullTime - uploadTime)/1000)
      return result?.data;
    } else {
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 3000);
      }).then(() => getResult())
    }
  }
  return await getResult();
}

// 下载传输任务文件
export async function downloadTransferTaskFile(taskId) {
  // 获取下载文件坐标
  const fileInfo = await request.post('/api/v2/aliyun/specific/DownloadTransferFile', {
    data: {
      taskId: taskId,
      sid: generateDatabaseSid(),
    },
  });
  if (fileInfo.data) {
    window.open(fileInfo.data, '_blank');
  }
}

// 下载异步任务文件
export async function downloadAsyncTaskFile(fileName) {
  // 获取下载文件坐标
  const fileInfo = await request.post('/api/v2/aliyun/specific/DownloadFile', {
    data: {
      fileName,
      sid: generateDatabaseSid(),
    },
  });
  if (fileInfo.data) {
    window.open(fileInfo.data, '_blank');
  }
}
