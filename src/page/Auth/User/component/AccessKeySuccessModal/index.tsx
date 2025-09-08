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

import { Alert, Button, Modal, Typography, message } from 'antd';
import { useState } from 'react';
import copy from 'copy-to-clipboard';
import styles from './index.less';
import { IAccessKey } from '@/d.ts/openAPI';

interface IProps {
  visible: boolean;
  accessKey: IAccessKey | null;
  onClose: () => void;
}

const AccessKeySuccessModal: React.FC<IProps> = ({ visible, accessKey, onClose }) => {
  const [copying, setCopying] = useState(false);

  const handleCopyCredentials = () => {
    if (!accessKey) return;

    setCopying(true);
    try {
      const credentials = `AccessKey ID: ${accessKey.accessKeyId}\nAccessKey Secret: ${accessKey.secretAccessKey}`;
      const success = copy(credentials);
      if (success) {
        message.success('复制成功');
      } else {
        message.error('复制失败');
      }
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败');
    } finally {
      setCopying(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="AccessKey 创建成功"
      width={520}
      footer={null}
      onCancel={onClose}
      destroyOnClose
      className={styles.successModal}
    >
      <div className={styles.container}>
        <Alert
          type="warning"
          showIcon
          message="请妥善保管 AccessKey ID 和 Secret，当前弹窗关闭后将无法查询 Secret。"
          className={styles.alertTip}
        />

        {accessKey && (
          <>
            <div className={styles.credentialsBox}>
              <div className={styles.credentialItem}>
                <Typography.Text type="secondary">AccessKey ID:</Typography.Text>
                <span className={styles.value}>{accessKey.accessKeyId}</span>
              </div>
              <div className={styles.credentialItem}>
                <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                  AccessKey Secret:
                </Typography.Text>
                <span className={styles.value}>{accessKey.secretAccessKey}</span>
              </div>
            </div>

            <Button
              type="primary"
              loading={copying}
              onClick={handleCopyCredentials}
              className={styles.copyButton}
            >
              复制 ID 和 Secret
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AccessKeySuccessModal;
