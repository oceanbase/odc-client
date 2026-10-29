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
import login from '@/store/login';
import { observer } from 'mobx-react';
import { Button, Menu, Modal, Space, Typography } from 'antd';
import React, { useState } from 'react';
import { toNumber } from 'lodash';

import styles from './index.less';

interface IProps {
  open: boolean;
  onOk: (id: number) => void;
}

export default observer(function OrganizationSelectModal({ open, onOk }: IProps) {
  const organizations = login.organizations;
  const [selectedKey, setSelectedKey] = useState(null);
  return (
    <Modal
      className={styles.organizationModal}
      open={open}
      closable={false}
      title={
        <div>
          <Typography.Title level={5}>
            {formatMessage({
              id: 'src.component.OrganizationSelectModal.EDDC445E',
              defaultMessage: '请先选择一个默认空间',
            })}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {formatMessage({
              id: 'src.component.OrganizationSelectModal.21D23DE2',
              defaultMessage: '选择后，也可在左侧导航切换',
            })}
          </Typography.Text>
        </div>
      }
      footer={
        <Button
          disabled={!selectedKey}
          type="primary"
          onClick={() => {
            onOk(toNumber(selectedKey));
          }}
        >
          {formatMessage({
            id: 'src.component.OrganizationSelectModal.F08D9948',
            defaultMessage: '确定',
          })}
        </Button>
      }
    >
      <div className={styles.selectBox}>
        <Menu
          selectedKeys={selectedKey ? [selectedKey] : []}
          onSelect={(info) => {
            setSelectedKey(info.key);
          }}
          mode="inline"
          items={organizations?.map((ora) => {
            return {
              label: ora.displayName,
              key: ora.id?.toString(),
            };
          })}
        />
      </div>
    </Modal>
  );
});
