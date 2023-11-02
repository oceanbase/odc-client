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

import { uploadSSLFileUrl } from '@/common/network/other';
import { formatMessage } from '@/util/intl';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { getLocale } from '@umijs/max';

interface IProps {
  label?: string;
  value?: string;
  onChange?: (file: string) => void;
}

const SingleUpload: React.FC<IProps> = function ({
  label = formatMessage({
    id: 'odc.AddConnectionForm.SSLItem.SingleUploadFile.UploadAPemFile',
  }), //上传 PEM 文件
  value,
  onChange,
}) {
  const [innerFile, _setInnerFile] = useState<UploadFile>(null);
  function setInnerFile(file: UploadFile) {
    _setInnerFile(file);
    if (file?.uid !== value && !['error', 'uploading'].includes(file?.status)) {
      const objectId = file?.response?.data?.contents?.[0]?.objectId;
      onChange(objectId);
    }
  }
  useEffect(() => {
    if (value) {
      _setInnerFile({
        uid: value,
        name: formatMessage({
          id: 'odc.AddConnectionForm.SSLItem.SingleUploadFile.UploadedFile',
        }), //已上传文件
      });
    } else {
      _setInnerFile(null);
    }
  }, [value]);
  const fileList: UploadFile[] = !innerFile ? [] : [innerFile];
  return (
    <Upload
      action={uploadSSLFileUrl}
      maxCount={1}
      fileList={fileList}
      headers={{
        'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
        'Accept-Language': getLocale(),
      }}
      onChange={(info) => {
        const { file, fileList } = info;
        if (file.status === 'removed') {
          setInnerFile(null);
          return;
        }
        setInnerFile(file);
      }}
    >
      {value ? null : <Button icon={<UploadOutlined />}>{label}</Button>}
    </Upload>
  );
};

export default SingleUpload;
