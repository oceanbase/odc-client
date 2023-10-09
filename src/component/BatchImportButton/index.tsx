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
  noButton?: boolean;
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
      openModal: () => {
        handleVisible();
      },
    };
  });

  if (haveOCP()) {
    return null;
  }

  if (props.noButton) {
    return <BatchImportModal {...rest} visible={visible} onClose={handleClose} />;
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
