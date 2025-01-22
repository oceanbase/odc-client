import { formatMessage } from '@/util/intl';
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

import MultiLineOverflowText from '@/component/MultiLineOverflowText';
import { IUnauthorizedDBResources, TablePermissionType } from '@/d.ts/table';
import { CloseCircleFilled } from '@ant-design/icons';
import { Space, Tabs, Typography } from 'antd';
import styles from './index.less';
import DBPermissionTableContent from '../DBPermissionTableContent';

const { Text } = Typography;

const PERMISSION_TAB_KEY = 'LOG';

interface IProps {
  sql?: string;
  dataSource: IUnauthorizedDBResources[];
}
const DBPermissionTable: React.FC<IProps> = (props) => {
  const { sql, dataSource } = props;

  return (
    <Tabs
      className={styles.tabs}
      activeKey={PERMISSION_TAB_KEY}
      tabBarGutter={0}
      animated={false}
      items={[
        {
          label: formatMessage({
            id: 'src.page.Workspace.components.SQLResultSet.D12A3FE9',
            defaultMessage: '日志',
          }), //'日志'
          key: PERMISSION_TAB_KEY,
          children: (
            <div className={styles.result}>
              <Space>
                <CloseCircleFilled style={{ color: '#F5222D' }} />
                {formatMessage({
                  id: 'src.page.Workspace.components.SQLResultSet.7A8EC0AB' /*执行以下 SQL 失败*/,
                  defaultMessage: '执行以下 SQL 失败',
                })}
              </Space>
              <MultiLineOverflowText className={styles.executedSQL} content={sql} />
              <Space direction="vertical">
                <span>
                  {
                    formatMessage({
                      id: 'src.page.Workspace.components.SQLResultSet.BDAE252A' /*失败原因：*/,
                      defaultMessage: '失败原因：',
                    }) /* 失败原因： */
                  }
                </span>
                <Text type="secondary">
                  {formatMessage({
                    id: 'src.page.Workspace.components.SQLResultSet.DDB9284D',
                    defaultMessage: '缺少以下数据库表对应权限，请先申请权限',
                  })}
                </Text>
              </Space>
              <div className={styles.track}>
                <DBPermissionTableContent showAction dataSource={dataSource} />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default DBPermissionTable;
