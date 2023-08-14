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
import { formatTimeTemplate } from '@/util/utils';
import { Descriptions } from 'antd';
import BigNumber from 'bignumber.js';
import styles from './index.less';

const PopoverContent = ({ node }) => {
  return (
    <div className={styles.popoverContent}>
      <Descriptions column={1}>
        <Descriptions.Item label={'traceId'}>{node?.traceId}</Descriptions.Item>
        <Descriptions.Item label={'spanId'}>{node?.spanId}</Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SQLExplain.components.PopoverContent.StartTime' }) //开始时间
          }
        >
          {node?.originStartTimestamp}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SQLExplain.components.PopoverContent.EndTime' }) //结束时间
          }
        >
          {node?.originEndTimestamp}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SQLExplain.components.PopoverContent.TimeConsuming' }) //耗时
          }
        >
          {formatTimeTemplate(
            BigNumber(node?.endTimestamp - node?.startTimestamp)
              .div(1000000)
              .toNumber(),
          )}
        </Descriptions.Item>
      </Descriptions>
      <div>
        <div>Tags</div>
        <Descriptions column={1}>
          <Descriptions.Item label={'SQL Trace ID'}>{node?.logTraceId}</Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
};

export default PopoverContent;
