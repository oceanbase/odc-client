import { formatMessage } from '@/util/intl';
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

import { SQLCodePreviewer } from '@/component/SQLCodePreviewer';
import { Modal, Form, Input, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { IDatabase } from '@/d.ts/database';
import { getDefaultName } from '../CreateTaskConfirmModal/helper';

function SQLPreviewModal(props: {
  sql?: string;
  visible?: boolean;
  onClose: () => void;
  onOk: (Name?: string) => void;
  database?: IDatabase;
  isEdit: boolean;
  initName?: string;
  hideSqlPreview?: boolean;
  tips?: string;
  modelHeight?: number;
}) {
  const {
    sql,
    visible,
    onClose,
    onOk,
    database,
    isEdit = false,
    initName,
    hideSqlPreview = false,
    tips,
    modelHeight = 400,
  } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setConfirmLoading(false);
    if (initName) {
      form.setFieldValue('Name', initName);
    } else if (visible && database) {
      form.setFieldValue('Name', getDefaultName(database));
    }
  }, [visible]);

  const handleOk = async (name: string) => {
    onOk(name);
  };

  return (
    <Modal
      title={<span style={{ fontWeight: 400 }}>预览 SQL</span>}
      width={760}
      bodyStyle={{
        height: modelHeight,
      }}
      open={visible}
      onCancel={onClose}
      onOk={async () => {
        setConfirmLoading(true);
        await form
          .validateFields()
          .then((value) => {
            handleOk(value?.Name);
          })
          .catch(() => {
            setConfirmLoading(false);
            return false;
          });
      }}
      confirmLoading={confirmLoading}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Alert message={tips} type="info" showIcon style={{ marginBottom: '16px' }} />
        {!hideSqlPreview && (
          <div
            style={{
              flex: 1,
              position: 'relative',
              border: '1px solid var(--odc-border-color)',
              marginBottom: '16px',
            }}
          >
            <SQLCodePreviewer readOnly language="sql" value={sql} />
          </div>
        )}

        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value.trim() === '') {
                    return Promise.reject(new Error('请输入作业名称'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            name={'Name'}
            label={'作业名称'}
          >
            <Input maxLength={200} showCount />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
export default SQLPreviewModal;
