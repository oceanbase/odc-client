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
    if (file?.uid !== value) {
      const objectId = file?.response?.data?.contents?.[0]?.objectId;
      onChange(objectId);
    }
    _setInnerFile(file);
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
