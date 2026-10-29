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

import { Alert, Button, Modal, Popover, Space, Switch, Table, Tooltip, message } from 'antd';
import { getFormatDateTime } from '@/util/data/dateTime';
import { useState, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
  ExclamationCircleOutlined,
  InfoCircleFilled,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  getUserAccessKeys,
  createAccessKey,
  deleteAccessKey,
  setAccessKeyEnabled,
} from '@/common/network/manager';
import AccessKeySuccessModal from '../AccessKeySuccessModal';
import styles from './index.less';
import Typography from 'antd';
import { EAccessKeyStatu, IAccessKey } from '@/d.ts/openAPI';

interface IProps {
  visible: boolean;
  userId: number;
  onClose: () => void;
}

const AccessKeyManageModal: React.FC<IProps> = ({ visible, userId, onClose }) => {
  const [accessKeys, setAccessKeys] = useState<IAccessKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [newAccessKey, setNewAccessKey] = useState<IAccessKey | null>(null);

  const loadAccessKeys = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await getUserAccessKeys(userId);
      setAccessKeys(data);
    } catch (error) {
      message.error(
        formatMessage({
          id: 'src.page.Auth.User.component.AccessKeyManageModal.1F992449',
          defaultMessage: '获取 AccessKey 列表失败',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (userId: number, accessKey: string, enabled: boolean) => {
    try {
      await setAccessKeyEnabled(
        userId,
        accessKey,
        enabled ? EAccessKeyStatu.ACTIVE : EAccessKeyStatu.SUSPENDED,
      );

      await loadAccessKeys();

      message.success(
        enabled
          ? formatMessage({
              id: 'src.page.Auth.User.component.AccessKeyManageModal.AA5D359D',
              defaultMessage: '启用成功',
            })
          : formatMessage({
              id: 'src.page.Auth.User.component.AccessKeyManageModal.53F57084',
              defaultMessage: '停用成功',
            }),
      );
    } catch (error) {
      message.error(
        enabled
          ? formatMessage({
              id: 'src.page.Auth.User.component.AccessKeyManageModal.ED529DAC',
              defaultMessage: '启用失败',
            })
          : formatMessage({
              id: 'src.page.Auth.User.component.AccessKeyManageModal.9939C809',
              defaultMessage: '停用失败',
            }),
      );
    }
  };

  const handleDelete = async (userId: number, accessKey: string) => {
    try {
      await deleteAccessKey(userId, accessKey);

      setAccessKeys((prev) => prev.filter((item) => item.accessKeyId !== accessKey));
      message.success(
        formatMessage({
          id: 'src.page.Auth.User.component.AccessKeyManageModal.F52A5F0A',
          defaultMessage: '删除成功',
        }),
      );
    } catch (error) {
      message.error(
        formatMessage({
          id: 'src.page.Auth.User.component.AccessKeyManageModal.EA7090B2',
          defaultMessage: '删除失败',
        }),
      );
    }
  };

  const handleCreateAccessKey = async () => {
    try {
      const createdAccessKey = await createAccessKey(userId);
      loadAccessKeys();
      setNewAccessKey(createdAccessKey);
      setSuccessModalVisible(true);
    } catch (error) {
      message.error(
        formatMessage({
          id: 'src.page.Auth.User.component.AccessKeyManageModal.91AEEC1B',
          defaultMessage: '创建失败',
        }),
      );
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    setNewAccessKey(null);
  };

  const columns: ColumnsType<IAccessKey> = [
    {
      title: 'AccessKey ID',
      dataIndex: 'accessKeyId',
      key: 'accessKeyId',
      width: 348,
    },
    {
      title: formatMessage({
        id: 'src.page.Auth.User.component.AccessKeyManageModal.FC09BF14',
        defaultMessage: '创建时间',
      }),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },
    {
      title: formatMessage({
        id: 'src.page.Auth.User.component.AccessKeyManageModal.4900BFB6',
        defaultMessage: '启用状态',
      }),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Switch
          checked={status === EAccessKeyStatu.ACTIVE}
          onChange={(checked) => handleToggleEnabled(record?.userId, record?.accessKeyId, checked)}
        />
      ),
    },
    {
      title: formatMessage({
        id: 'src.page.Auth.User.component.AccessKeyManageModal.7219654E',
        defaultMessage: '操作',
      }),
      key: 'operation',
      width: 48,
      render: (_, record) => (
        <Tooltip
          title={
            record?.status === EAccessKeyStatu.ACTIVE
              ? formatMessage({
                  id: 'src.page.Auth.User.component.AccessKeyManageModal.966089C0',
                  defaultMessage: '启用状态暂不支持删除',
                })
              : ''
          }
        >
          <Button
            type="link"
            size="small"
            disabled={record?.status === EAccessKeyStatu.ACTIVE}
            onClick={() => handleDelete(record.userId, record.accessKeyId)}
          >
            {formatMessage({
              id: 'src.page.Auth.User.component.AccessKeyManageModal.B46C9E4A',
              defaultMessage: '删除',
            })}
          </Button>
        </Tooltip>
      ),
    },
  ];

  useEffect(() => {
    if (visible && userId) {
      loadAccessKeys();
    }
  }, [visible, userId]);

  return (
    <Modal
      open={visible}
      title={formatMessage({
        id: 'src.page.Auth.User.component.AccessKeyManageModal.BB773B07',
        defaultMessage: '管理 AccessKey',
      })}
      width={800}
      footer={null}
      onCancel={onClose}
      destroyOnClose
      className={styles.accessKeyModal}
      styles={{
        body: { height: '440px' },
      }}
    >
      <div className={styles.container}>
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleFilled className={styles.infoIcon} />}
          message={formatMessage({
            id: 'src.page.Auth.User.component.AccessKeyManageModal.EFC0D43F',
            defaultMessage:
              'AccessKey ID 和 AccessKey Secret 是访问 ODC API 的凭证，具有账号下的完全权限，请妥善保管',
          })}
          className={styles.alertTip}
        />

        <div className={styles.content}>
          <Table
            columns={columns}
            dataSource={accessKeys}
            loading={loading}
            rowKey="accessKeyId"
            pagination={false}
            size="middle"
            className={styles.accessKeyTable}
            locale={{ emptyText: null }}
          />

          <Tooltip
            title={
              accessKeys?.length >= 5
                ? formatMessage({
                    id: 'src.page.Auth.User.component.AccessKeyManageModal.E7D566A5',
                    defaultMessage: '最多可创建 5 个 AccessKey',
                  })
                : ''
            }
          >
            <Button
              type="dashed"
              className={
                accessKeys?.length >= 5 ? styles.disabledCreateAccessKey : styles.createAccessKey
              }
              onClick={handleCreateAccessKey}
              disabled={accessKeys?.length >= 5}
            >
              <PlusOutlined className={styles.icon} />
              {formatMessage({
                id: 'src.page.Auth.User.component.AccessKeyManageModal.1203EEC8',
                defaultMessage: '创建 AccessKey',
              })}{' '}
              <span className={styles.tips}>({accessKeys?.length}/5)</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      <AccessKeySuccessModal
        visible={successModalVisible}
        accessKey={newAccessKey}
        onClose={handleCloseSuccessModal}
      />
    </Modal>
  );
};

export default AccessKeyManageModal;
