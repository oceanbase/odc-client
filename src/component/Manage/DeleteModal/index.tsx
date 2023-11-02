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

import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Alert, Input, Modal, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

export const CommonDeleteModal: React.FC<{
  type: string;
  description: string;
  name: string;
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}> = ({ type, description, visible, name, onCancel, onOk }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!visible) {
      setValue('');
    }
  }, [visible]);

  const handleChange = (e) => {
    setValue(e.target.value);
    setError(false);
  };

  const handleDelete = () => {
    if (value !== name) {
      setError(true);
      return false;
    }
    onOk();
  };

  return (
    <Modal
      open={visible}
      title={
        formatMessage(
          {
            id: 'odc.components.CommonDeleteModal.DeleteType',
          },

          { type },
        )
        // `删除${type}`
      }
      okText={formatMessage({ id: 'odc.components.CommonDeleteModal.Delete' })}
      /* 删除 */ cancelText={formatMessage({
        id: 'odc.components.CommonDeleteModal.Cancel',
      })}
      /* 取消 */ okButtonProps={{
        danger: true,
        type: 'default',
      }}
      onOk={handleDelete}
      onCancel={onCancel}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          showIcon
          icon={<ExclamationCircleFilled color="#ff4d4f" />}
          message={description}
          type="error"
        />

        <Space size={5}>
          <span>
            {
              formatMessage(
                {
                  id: 'odc.components.CommonDeleteModal.TypeName',
                },

                { type },
              )
              /* {type}名称: */
            }
          </span>
          <span>{name}</span>
        </Space>
        <Space size={5}>
          {
            formatMessage({
              id: 'odc.components.CommonDeleteModal.Enter',
            })
            /* 请输入 */
          }

          <span style={{ color: '#ff4d4f' }}>{name}</span>
          {
            formatMessage({
              id: 'odc.components.CommonDeleteModal.ConfirmTheOperation',
            })
            /* 以确认操作 */
          }
        </Space>
        <Input
          value={value}
          onChange={handleChange}
          placeholder={
            formatMessage(
              {
                id: 'odc.components.CommonDeleteModal.EnterName',
              },
              { name },
            ) // `请输入${name}`
          }
        />
        {error && (
          <span className={styles.errors}>
            {
              formatMessage({
                id: 'odc.components.CommonDeleteModal.IncorrectInputInformation',
              }) /* 输入信息有误 */
            }
          </span>
        )}
      </Space>
    </Modal>
  );
};
