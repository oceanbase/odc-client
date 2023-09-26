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
import { Col, Drawer, message, Row, Spin } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getSQLExecuteDetail, getSQLExecuteExplain } from '@/common/network/sql';
import { ISQLExecuteDetail, ISQLExplain } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import styles from './index.less';
import BasicInfo from './BasicInfo';
import TimeStatistics from './TimeStatistics';
import IOStatistics from './IOStatistics';
import SQLExplain from '../../SQLExplain';

interface IProps {
  visible: boolean;
  session: SessionStore;
  sql?: string;
  traceId?: string;
  onClose: () => void;
}

const ExecDetail: React.FC<IProps> = function (props) {
  const { visible, sql, traceId, session, onClose } = props;
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [sqlExecuteExplainToShow, setSqlExecuteExplainToShow] = useState<ISQLExplain | string>(
    null,
  );
  const [sqlExecuteDetailToShow, setSqlExecuteDetailToShow] = useState<ISQLExecuteDetail>(null);
  const stackBarPlot = useRef(null);
  const stackBarBox = useRef<HTMLDivElement>(null);

  const fetchExecDetail = useCallback(
    async function () {
      if (!traceId) {
        message.error(
          formatMessage({ id: 'odc.components.SQLPage.TheTraceIdIsEmpty' }), // TRACE ID 为空，请确保该语句运行时 ob_enable_trace_log 变量已设置为 ON
        );
        return;
      }
      setSqlExecuteDetailToShow(null);
      setSqlExecuteExplainToShow(null);
      setLoadingExplain(true);

      const detail = await getSQLExecuteDetail(
        sql,
        traceId,
        session?.sessionId,
        session?.database?.dbName,
      );
      const sqlId = detail?.sqlId;
      const explain = await getSQLExecuteExplain(
        sql,
        sqlId,
        session?.sessionId,
        session?.database?.dbName,
      );
      setLoadingExplain(false);

      if (explain && detail) {
        setSqlExecuteDetailToShow(detail);
        setSqlExecuteExplainToShow(explain);

        const { queueTime = 0, execTime = 0, totalTime = 0 } = detail || {
          queueTime: 0,
          waitTime: 0,
          execTime: 0,
          totalTime: 0,
          sql: '',
        };

        const queueTimeLabel = formatMessage({
          id: 'workspace.window.sql.explain.tab.detail.card.time.label.queueTime',
        });

        const execTimeLabel = formatMessage({
          id: 'workspace.window.sql.explain.tab.detail.card.time.label.execTime',
        });

        const otherTimeLabel = formatMessage({
          id: 'workspace.window.sql.explain.tab.detail.card.time.label.otherTime',
        });

        const data = [
          {
            name: formatMessage({
              id: 'odc.components.SQLPage.TimeConsumptionStatisticsUs',
            }),

            label: otherTimeLabel,
            value: totalTime - queueTime - execTime,
          },

          {
            name: formatMessage({
              id: 'odc.components.SQLPage.TimeConsumptionStatisticsUs',
            }),

            label: execTimeLabel,
            value: execTime,
          },

          {
            name: formatMessage({
              id: 'odc.components.SQLPage.TimeConsumptionStatisticsUs',
            }),

            label: queueTimeLabel,
            value: queueTime,
          },
        ];
        if (!stackBarPlot.current) {
          const StackedBar = (await import('@antv/g2plot')).StackedBar;
          stackBarPlot.current = new StackedBar(stackBarBox.current, {
            forceFit: true,
            height: 140,
            data,
            colorField: 'label',
            color: (label: string) => {
              if (label === queueTimeLabel) {
                return '#EC7F66';
              }
              if (label === execTimeLabel) {
                return '#76DCB3';
              }
              return '#F8C64A';
            },
            barSize: 24,
            yField: 'name',
            xField: 'value',
            stackField: 'label',
            xAxis: {
              visible: false,
              tickLine: {
                visible: false,
              },

              title: {
                visible: false,
              },

              grid: {
                visible: false,
              },
            },

            yAxis: {
              tickLine: {
                visible: false,
              },

              label: {
                visible: false,
              },

              title: {
                visible: false,
              },
            },

            title: {
              visible: false,
              text: '',
            },

            legend: {
              position: 'bottom-center',
            },
          });
          stackBarPlot.current.render();
        } else {
          stackBarPlot.current.changeData(data);
        }
      } else {
        message.error(
          formatMessage({
            id: 'workspace.window.sql.explain.detail.failed',
          }),
        );
      }
    },
    [traceId, sql, stackBarBox, stackBarPlot],
  );

  useEffect(() => {
    if (visible) {
      fetchExecDetail();
    }
    return () => {
      if (stackBarPlot.current) {
        stackBarPlot.current?.destroy();
        stackBarPlot.current = null;
      }
    };
  }, [sql, traceId, visible]);

  return (
    <Drawer
      title={formatMessage({
        id: 'workspace.window.sql.explain.tab.detail.title',
      })}
      placement="right"
      closable
      onClose={() => {
        onClose();
      }}
      destroyOnClose={true}
      width="96vw"
      open={visible}
      className={styles.explainDrawer}
      bodyStyle={{
        position: 'absolute',
        top: 55,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          minWidth: 1280,
        }}
      >
        <Spin spinning={loadingExplain}>
          <Row
            gutter={16}
            justify="space-between"
            style={{
              marginBottom: 16,
            }}
          >
            <Col span={8}>
              <BasicInfo sqlExecuteDetailToShow={sqlExecuteDetailToShow} />
            </Col>
            <Col span={8}>
              <TimeStatistics stackBarBox={stackBarBox} />
            </Col>
            <Col span={8}>
              <IOStatistics sqlExecuteDetailToShow={sqlExecuteDetailToShow} />
            </Col>
          </Row>
        </Spin>
        <Spin spinning={loadingExplain}>
          <SQLExplain
            tableHeight={300}
            sql={sqlExecuteDetailToShow?.sql ?? sql}
            explain={sqlExecuteExplainToShow}
            session={session}
            traceId={traceId}
          />
        </Spin>
      </div>
    </Drawer>
  );
};

export default ExecDetail;
