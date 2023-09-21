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

import { formatTimeTemplate } from '@/util/utils';
import { Popover } from 'antd';
import BigNumber from 'bignumber.js';
import styles from './index.less';
import PopoverContent from './PopoverContent';

const ProgressBar = ({ totalEndTimestamp, totalStartTimestamp, node }) => {
  const total = totalEndTimestamp - totalStartTimestamp;
  const other = (node.startTimestamp - totalStartTimestamp) / total;
  const percent = (node.endTimestamp - node.startTimestamp) / total;
  return (
    <div className={styles.progressBar}>
      <div
        className={styles.transform}
        style={{
          width: `${other * 100}%`,
        }}
      ></div>
      <Popover
        overlayClassName={styles.popover}
        placement="left"
        title={'Execute SQL'}
        content={<PopoverContent node={node} />}
      >
        <div
          className={styles.currentSpan}
          style={{
            width: `${percent * 100}%`,
          }}
        ></div>
      </Popover>

      <Popover
        overlayClassName={styles.popover}
        placement="left"
        title={'Execute SQL'}
        content={<PopoverContent node={node} />}
      >
        <div className={styles.time}>
          {formatTimeTemplate(
            BigNumber(node?.endTimestamp - node?.startTimestamp)
              .div(1000000)
              .toNumber(),
          )}
        </div>
      </Popover>
    </div>
  );
};

export default ProgressBar;
