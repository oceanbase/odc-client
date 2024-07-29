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
import { Card } from 'antd';
import styles from './index.less';
const TimeStatistics: React.FC<{
  stackBarBox: React.MutableRefObject<HTMLDivElement>;
}> = ({ stackBarBox }) => {
  return (
    <Card
      title={formatMessage({
        id: 'workspace.window.sql.explain.tab.detail.card.time.title',
        defaultMessage: '耗时统计 (us)',
      })}
      headStyle={{
        padding: '0 16px',
        fontSize: 14,
        border: 'none',
      }}
      bodyStyle={{
        height: 158,
        padding: 16,
      }}
      className={styles.card}
    >
      <div
        ref={stackBarBox}
        style={{
          marginTop: -30,
          width: '100%',
          height: '100%',
        }}
      />
    </Card>
  );
};
export default TimeStatistics;
