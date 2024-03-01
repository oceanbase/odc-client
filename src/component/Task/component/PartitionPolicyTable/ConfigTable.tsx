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

import DisplayTable from '@/component/DisplayTable';
import { IPartitionKeyConfig, PARTITION_KEY_INVOKER } from '@/d.ts';
import { Descriptions } from 'antd';
import React from 'react';
import styles from './index.less';

const columns = [
  {
    dataIndex: 'partitionKey',
    title: '分区键',
    ellipsis: true,
    width: 100,
  },
  {
    dataIndex: 'partitionOption',
    title: '创建细则',
    ellipsis: true,
    render: (_, record) => {
      return (
        <Descriptions className={styles.rules} column={1} size="small">
          <Descriptions.Item label="创建方式">
            {record?.partitionKeyInvoker === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR
              ? '自定义'
              : '顺序递增'}
          </Descriptions.Item>
          <Descriptions.Item label="起始">
            {record?.fromCurrentTime ? '当前时间' : '指定时间'}
          </Descriptions.Item>

          <Descriptions.Item label="间隔">
            {record?.partitionKeyInvokerParameters?.generateParameter?.interval ||
              record?.partitionKeyInvokerParameters?.generateParameter?.intervalGenerateExpr}
          </Descriptions.Item>
        </Descriptions>
      );
    },
  },
];

interface IProps {
  configs: IPartitionKeyConfig[];
}

const ConfigTable: React.FC<IProps> = (props) => {
  const { configs } = props;

  return (
    <DisplayTable
      rowKey="partitionKey"
      columns={columns}
      dataSource={configs}
      disablePagination
      scroll={null}
    />
  );
};

export default ConfigTable;
