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
import { ExportOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import login from '@/store/login';

interface IProps {
  showIcon?: boolean;
  height?: number;
}
export default ({ showIcon, height = 280 }: IProps) => {
  return (
    <div className={styles.databaseSelectEmptyhWrapper}>
      <Empty
        className={styles.empty}
        style={{ height }}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className={styles.description}>
            <div className={styles.title}>
              {formatMessage({
                id: 'src.component.Empty.DatabaseSelectEmpty.9C21267F',
                defaultMessage: '暂无数据库',
              })}
            </div>
            {login.isPrivateSpace() ? (
              <></>
            ) : (
              <div className={styles.subDescription}>
                {showIcon
                  ? formatMessage({
                      id: 'src.component.Empty.DatabaseSelectEmpty.953DB46B',
                      defaultMessage:
                        '仅展示全部项目内的数据库，请先确认已加入项目、且项目内存在数据库。',
                    })
                  : formatMessage({
                      id: 'src.component.Empty.DatabaseSelectEmpty.7272411D',
                      defaultMessage:
                        '仅支持选择项目内的数据库，请先确认已加入项目、且项目内存在数据库。',
                    })}
                <span className={styles.action} onClick={() => window.open('#/project')}>
                  {formatMessage({
                    id: 'src.component.Empty.DatabaseSelectEmpty.8F714B05',
                    defaultMessage: '管理项目',
                  })}
                  {showIcon && <ExportOutlined style={{ marginLeft: 4 }} />}
                </span>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};
