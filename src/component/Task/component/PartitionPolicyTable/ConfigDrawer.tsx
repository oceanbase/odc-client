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

import { PartitionBound } from '@/constant';
import type { IPartitionTableConfig } from '@/d.ts';
import { PARTITION_KEY_INVOKER, TaskPartitionStrategy } from '@/d.ts';
import { Button, Descriptions, Drawer, Space } from 'antd';
import React from 'react';
import { SimpleTextItem } from '../../component/SimpleTextItem';
import ConfigTable from './ConfigTable';
import { getStrategyLabelByConfig } from './index';
import styles from './index.less';

const periodUnits = [
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyTable.8EFB4C32',
      defaultMessage: '年',
    }), //'年'
    value: 1,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyTable.CD3BF6C6',
      defaultMessage: '月',
    }), //'月'
    value: 2,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyTable.42293F67',
      defaultMessage: '日',
    }), //'日'
    value: 5,
  },
];

const partitionBoundDescriptions: Record<PartitionBound, string> = {
  [PartitionBound.PARTITION_UPPER_BOUND]: '分区上界',
  [PartitionBound.PARTITION_LOWER_BOUND]: '分区下界',
};

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

  const getNamingSuffix = () => {
    const suffixExpression =
      partitionNameInvokerParameters?.partitionNameGeneratorConfig?.namingSuffixExpression;
    const refPartitionKey =
      partitionNameInvokerParameters?.partitionNameGeneratorConfig?.refPartitionKey;
    const suffix = [`${refPartitionKey ?? '-'}`];
    if (suffixExpression) {
      suffix.push(
        formatMessage(
          {
            id: 'src.component.Task.component.PartitionPolicyTable.6C49E8F4',
            defaultMessage: '时间格式: {suffixExpression}',
          },
          { suffixExpression },
        ),
      ); //`时间格式: ${suffixExpression}`
    }
    return suffix.filter(Boolean).join(', ');
  };
  const getNamingSuffixStrategy = () => {
    const namingSuffixStrategy =
      partitionNameInvokerParameters?.partitionNameGeneratorConfig?.namingSuffixStrategy;
    return partitionBoundDescriptions[namingSuffixStrategy] || '-';
  };

  const getUnitLabel = (periodUnit) => {
    return periodUnits?.find((item) => item.value === periodUnit)?.label;
  };

  const handleClose = () => {
    onClose();
  };
  const unitLabel = getUnitLabel(dropKeyConfig?.partitionKeyInvokerParameters?.periodUnit);
  const expirePeriod = dropKeyConfig?.partitionKeyInvokerParameters?.expirePeriod;
  return (
    <Drawer
      title={
        formatMessage({
          id: 'src.component.Task.component.PartitionPolicyTable.17F930BB',
          defaultMessage: '分区策略详情',
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
                defaultMessage: '关闭',
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
              defaultMessage: '分区表',
            }) /*"分区表"*/
          }
        >
          {config?.tableName}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyTable.D5F89EFF',
              defaultMessage: '分区类型',
            }) /*"分区类型"*/
          }
        >
          Range
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyTable.CD23EBEA',
              defaultMessage: '分区策略',
            }) /*"分区策略"*/
          }
        >
          {getStrategyLabelByConfig(config)}
        </Descriptions.Item>
      </Descriptions>
      {createKeyConfigs?.length > 0 && (
        <>
          <Descriptions column={1}>
            <Descriptions.Item
              label={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.8BC770B0',
                  defaultMessage: '预创建数量',
                }) /*"预创建数量"*/
              }
            >
              {config?.partitionKeyConfigs?.[0]?.partitionKeyInvokerParameters?.generateCount}
            </Descriptions.Item>
          </Descriptions>
          <SimpleTextItem
            showSplit={false}
            label={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyTable.AD71486A',
                defaultMessage: '创建规则',
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

      {!!createKeyConfigs?.length && (
        <div style={{ marginTop: 8 }}>
          <SimpleTextItem
            showSplit={false}
            label="命名规则"
            content={
              config?.partitionNameInvokerParameters?.partitionNameGeneratorConfig?.namingPrefix ? (
                <>
                  <Descriptions column={1}>
                    <Descriptions.Item label="前缀">
                      {partitionNameInvokerParameters?.partitionNameGeneratorConfig?.namingPrefix}
                    </Descriptions.Item>
                    <Descriptions.Item label="后缀">{getNamingSuffix()}</Descriptions.Item>
                    <Descriptions.Item label="取值策略">
                      {getNamingSuffixStrategy()}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              ) : (
                `自定义：${partitionNameInvokerParameters?.partitionNameGeneratorConfig?.generateExpr}`
              )
            }
            direction="column"
          />
        </div>
      )}

      {dropKeyConfig && (
        <SimpleTextItem
          label={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyTable.C395F5C1',
              defaultMessage: '删除规则',
            }) /*"删除规则"*/
          }
          content={
            dropKeyConfig?.partitionKeyInvoker ===
            PARTITION_KEY_INVOKER.HISTORICAL_PARTITION_PLAN_DROP_GENERATOR ? (
              <div>
                {
                  formatMessage(
                    {
                      id: 'src.component.Task.component.PartitionPolicyTable.A6ED90AD',
                      defaultMessage: '保留最近{expirePeriod}个{unitLabel}的分区，不重建全局索引',
                    },
                    { expirePeriod, unitLabel },
                  ) /*`保留最近${expirePeriod}个${unitLabel}的分区，不重建全局索引`*/
                }
              </div>
            ) : (
              <div>
                {dropKeyConfig?.partitionKeyInvokerParameters?.reloadIndexes
                  ? formatMessage(
                      {
                        id: 'src.component.Task.component.PartitionPolicyTable.E664CA38',
                        defaultMessage:
                          '保留最近{dropKeyConfigPartitionKeyInvokerParametersKeepLatestCount}个分区，重建全局索引',
                      },
                      {
                        dropKeyConfigPartitionKeyInvokerParametersKeepLatestCount:
                          dropKeyConfig?.partitionKeyInvokerParameters?.keepLatestCount,
                      },
                    )
                  : formatMessage(
                      {
                        id: 'src.component.Task.component.PartitionPolicyTable.F0A2151E',
                        defaultMessage:
                          '保留最近{dropKeyConfigPartitionKeyInvokerParametersKeepLatestCount}个分区，不重建全局索引',
                      },
                      {
                        dropKeyConfigPartitionKeyInvokerParametersKeepLatestCount:
                          dropKeyConfig?.partitionKeyInvokerParameters?.keepLatestCount,
                      },
                    )}
              </div>
            )
          }
          direction="column"
        />
      )}
    </Drawer>
  );
};

export default ConfigDrawer;
