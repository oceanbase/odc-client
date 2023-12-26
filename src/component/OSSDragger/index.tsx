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

import { getImportFileMeta } from '@/common/network/exportAndImport';
import setting from '@/store/setting';
import { uploadFileToOSS } from '@/util/aliyun';
import { Upload } from 'antd';
import { DraggerProps } from 'antd/lib/upload';
import React from 'react';

interface IProps extends DraggerProps {
  uploadFileOpenAPIName?: string;
  clientMode?: boolean;
}

const ODCDragger: React.FC<IProps> = function (props) {
  props = { ...props };
  if (setting.isUploadCloudStore) {
    // @ts-ignore
    delete props.action;
    // @ts-ignore
    props.customRequest = async ({ file, onSuccess, onError, onProgress }) => {
      const fileName = await uploadFileToOSS(file, props.uploadFileOpenAPIName, null, onProgress);
      setTimeout(() => {
        onSuccess(
          {
            data: fileName,
          },
          file as any,
        );
      }, 0);
    };
  }
  if (props?.clientMode) {
    props.customRequest = async ({ file, filename, onSuccess }) => {
      const data = await getImportFileMeta((file as any).path);
      setTimeout(() => {
        onSuccess(
          {
            data: data,
          },
          file as any,
        );
      }, 0);
    };
  }

  return <Upload.Dragger {...props}>{props.children}</Upload.Dragger>;
};
export default ODCDragger;
