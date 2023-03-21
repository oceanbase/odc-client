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
      const fileName = await uploadFileToOSS(file, props.uploadFileOpenAPIName, null);
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
