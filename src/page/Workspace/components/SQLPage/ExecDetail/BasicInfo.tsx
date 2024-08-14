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

import { ISQLExecuteDetail } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Card, Descriptions, Tooltip as AntdTooltip } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
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
          defaultMessage: '基本信息',
        })}
        column={1}
      >
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.sqlID',
            defaultMessage: 'SQL ID',
          })}
        >
          {sqlExecuteDetailToShow?.sqlId}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.sql',
            defaultMessage: 'SQL',
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
            defaultMessage: 'Trace ID',
          })}
        >
          {sqlExecuteDetailToShow?.traceId}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.reqTime',
            defaultMessage: '请求到达时间',
          })}
        >
          {getLocalFormatDateTime(sqlExecuteDetailToShow?.reqTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.planType',
            defaultMessage: '计划类型',
          })}
        >
          {sqlExecuteDetailToShow?.planType}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'workspace.window.sql.explain.tab.detail.card.base.hitPlanCache',
            defaultMessage: '是否命中缓存',
          })}
        >
          {sqlExecuteDetailToShow?.hitPlanCache
            ? formatMessage({
                id: 'odc.components.SQLPage.Is',
                defaultMessage: '是',
              })
            : formatMessage({
                id: 'odc.components.SQLPage.No',
                defaultMessage: '否',
              })}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
export default BasicInfo;
