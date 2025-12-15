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
import { Divider, Empty } from 'antd';
import styles from './index.less';
import { SettingOutlined } from '@ant-design/icons';
export default () => {
  return (
    <div className={styles.projectSelectEmptyWrapper}>
      <Empty
        className={styles.empty}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={formatMessage({
          id: 'src.component.Empty.ProjectSelectEmpty.256B8DEF',
          defaultMessage: '暂无项目',
        })}
      />
      <Divider />
      <div className={styles.setting}>
        <SettingOutlined color="#1890ff" />
        <span className={styles.action} onClick={() => window.open('#/project')}>
          {formatMessage({
            id: 'src.component.Empty.ProjectSelectEmpty.E8AA0AD9',
            defaultMessage: '管理项目',
          })}
        </span>
      </div>
    </div>
  );
};
