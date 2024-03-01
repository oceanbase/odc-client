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
      title="分区策略详情"
      open={visible}
      destroyOnClose
      className={styles.configDrawer}
      width={520}
      onClose={handleClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleClose}>关闭</Button>
        </Space>
      }
    >
      <Descriptions column={1}>
        <Descriptions.Item label="分区表">{config?.tableName}</Descriptions.Item>
        <Descriptions.Item label="分区类型">Range</Descriptions.Item>
        <Descriptions.Item label="分区策略">{getStrategyLabelByConfig(config)}</Descriptions.Item>
        <Descriptions.Item label="预创建数量">
          {config?.partitionKeyConfigs?.[0]?.partitionKeyInvokerParameters?.generateCount}
        </Descriptions.Item>
      </Descriptions>
      <SimpleTextItem
        label="创建规则"
        content={
          <div className={styles.sqlContent}>
            <ConfigTable configs={createKeyConfigs} />
          </div>
        }
        direction="column"
      />
      <Descriptions style={{ marginTop: '8px' }} column={1}>
        <Descriptions.Item label="命名规则">
          {config?.partitionNameInvoker ===
          PARTITION_NAME_INVOKER.DATE_BASED_PARTITION_NAME_GENERATOR
            ? [
                `前缀: ${partitionNameInvokerParameters.partitionNameGeneratorConfig.namingPrefix}`,
                `后缀: ${partitionNameInvokerParameters.partitionNameGeneratorConfig.namingSuffixExpression}`,
              ]?.join(', ')
            : `自定义: ${partitionNameInvokerParameters.partitionNameGeneratorConfig.generateExpr}`}
        </Descriptions.Item>
        <Descriptions.Item label="分区保留数量">
          {dropKeyConfig?.partitionKeyInvokerParameters?.keepLatestCount}
        </Descriptions.Item>
        <Descriptions.Item label="删除后是否重置索引">
          {dropKeyConfig?.partitionKeyInvokerParameters?.reloadIndexes ? '是' : '否'}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default ConfigDrawer;
