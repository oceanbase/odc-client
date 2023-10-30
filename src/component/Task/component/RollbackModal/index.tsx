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

import { RollbackType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import type { RadioChangeEvent } from 'antd';
import { Modal, Radio, Space, Typography } from 'antd';
import React, { useState } from 'react';
const { Text } = Typography;

interface IProps {
  open: boolean;
  generateRollbackPlan: boolean;
  onOk: (type: RollbackType) => void;
  onCancel: () => void;
}

const RollBackModal: React.FC<IProps> = (props) => {
  const { open, onOk, onCancel } = props;
  const [value, setValue] = useState<RollbackType>(RollbackType.CUSTOM);
  const disabledRef = true;

  const handleChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  const handleOk = () => {
    onOk(value);
  };

  return (
    <Modal
      title={formatMessage({ id: 'odc.component.RollbackModal.Rollback' })}
      /*回滚*/ open={open}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Space direction="vertical">
        <Text>
          {formatMessage({ id: 'odc.component.RollbackModal.RollbackScheme' }) /*回滚方案*/}
        </Text>
        <Text type="secondary">
          {
            formatMessage({
              id: 'odc.component.RollbackModal.ToRollBackDatabaseChanges',
            }) /*数据库变更回滚需重新发起新的工单并执行，请先选择回滚方案*/
          }
        </Text>
        <Radio.Group onChange={handleChange} value={value}>
          <Radio value={RollbackType.REF} disabled={disabledRef}>
            {
              formatMessage({
                id: 'odc.component.RollbackModal.ReferenceSystemGeneratedSolutions',
              }) /*引用系统生成的方案*/
            }
          </Radio>
          <Radio value={RollbackType.CUSTOM}>
            {formatMessage({ id: 'odc.component.RollbackModal.Custom' }) /*自定义*/}
          </Radio>
        </Radio.Group>
      </Space>
    </Modal>
  );
};

export default RollBackModal;
