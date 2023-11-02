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

import { getLocalFormatDateTime } from '@/util/utils';
import { formatMessage } from '@/util/intl';
import { Card, Descriptions, Tooltip as AntdTooltip } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { ISQLExecuteDetail } from '@/d.ts';
const BasicInfo: React.FC<{ sqlExecuteDetailToShow: ISQLExecuteDetail }> = ({
  sqlExecuteDetailToShow,
}) => {
  return (
    <Card
      bodyStyle={{
        height: 210,
        padding: 16,
      }}
      className={classNames([styles.card, styles.baseCard])}
    >
      <Descriptions
        title={formatMessage({
          id: 'workspace.window.sql.explain.tab.detail.card.base.title',
        })}
        column={1}
      >
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.sqlID',
          })}
        >
          {sqlExecuteDetailToShow?.sqlId}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.sql',
          })}
        >
          <AntdTooltip title={sqlExecuteDetailToShow?.sql ?? ''}>
            <div
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: 300,
              }}
            >
              {sqlExecuteDetailToShow?.sql}
            </div>
          </AntdTooltip>
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.traceID',
          })}
        >
          {sqlExecuteDetailToShow?.traceId}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.reqTime',
          })}
        >
          {getLocalFormatDateTime(sqlExecuteDetailToShow?.reqTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.planType',
          })}
        >
          {sqlExecuteDetailToShow?.planType}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.hitPlanCache',
          })}
        >
          {sqlExecuteDetailToShow?.hitPlanCache
            ? formatMessage({
                id: 'odc.components.SQLPage.Is',
              })
            : formatMessage({
                id: 'odc.components.SQLPage.No',
              })}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
export default BasicInfo;
