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

import { Tag } from 'antd';
import { RiskLevelMap } from '../../page/Secure/interface';
import styles from './index.less';

const RiskLevelLabel: React.FC<{ level?: number; color: string; content?: string }> = ({
  level = -1,
  color = 'grey',
  content = '',
}) => {
  return level === -1 && !content?.length ? (
    <span>-</span>
  ) : (
    <div className={styles.tag}>
      <Tag color={color.toLowerCase()}>{level !== -1 ? RiskLevelMap[level] : content}</Tag>
    </div>
  );
};

export default RiskLevelLabel;
