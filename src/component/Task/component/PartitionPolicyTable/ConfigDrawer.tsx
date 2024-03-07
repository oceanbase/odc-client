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

import { Button, Drawer, Space, Descriptions } from 'antd';
import React from 'react';
import { getStrategyLabelByConfig } from './index';
import ConfigTable from './ConfigTable';
import { SimpleTextItem } from '../../component/SimpleTextItem';
import type { IPartitionTableConfig } from '@/d.ts';
import { TaskPartitionStrategy, PARTITION_NAME_INVOKER } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import styles from './index.less';

interface IProps {
  visible: boolean;
  config?: IPartitionTableConfig;
  onClose: () => void;
}

const ConfigDrawer: React.FC<IProps> = (props) => {
  if (!props?.config) {
    return null;
  }
  const { visible, config, onClose } = props;
  const { partitionNameInvokerParameters } = config;
  const dropKeyConfig = config?.partitionKeyConfigs?.find(
    (item) => item?.strategy === TaskPartitionStrategy.DROP,
  );
  const createKeyConfigs = config?.partitionKeyConfigs?.filter(
    (item) => item?.strategy === TaskPartitionStrategy.CREATE,
  );

  const handleClose = () => {
    onClose();
  };

  return (
    <Drawer
      title={
        formatMessage({
          id: 'src.component.Task.component.PartitionPolicyTable.17F930BB',
        }) /*"分区策略详情"*/
      }
      open={visible}
      destroyOnClose
      className={styles.configDrawer}
      width={520}
      onClose={handleClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleClose}>
            {
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyTable.A342B96D' /*关闭*/,
              }) /* 关闭 */
            }
          </Button>
        </Space>
      }
    >
      <Descriptions column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyTable.15852854',
            }) /*"分区表"*/
          }
        >
          {config?.tableName}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyTable.D5F89EFF',
            }) /*"分区类型"*/
          }
        >
          Range
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyTable.CD23EBEA',
            }) /*"分区策略"*/
          }
        >
          {getStrategyLabelByConfig(config)}
        </Descriptions.Item>
      </Descriptions>
      {createKeyConfigs?.length && (
        <>
          <Descriptions column={1}>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.8BC770B0',
                }) /*"预创建数量"*/
              }
            >
              {config?.partitionKeyConfigs?.[0]?.partitionKeyInvokerParameters?.generateCount}
            </Descriptions.Item>
          </Descriptions>
          <SimpleTextItem
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyTable.AD71486A',
              }) /*"创建规则"*/
            }
            content={
              <div className={styles.sqlContent}>
                <ConfigTable configs={createKeyConfigs} />
              </div>
            }
            direction="column"
          />
        </>
      )}
      <Descriptions style={{ marginTop: '8px' }} column={1}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyTable.371328F9',
            }) /*"命名规则"*/
          }
        >
          {config?.partitionNameInvoker ===
          PARTITION_NAME_INVOKER.DATE_BASED_PARTITION_NAME_GENERATOR ? (
            <Space>
              {formatMessage(
                { id: 'src.component.Task.component.PartitionPolicyTable.1D7346EE' },
                {
                  partitionNameInvokerParametersPartitionNameGeneratorConfigNamingPrefix:
                    partitionNameInvokerParameters.partitionNameGeneratorConfig.namingPrefix,
                },
              )}
              <Space size={2}>
                后缀:
                {partitionNameInvokerParameters?.partitionNameGeneratorConfig?.fromCurrentTime
                  ? '当前时间'
                  : '指定时间'}
                {partitionNameInvokerParameters?.partitionNameGeneratorConfig
                  ?.baseTimestampMillis &&
                  getFormatDateTime(
                    partitionNameInvokerParameters?.partitionNameGeneratorConfig
                      ?.baseTimestampMillis,
                  )}
                {partitionNameInvokerParameters.partitionNameGeneratorConfig.namingSuffixExpression}
              </Space>
            </Space>
          ) : (
            formatMessage(
              { id: 'src.component.Task.component.PartitionPolicyTable.59CEB82C' },
              {
                partitionNameInvokerParametersPartitionNameGeneratorConfigGenerateExpr:
                  partitionNameInvokerParameters.partitionNameGeneratorConfig.generateExpr,
              },
            )
          )}
        </Descriptions.Item>
        {dropKeyConfig && (
          <>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.C67810D3',
                }) /*"分区保留数量"*/
              }
            >
              {dropKeyConfig?.partitionKeyInvokerParameters?.keepLatestCount}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.D209E3BF',
                }) /*"删除后是否重置索引"*/
              }
            >
              {dropKeyConfig?.partitionKeyInvokerParameters?.reloadIndexes
                ? formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyTable.88E93248',
                  })
                : formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyTable.A5E08D34',
                  })}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
    </Drawer>
  );
};

export default ConfigDrawer;
