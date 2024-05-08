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
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import React, { useCallback, useEffect, useRef, useState } from 'react';

echarts.use([TooltipComponent, GridComponent, LegendComponent, BarChart, CanvasRenderer]);

import { getSQLExecuteDetail, getSQLExecuteExplain } from '@/common/network/sql';
import { ISQLExecuteDetail, ISQLExplain } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import setting from '@/store/setting';
import SQLExplain from '../../SQLExplain';
import BasicInfo from './BasicInfo';
import styles from './index.less';
import IOStatistics from './IOStatistics';
import TimeStatistics from './TimeStatistics';

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
  const stackBarPlot = useRef<echarts.ECharts>(null);
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

        const {
          queueTime = 0,
          execTime = 0,
          totalTime = 0,
        } = detail || {
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

        const values = [execTime, queueTime, totalTime - queueTime - execTime];
        const names = [execTimeLabel, queueTimeLabel, otherTimeLabel];

        const newValues = setMinValues(values);

        const data = newValues.map((newValue, index) => {
          return {
            name: names[index],
            type: 'bar',
            stack: 'total',
            label: {
              show: true,
              formatter() {
                return values[index];
              },
            },
            emphasis: {
              focus: 'series',
            },
            barWidth: '30px',
            data: [newValue],
            tooltip: {
              valueFormatter() {
                return values[index];
              },
            },
          };
        });
        if (!stackBarPlot.current) {
          stackBarPlot.current = echarts.init(stackBarBox.current, setting.theme?.chartsTheme);
        }
        stackBarPlot.current.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
            textStyle: {
              fontSize: 12,
            },
          },
          legend: {
            bottom: 0,
            itemWidth: 14,
          },
          grid: {
            // containLabel: true,
            top: 40,
            bottom: 40,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
          },
          xAxis: {
            show: false,
          },
          yAxis: {
            show: false,
            // type: "log",
            data: [
              formatMessage({
                id: 'odc.components.SQLPage.TimeConsumptionStatisticsUs',
              }),
            ],
          },
          series: data,
          backgroundColor: 'transparent',
        });
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
        stackBarPlot.current.dispose();
        stackBarPlot.current = null;
      }
    };
  }, [sql, traceId, visible]);

  useEffect(() => {
    function resize() {
      setTimeout(() => {
        stackBarPlot.current?.resize?.();
      }, 500);
    }
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

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

function setMinValues(values: number[]) {
  const sum = values.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  const newValues = values.map((value, index) => {
    return Math.floor(value * 0.7 + sum * 0.1);
  });
  return newValues;
}
