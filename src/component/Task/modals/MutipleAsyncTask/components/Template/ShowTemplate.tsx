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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Space, Timeline } from 'antd';

import { IConnection } from '@/d.ts';
import { IEnvironment } from '@/d.ts/environment';
import styles from './index.less';

const ShowTemplate: React.FC<{
  orderedDatabaseIds: number[][];
  databaseIdsMap: {
    [key in number]: {
      name: string;
      dataSource: IConnection;
      environment: IEnvironment;
    };
  };
}> = ({ orderedDatabaseIds, databaseIdsMap }) => {
  return (
    <Timeline mode="left">
      {orderedDatabaseIds?.map((dbs, index) => (
        <Timeline.Item className={styles.timelineItem} key={index}>
          <div>
            {formatMessage(
              {
                id: 'src.component.Task.MutipleAsyncTask.components.Template.81F6A9AB',
                defaultMessage: '执行节点{ BinaryExpression0 }',
              },
              { BinaryExpression0: index + 1 },
            )}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: 'var(--background-tertraiy-color)',
              padding: '12px 16px',
              marginTop: '8px',
            }}
          >
            {dbs?.map((db, _index) => {
              const icon = getDataSourceStyleByConnectType(databaseIdsMap?.[db]?.dataSource?.type);
              return (
                <Space key={_index} size={0}>
                  <RiskLevelLabel
                    content={databaseIdsMap?.[db]?.environment?.name}
                    color={databaseIdsMap?.[db]?.environment?.style}
                  />

                  <Space size={4}>
                    <Icon
                      component={icon?.icon?.component}
                      style={{
                        color: icon?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />

                    <div>{databaseIdsMap?.[db]?.name}</div>
                    <div style={{ color: 'var(--text-color-hint)' }}>
                      {databaseIdsMap?.[db]?.dataSource?.name}
                    </div>
                  </Space>
                </Space>
              );
            })}
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};
export default ShowTemplate;
