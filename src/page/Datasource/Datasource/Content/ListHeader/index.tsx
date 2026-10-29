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
import itemStyles from '../ListItem/index.less';
import classNames from 'classnames';
import styles from './index.less';
import { haveOCP } from '@/util/env';

const ListHeader: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  return (
    <div className={classNames(styles.header)} style={style}>
      <div className={classNames(itemStyles.connectionName, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.8F42FB43',
          defaultMessage: '数据源名称',
        })}
      </div>
      <div className={classNames(itemStyles.cluster, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.89ADAD2B',
          defaultMessage: '集群',
        })}
      </div>
      <div className={classNames(itemStyles.tenant, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.430556BC',
          defaultMessage: '租户',
        })}
      </div>
      {!haveOCP() && (
        <div className={classNames(itemStyles.host, styles.headerColumn)}>
          {formatMessage({
            id: 'src.page.Datasource.Datasource.Content.ListHeader.6BC2295A',
            defaultMessage: '主机：端口',
          })}
        </div>
      )}
      <div className={classNames(itemStyles.env, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.7E37BE74',
          defaultMessage: '环境',
        })}
      </div>
      <div className={classNames(itemStyles.action, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.508282AD',
          defaultMessage: '操作',
        })}
      </div>
    </div>
  );
};

export default ListHeader;
