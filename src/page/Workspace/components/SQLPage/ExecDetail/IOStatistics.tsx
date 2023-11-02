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
import { Card, Statistic, Col, Row } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { ISQLExecuteDetail } from '@/d.ts';
const IOStatistics: React.FC<{
  sqlExecuteDetailToShow: ISQLExecuteDetail;
}> = ({ sqlExecuteDetailToShow }) => {
  return (
    <Card
      title={formatMessage({
        id: 'workspace.window.sql.explain.tab.detail.card.io.title',
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
      className={classNames([styles.card, styles.ioCard])}
    >
      <Row>
        <Col span={8}>
          <Statistic
            title={formatMessage({
              id: 'workspace.window.sql.explain.tab.detail.card.io.rpcCount',
            })}
            value={sqlExecuteDetailToShow?.rpcCount}
            valueStyle={{ fontSize: '24px' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={formatMessage({
              id: 'workspace.window.sql.explain.tab.detail.card.io.physicalRead',
            })}
            value={sqlExecuteDetailToShow?.physicalRead}
            valueStyle={{ fontSize: '24px' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={formatMessage({
              id: 'workspace.window.sql.explain.tab.detail.card.io.ssstoreRead',
            })}
            value={sqlExecuteDetailToShow?.ssstoreRead}
            valueStyle={{ fontSize: '24px' }}
          />
        </Col>
      </Row>
    </Card>
  );
};
export default IOStatistics;
