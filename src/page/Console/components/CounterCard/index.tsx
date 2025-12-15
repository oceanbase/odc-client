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

import styles from './index.less';
interface IProps {
  title: string;
  counter: number;
  status?: string;
  onClick?: () => void;
}

const CounterCard = ({ title, counter, status, onClick }: IProps) => {
  return (
    <div className={styles.counterCard}>
      <div className={styles.title}>{title || '-'}</div>
      <div
        className={styles.counter}
        onClick={onClick}
        style={{ color: counter > 0 && status === 'failed' ? '#ff4d4f' : undefined }}
      >
        {counter || 0}
        <span className={styles.icon}>&gt;</span>
      </div>
    </div>
  );
};

export default CounterCard;
