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
import { intervalPrecisionOptions } from '@/component/Task/component/PartitionPolicyFormTable/configModal';
import { IPartitionKeyConfig, PARTITION_KEY_INVOKER } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import { Descriptions, Tooltip } from 'antd';
import React from 'react';
import styles from './index.less';
import {
  INCREAMENT_FIELD_TYPE,
  increamentFieldTypeLabelMap,
} from '../PartitionPolicyFormTable/const';

const getFromCurrentTimeLabel = (fromCurrentTime: boolean, baseTimestampMillis: number) => {
  const labels = [
    fromCurrentTime
      ? formatMessage({
          id: 'src.component.Task.component.PartitionPolicyTable.02D5A436',
          defaultMessage: '当前时间',
        })
      : formatMessage({
          id: 'src.component.Task.component.PartitionPolicyTable.C5755BD5',
          defaultMessage: '指定时间',
        }),
  ];

  if (baseTimestampMillis) {
    labels.push(getFormatDateTime(baseTimestampMillis));
  }
  return labels?.join(', ');
};

const columns = [
  {
    dataIndex: 'partitionKey',
    title: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyTable.8086D142',
      defaultMessage: '分区键',
    }), //'分区键'
    ellipsis: true,
    width: 100,
    render: (partitionKey) => {
      return partitionKey || '-';
    },
  },
  {
    dataIndex: 'partitionOption',
    title: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyTable.B25F63D5',
      defaultMessage: '创建细则',
    }), //'创建细则'
    ellipsis: true,
    render: (_, record) => {
      const intervalGenerateExpr =
        record?.partitionKeyInvokerParameters?.generateParameter?.intervalGenerateExpr;
      const interval = record?.partitionKeyInvokerParameters?.generateParameter?.interval;
      const intervalPrecision =
        record?.partitionKeyInvokerParameters?.generateParameter?.intervalPrecision;
      const numberInterval =
        record?.partitionKeyInvokerParameters?.generateParameter?.numberInterval;
      const incrementFieldType =
        record?.partitionKeyInvokerParameters?.generateParameter?.fieldType;
      const incrementFieldTimeFormat =
        record?.partitionKeyInvokerParameters?.generateParameter?.timeFormat;
      return (
        <Descriptions className={styles.rules} column={1} size="small">
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyTable.D94AE82A',
                defaultMessage: '创建方式',
              }) /*"创建方式"*/
            }
          >
            {record?.partitionKeyInvoker === PARTITION_KEY_INVOKER.CUSTOM_GENERATOR
              ? formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.C9467B5B',
                  defaultMessage: '自定义',
                })
              : formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.F057FAAF',
                  defaultMessage: '顺序递增',
                })}
          </Descriptions.Item>
          {!!incrementFieldType ? (
            <Descriptions.Item label={'含义'}>
              {increamentFieldTypeLabelMap[incrementFieldType]}
              {incrementFieldTimeFormat ? `(${incrementFieldTimeFormat})` : null}
            </Descriptions.Item>
          ) : null}
          {(!!record?.partitionKeyInvokerParameters?.generateParameter?.baseTimestampMillis ||
            !!record?.partitionKeyInvokerParameters?.generateParameter?.fromCurrentTime) &&
          incrementFieldType !== INCREAMENT_FIELD_TYPE.NUMBER ? (
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.FD28073C',
                  defaultMessage: '起始',
                }) /*"起始"*/
              }
            >
              {getFromCurrentTimeLabel(
                record?.partitionKeyInvokerParameters?.generateParameter?.fromCurrentTime,
                record?.partitionKeyInvokerParameters?.generateParameter?.baseTimestampMillis,
              )}
            </Descriptions.Item>
          ) : null}
          {!!record?.partitionKeyInvokerParameters?.generateParameter?.generateExpr ? (
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.2C76F5F5',
                  defaultMessage: '表达式',
                }) /*"表达式"*/
              }
            >
              <Tooltip
                title={record?.partitionKeyInvokerParameters?.generateParameter?.generateExpr}
              >
                {record?.partitionKeyInvokerParameters?.generateParameter?.generateExpr}
              </Tooltip>
            </Descriptions.Item>
          ) : null}
          {!!intervalGenerateExpr && (
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.D509725F',
                  defaultMessage: '间隔',
                }) /*"间隔"*/
              }
            >
              {intervalGenerateExpr}
            </Descriptions.Item>
          )}
          {!!numberInterval && (
            <Descriptions.Item label={'间隔(数值)'}>{numberInterval}</Descriptions.Item>
          )}
          {!!interval && (
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.D509725F',
                  defaultMessage: '间隔',
                }) /*"间隔"*/
              }
            >
              {interval}
              {intervalPrecisionOptions.find((i) => i.value === intervalPrecision)?.label}
            </Descriptions.Item>
          )}
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
      bordered
      rowKey="partitionKey"
      columns={columns}
      dataSource={configs}
      disablePagination
      scroll={null}
    />
  );
};

export default ConfigTable;
