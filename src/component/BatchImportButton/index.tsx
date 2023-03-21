import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Button } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BatchImportModal from './modal';

interface IProps {
  type?: 'button' | 'string';
  action: string;
  description: string;
  templateName: string;
  data?: any;
  getResultByFiles: (files: UploadFile[]) => any[];
  previewContent: (content: any[]) => React.ReactNode;
  onChange: (files: UploadFile[]) => UploadFile[];
  onSubmit: (files: UploadFile[]) => void;
}

const BatchImportButton = (props, ref) => {
  const { type = 'string', ...rest } = props;
  const [visible, setVisible] = useState(false);

  const handleClose = () => {
    setVisible(false);
  };

  const handleVisible = () => {
    setVisible(true);
  };

  useImperativeHandle(ref, () => {
    return {
      closeModal: handleClose,
    };
  });

  if (haveOCP()) {
    return null;
  }

  return (
    <>
      {type === 'button' ? (
        <Button onClick={handleVisible}>
          {
            formatMessage({
              id: 'odc.component.BatchImportButton.BatchImport',
            }) /*批量导入*/
          }
        </Button>
      ) : (
        <span onClick={handleVisible}>
          {
            formatMessage({
              id: 'odc.component.BatchImportButton.BatchImport',
            }) /*批量导入*/
          }
        </span>
      )}

      <BatchImportModal {...rest} visible={visible} onClose={handleClose} />
    </>
  );
};

export default forwardRef<any, IProps>(BatchImportButton);
