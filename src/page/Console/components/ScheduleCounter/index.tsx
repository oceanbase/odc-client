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

import { RightOutlined } from '@ant-design/icons';
import styles from './index.less';
import React from 'react';

/**
 * Schedule counter component props
 */
interface IScheduleCounterProps {
  /** Counter title */
  title: string;
  /** Counter value */
  counter: number;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Schedule counter component for displaying task/schedule counts
 * Used in console page for quick navigation to filtered task/schedule lists
 */
const ScheduleCounter: React.FC<IScheduleCounterProps> = ({ title, counter, onClick }) => {
  return (
    <div className={styles.scheduleCounter}>
      <div className={styles.title}>{title || '-'}</div>
      <div className={styles.counter} onClick={onClick}>
        {counter || 0}
        <RightOutlined className={styles.icon} />
      </div>
    </div>
  );
};

export default ScheduleCounter;
