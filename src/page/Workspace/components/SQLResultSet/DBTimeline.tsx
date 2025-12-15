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

import { ISqlExecuteResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { formatTimeTemplate } from '@/util/data/dateTime';
import { Timeline, Typography } from 'antd';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import styles from './index.less';

interface IProps {
  row: ISqlExecuteResult;
}

export default function DBTimeline({ row }: IProps) {
  const { timer } = row;

  const renderList = [
    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.OdcParsesSql',
        defaultMessage: 'ODC 解析 SQL',
      }), //ODC 解析 SQL
      key: 'ODC Parse SQL',
    },

    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.OdcRewriteSql',
        defaultMessage: 'ODC 重写 SQL',
      }), //ODC 重写 SQL
      key: 'ODC Rewrite SQL',
    },
    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.DBTimeline.SqlPrecheck',
        defaultMessage: 'SQL 预检查',
      }), //SQL 预检查
      key: 'Sql intercept pre-check',
    },
    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.Run',
        defaultMessage: '执行',
      }), //执行
      key: 'Execute',
    },

    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.ObtainTheSqlType',
        defaultMessage: '获取 SQL 类型',
      }), //获取 SQL 类型
      key: 'Init SQL type',
    },
    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.ObtainEditableInformation',
        defaultMessage: '获取可编辑信息',
      }), //获取可编辑信息
      key: 'Init editable info',
    },
    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.GetColumnInformation',
        defaultMessage: '获取列信息',
      }), //获取列信息
      key: 'Init column info',
    },
    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.ObtainAlertContent',
        defaultMessage: '获取告警内容',
      }), //获取告警内容
      key: 'Init warning message',
    },
    {
      title: formatMessage({
        id: 'odc.components.SQLResultSet.DBTimeline.SqlPostCheck',
        defaultMessage: 'SQL 后置检查',
      }), //SQL 后置检查
      key: 'Sql intercept after-check',
    },
  ];

  return (
    <Timeline className={styles.executeTimerLine}>
      {renderList.map((item) => {
        const stage = timer?.stages?.find((stage) => stage.stageName === item.key);
        if (!stage) {
          return null;
        }
        const totalDurationMicroseconds = stage?.totalDurationMicroseconds ?? 1;
        const time = BigNumber(totalDurationMicroseconds).div(1000000).toNumber();
        const hasInitColumnInfoWarning =
          stage.stageName === 'Init column info' && totalDurationMicroseconds / 1000 / 1000 > 1;
        return (
          <Timeline.Item color={hasInitColumnInfoWarning ? 'var(--icon-orange-color)' : 'blue'}>
            <Typography.Text strong>
              <Typography.Text type="secondary">
                [{dayjs(stage?.startTimeMillis).format('HH:mm:ss')}]
              </Typography.Text>
              {item.title}
              <Typography.Text type="secondary">({formatTimeTemplate(time)})</Typography.Text>
              {stage?.subStages?.map((stage) => {
                const time = BigNumber(stage?.totalDurationMicroseconds).div(1000000).toNumber();
                return (
                  <div>
                    <Typography.Text type="secondary">
                      [{dayjs(stage?.startTimeMillis).format('HH:mm:ss')}]{stage?.stageName}(
                      {formatTimeTemplate(time)})
                    </Typography.Text>
                  </div>
                );
              })}
              {hasInitColumnInfoWarning && (
                <Typography.Paragraph>
                  <Typography.Text type="secondary">
                    {
                      formatMessage({
                        id: 'odc.components.SQLResultSet.ExecuteHistory.ItTakesTooMuchTime',
                        defaultMessage:
                          '耗时过大，建议在 SQL 窗口设置中关闭获取，关闭后不再查询列注释及可编辑的列信息',
                      }) /*耗时过大，建议在SQL窗口设置中关闭获取，关闭后不再查询列注释及可编辑的列信息*/
                    }
                  </Typography.Text>
                </Typography.Paragraph>
              )}
            </Typography.Text>
          </Timeline.Item>
        );
      })}
      <Timeline.Item>
        {
          formatMessage({
            id: 'odc.components.SQLResultSet.ExecuteHistory.Completed',
            defaultMessage: '完成',
          }) /*完成*/
        }

        <Typography.Text type="secondary">
          {
            formatMessage({
              id: 'odc.components.SQLResultSet.ExecuteHistory.TotalTimeConsumed',
              defaultMessage: '(总耗时:',
            }) /*(总耗时:*/
          }
          {formatTimeTemplate(timer?.totalDurationMicroseconds / 1000000)})
        </Typography.Text>
      </Timeline.Item>
    </Timeline>
  );
}
