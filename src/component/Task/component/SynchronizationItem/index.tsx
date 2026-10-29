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
import { SyncTableStructureOptions } from '@/component/Task/const';
import { IDatabase } from '@/d.ts/database';
import { isConnectTypeBeFileSystemGroup } from '@/util/database/connection';

interface IProps {
  form: FormInstance<any>;
  targetDatabase?: IDatabase;
}
const SynchronizationItem: React.FC<IProps> = ({ form, targetDatabase }) => {
  const [createTargetTableIfNotExists, setCreateTargetTableIfNotExists] = useState<boolean>(false);

  const tempCreateTargetTableIfNotExist = Form.useWatch('createTargetTableIfNotExists');

  useEffect(() => {
    setCreateTargetTableIfNotExists(Boolean(form.getFieldValue('createTargetTableIfNotExists')));
  }, [tempCreateTargetTableIfNotExist]);

  return (
    <>
      <Form.Item
        name="createTargetTableIfNotExists"
        extra={formatMessage({
          id: 'src.component.Task.component.SynchronizationItem.E0B0D399',
          defaultMessage: '若目标数据库中不存在归档表，则根据源端数据库中的表结构自动创建',
        })}
        style={{ marginBottom: 24 }}
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
            checked={createTargetTableIfNotExists}
            disabled={isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)}
            onChange={(e) => {
              form.setFieldValue('createTargetTableIfNotExists', e.target.checked);
            }}
          >
            {formatMessage({
              id: 'src.component.Task.component.SynchronizationItem.DFB3357C',
              defaultMessage: '目标表结构不存在时自动创建',
            })}
          </Checkbox>
        </Tooltip>
      </Form.Item>
    </>
  );
};
export default SynchronizationItem;
