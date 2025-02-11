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
import { Form, Space, Checkbox, FormInstance, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { SyncTableStructureEnum } from '@/d.ts';
import { SyncTableStructureOptions } from '../../const';
import { IDatabase } from '@/d.ts/database';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';

interface IProps {
  form: FormInstance<any>;
  targetDatabase?: IDatabase;
}
const SynchronizationItem: React.FC<IProps> = ({ form, targetDatabase }) => {
  const [initValue, setInitValue] = useState(null);
  const [syncTableStructure, setSyncTableStructure] = useState<boolean>(false);

  useEffect(() => {
    setSyncTableStructure(Boolean(form.getFieldValue('syncTableStructure')?.length));
    setInitValue(form.getFieldValue('syncTableStructure'));
  }, [form.getFieldValue('syncTableStructure')]);

  return (
    <>
      <Form.Item
        extra={
          !syncTableStructure
            ? formatMessage({
                id: 'src.component.Task.component.SynchronizationItem.809B14B8',
                defaultMessage:
                  '任务调度前进行一次表结构比对，若源端和目标端表结构不一致，将跳过该表',
              })
            : ''
        }
        style={{ marginBottom: 8 }}
      >
        <Tooltip
          title={
            isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)
              ? formatMessage({
                  id: 'src.component.Task.component.SynchronizationItem.4A3BA52E',
                  defaultMessage: '选择的目标数据库为对象存储类型时，不支持该配置',
                })
              : undefined
          }
        >
          <Checkbox
            checked={syncTableStructure}
            disabled={isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)}
            onChange={(e) => {
              setSyncTableStructure(e.target.checked);
              if (initValue && initValue.length === 0 && e.target.checked) {
                form.setFieldValue('syncTableStructure', [
                  SyncTableStructureEnum.COLUMN,
                  SyncTableStructureEnum.CONSTRAINT,
                ]);
              }
            }}
          >
            {formatMessage({
              id: 'src.component.Task.component.SynchronizationItem.3B43C19D',
              defaultMessage: '开启目标表结构同步',
            })}
          </Checkbox>
        </Tooltip>
      </Form.Item>
      {syncTableStructure && (
        <Space size={4} align="center">
          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.component.SynchronizationItem.ABA6445B',
              defaultMessage: '同步范围',
            })}
            name="syncTableStructure"
            initialValue={[SyncTableStructureEnum.COLUMN, SyncTableStructureEnum.CONSTRAINT]}
            required
          >
            <Checkbox.Group options={SyncTableStructureOptions} />
          </Form.Item>
        </Space>
      )}
    </>
  );
};
export default SynchronizationItem;
