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
import { Empty } from 'antd';
import styles from './index.less';

interface IProps {
  height?: number;
  color?: string;
}

export default ({ height = 268, color }: IProps) => {
  return (
    <Empty
      style={{ height }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      className={styles.databaseEmpty}
      description={
        <span style={{ color }}>
          {formatMessage({
            id: 'src.component.Empty.RecentlyDatabaseEmpty.94C7FC75',
            defaultMessage: '暂无最近访问的数据库',
          })}
        </span>
      }
    />
  );
};
