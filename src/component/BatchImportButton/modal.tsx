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

import ODCDragger from '@/component/OSSDragger';
import login from '@/store/login';
import { formatMessage, getLocalTemplate } from '@/util/intl';
import { downloadFile } from '@/util/utils';
import { InfoCircleFilled } from '@ant-design/icons';
import { Alert, Button, Drawer, Form, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import type { UploadFile } from 'antd/lib/upload/interface';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { getLocale } from '@umijs/max';
import styles from './index.less';
// 20M
const MAX_FILE_SIZE = 1024 * 1024 * 20;

interface IProps {
  visible: boolean;
  action: string;
  description: string;
  templateName: string;
  data?: any;
  getResultByFiles: (files: UploadFile[]) => any[];
  previewContent: (content: any[]) => React.ReactNode;
  onChange: (files: UploadFile[]) => UploadFile[];
  onSubmit: (files: UploadFile[]) => void;
  onClose: () => void;
}

const BatchImportModal: React.FC<IProps> = (props) => {
  const {
    visible,
    action,
    description,
    templateName,
    data = null,
    getResultByFiles,
    previewContent,
    onSubmit,
    onClose,
    onChange,
  } = props;
  const [result, setResult] = useState([]);
  const [form] = useForm();
  const content = getResultByFiles(result);
  const hasError = result?.some((item) => item.status === 'error');
  const hasContentError = content?.some((item) => item.errorMessage);
  const disableSubmit = hasError || hasContentError || !result?.length;

  const handleReset = () => {
    form.resetFields();
    setResult([]);
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { contentFile } = values;
        onSubmit(contentFile);
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  const handleBeforeUpload = (file) => {
    const isLimit = MAX_FILE_SIZE > file.size;
    if (!isLimit) {
      form.setFields([
        {
          name: 'contentFile',
          errors: [
            formatMessage({
              id: 'odc.component.BatchImportButton.modal.TheFileExceedsTheLimit',
            }), //文件超过限制
          ],
        },
      ]);
    }
    return isLimit;
  };

  const handleFileChange = ({ fileList }) => {
    const result = onChange(fileList);
    setResult(result);
    form.setFieldsValue({
      contentFile: result,
    });
  };

  const handleDownload = () => {
    downloadFile(getLocalTemplate(templateName));
  };

  useEffect(() => {
    if (!visible) {
      handleReset();
    }
  }, [visible]);

  return (
    <Drawer
      width={520}
      title={formatMessage({
        id: 'odc.component.BatchImportButton.modal.BatchImport',
      })} /*批量导入*/
      footer={
        <Space>
          <Button onClick={handleCancel}>
            {
              formatMessage({
                id: 'odc.component.BatchImportButton.modal.Cancel',
              }) /*取消*/
            }
          </Button>
          <Button type="primary" onClick={handleSubmit} disabled={disableSubmit}>
            {formatMessage({ id: 'odc.component.BatchImportButton.modal.Import' }) /*导入*/}
          </Button>
        </Space>
      }
      destroyOnClose
      open={visible}
      onClose={handleCancel}
      footerStyle={{
        textAlign: 'right',
      }}
    >
      <Alert
        showIcon
        type="info"
        icon={<InfoCircleFilled style={{ fontSize: '14px' }} />}
        description={
          <div style={{ lineHeight: '14px' }}>
            {description}
            <Button type="link" onClick={handleDownload}>
              {
                formatMessage({
                  id: 'odc.component.BatchImportButton.modal.DownloadTemplate',
                }) /*下载模版*/
              }
            </Button>
          </div>
        }
      />

      <Form form={form} layout="vertical" requiredMark="optional" style={{ marginTop: '12px' }}>
        <Form.Item className={styles['batch-import']} name="contentFile">
          <ODCDragger
            accept=".xls,.xlsx"
            uploadFileOpenAPIName="UploadFile"
            beforeUpload={handleBeforeUpload}
            data={data}
            multiple={false}
            maxCount={1}
            action={action}
            headers={{
              'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
              'Accept-Language': getLocale(),
              currentOrganizationId: login.organizationId?.toString(),
            }}
            fileList={result}
            onChange={handleFileChange}
          >
            <p className={styles.tip}>
              {
                formatMessage({
                  id: 'odc.component.BatchImportButton.modal.ClickOrDragTheFile',
                }) /*点击或将文件拖拽到这里上传*/
              }
            </p>
            <p className={styles.desc}>
              {
                formatMessage({
                  id: 'odc.component.BatchImportButton.modal.SupportedExtensionExtension',
                }) /*支持扩展名：.xls，.xlsx*/
              }
            </p>
          </ODCDragger>
        </Form.Item>
        {!!result?.length && (
          <Form.Item
            label={formatMessage({
              id: 'odc.component.BatchImportButton.modal.ImportObjectPreview',
            })}
            /*导入对象预览*/ required
          >
            <div className={styles.preview}>{previewContent(content)}</div>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default BatchImportModal;
