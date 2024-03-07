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

import DisplayTable from '@/component/DisplayTable';
import { IPartitionKeyConfig, PARTITION_KEY_INVOKER } from '@/d.ts';
import { Descriptions, Space, Tooltip } from 'antd';
import React from 'react';
import { getIntervalPrecisionLabel } from '@/component/Task/component/PartitionPolicyFormTable/configModal';
import styles from './index.less';

const columns = [
  {
    dataIndex: 'partitionKey',
    title: formatMessage({ id: 'src.component.Task.component.PartitionPolicyTable.8086D142' }), //'分区键'
    ellipsis: true,
    width: 100,
  },
  {
    dataIndex: 'partitionOption',
    title: formatMessage({ id: 'src.component.Task.component.PartitionPolicyTable.B25F63D5' }), //'创建细则'
    ellipsis: true,
    render: (_, record) => {
      return (
        <Descriptions className={styles.rules} column={1} size="small">
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyTable.D94AE82A',
              }) /*"创建方式"*/
            }
          >
            {record?.partitionKeyInvoker === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR
              ? formatMessage({ id: 'src.component.Task.component.PartitionPolicyTable.C9467B5B' })
              : formatMessage({ id: 'src.component.Task.component.PartitionPolicyTable.F057FAAF' })}
          </Descriptions.Item>
          {record?.partitionKeyInvoker === PARTITION_KEY_INVOKER.TIME_INCREASING_GENERATOR ? (
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.FD28073C',
                }) /*"起始"*/
              }
            >
              {record?.partitionKeyInvokerParameters?.generateParameter?.fromCurrentTime
                ? formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyTable.02D5A436',
                  })
                : formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyTable.C5755BD5',
                  })}
            </Descriptions.Item>
          ) : (
            <Descriptions.Item label="表达式">
              <Tooltip
                title={record?.partitionKeyInvokerParameters?.generateParameter?.generateExpr}
              >
                {record?.partitionKeyInvokerParameters?.generateParameter?.generateExpr}
              </Tooltip>
            </Descriptions.Item>
          )}
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyTable.D509725F',
              }) /*"间隔"*/
            }
          >
            {record?.partitionKeyInvokerParameters?.generateParameter?.interval ? (
              <Space size={5}>
                {record?.partitionKeyInvokerParameters?.generateParameter?.interval}
                {getIntervalPrecisionLabel(
                  record?.partitionKeyInvokerParameters?.generateParameter?.intervalPrecision,
                )}
              </Space>
            ) : (
              record?.partitionKeyInvokerParameters?.generateParameter?.intervalGenerateExpr
            )}
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
