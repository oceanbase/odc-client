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

import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { getCronCycle } from '@/component/Task/component/TaskTable';
import type { ICycleTaskTriggerConfig } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import { Collapse, Descriptions, Space } from 'antd';
import React from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './index.less';
const { Panel } = Collapse;

interface IProps {
  label: string;
  triggerConfig: ICycleTaskTriggerConfig;
  nextFireTimes: number[];
}

const CycleDescriptionItem: React.FC<IProps> = (props) => {
  const { label, triggerConfig, nextFireTimes } = props;

  return (
    <Descriptions column={2}>
      <Descriptions.Item label={label}>
        {triggerConfig ? getCronCycle(triggerConfig) : '-'}
      </Descriptions.Item>
      <Descriptions.Item>
        <Collapse
          ghost
          bordered={false}
          className={styles['next-time']}
          expandIcon={({ isActive }) => (
            <SimpleTextItem
              label={
                formatMessage({
                  id: 'src.component.Task.PartitionTask.DetailContent.9E174828',
                }) /*"下一次执行时间"*/
              }
              content={
                <Space>
                  {getFormatDateTime(nextFireTimes?.[0])}
                  {isActive ? <UpOutlined /> : <DownOutlined />}
                </Space>
              }
            />
          )}
        >
          <Panel key="1" header={null}>
            <Space direction="vertical" size={0}>
              {nextFireTimes?.map((item, index) => {
                return index > 0 && <div>{getFormatDateTime(item)}</div>;
              })}
            </Space>
          </Panel>
        </Collapse>
      </Descriptions.Item>
    </Descriptions>
  );
};
export default CycleDescriptionItem;
