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

import { formatMessage, getEnvLocale } from '@/util/intl';
import React, { useRef, useEffect, useContext, useMemo, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { ConsoleTextConfig, statusMapping, TaskTitle, TaskTypes } from '../../const';
import './index.less';
import { PersonalizeLayoutContext } from '@/page/Console/PersonalizeLayoutContext';
import { useNavigate } from '@umijs/max';
import { TaskTab } from '@/component/Task/interface';
import { IStat } from '@/d.ts';
import { Dayjs } from 'dayjs';

/**
 * Bar chart props interface
 */
interface IBarChartProps {
  /** Task statistics data grouped by task type */
  data: Record<string, IStat>;
  /** Selected project ID filter */
  selectedProjectId: number | undefined;
  /** Time range value (number of days or 'custom' or 'ALL') */
  timeValue: number | string;
  /** Custom date range for filtering */
  dateValue: [Dayjs, Dayjs] | null;
}

/**
 * Bar chart component for displaying task statistics
 * Shows task status distribution across different task types
 */
const BarChart: React.FC<IBarChartProps> = ({ data, selectedProjectId, timeValue, dateValue }) => {
  const { taskStatus, taskStatusColor, taskStatusType } = ConsoleTextConfig.schdules;
  const chartRef = useRef(null);
  const navigate = useNavigate();
  const [containerWidth, setContainerWidth] = useState(0);

  const { checkedKeys: allCheckedKeys, getOrderedTaskTypes } = useContext(PersonalizeLayoutContext);
  const checkedKeys = getOrderedTaskTypes().filter((item) => allCheckedKeys.includes(item));

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      const seriesData = taskStatus.map((statusName, i) => {
        return {
          name: statusName,
          type: 'bar',
          stack: formatMessage({
            id: 'src.page.Console.components.BarChart.7BBE332D',
            defaultMessage: '总量',
          }),
          barWidth: 20,
          itemStyle: {
            color: taskStatusColor[i],
          },
          data: checkedKeys.map((type) => {
            return data?.[type]?.count?.[taskStatusType[i]] || 0;
          }),
        };
      });
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          enterable: true,
          hideDelay: 300,
          position: function (point, params, dom, rect, size) {
            const [mouseX, mouseY] = point;
            const { contentSize, viewSize } = size;
            const [contentWidth, contentHeight] = contentSize;
            const [viewWidth, viewHeight] = viewSize;

            // 计算固定位置 - 在柱状图右侧或上方
            let x = mouseX + 20; // 距离鼠标右侧20px
            let y = mouseY - contentHeight - 10; // 距离鼠标上方10px

            // 如果tooltip会超出右边界，则放到左侧
            if (x + contentWidth > viewWidth) {
              x = mouseX - contentWidth - 20;
            }

            // 如果tooltip会超出上边界，则放到下方
            if (y < 0) {
              y = mouseY + 10;
            }

            // 如果tooltip会超出下边界，则上移
            if (y + contentHeight > viewHeight) {
              y = viewHeight - contentHeight - 10;
            }

            return [x, y];
          },
          formatter: function (params) {
            let total = 0;
            params.forEach((item) => {
              total += item.value;
            });

            const taskType = checkedKeys[params[0].dataIndex];
            let result = `<div class="bar-chart-tooltip">`;

            // 标题
            result += `<div class="bar-chart-tooltip-title">${params[0].name}</div>`;

            // 任务总计
            const title = formatMessage({
              id: 'src.page.Console.components.BarChart.1C57FA72',
              defaultMessage: '任务总计',
            });
            result +=
              total > 0
                ? `<div class="bar-chart-tooltip-total" data-task-type="${taskType}" data-click-type="total">
              <span class="bar-chart-tooltip-total-label">${title}</span>
              <span class="bar-chart-tooltip-total-number">${total} <span class="bar-chart-tooltip-total-arrow">></span></span>
            </div>`
                : '';

            // 各状态详情
            params.forEach((item) => {
              result += `
                <div class="bar-chart-tooltip-item" data-task-type="${taskType}" data-status="${
                taskStatusType[item.seriesIndex]
              }" data-click-type="detail">
                  <div class="bar-chart-tooltip-item-square" style="background: ${
                    item.color
                  };"></div>
                  <span class="bar-chart-tooltip-item-name">${item.seriesName}</span>
                  <span></span>
                  <span class="bar-chart-tooltip-item-value">${item.value}</span>
                  <span class="bar-chart-tooltip-item-arrow">></span>
                </div>
              `;
            });

            result += `</div>`;
            return result;
          },
          backgroundColor: 'transparent',
          borderWidth: 0,
          padding: 0,
        },
        grid: {
          left: '3%',
          right: '3%',
          bottom: '3%',
          top: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: checkedKeys.map((key) => TaskTitle[key]),
          interval: 'auto',
          axisLabel: {
            interval: 'auto',
            fontSize: 12,
            color: '#666',
            lineHeight: 16, // 设置行高
            // 英文环境按词换行，中文环境按字符换行
            formatter: function (value) {
              const isEnglish = getEnvLocale() === 'en-US';
              const maxLineLength = 12; // 每行最大字符数

              if (value.length <= maxLineLength) {
                return value;
              }

              // 英文按词换行，保持单词完整性
              const words = value.split(/\s+/);
              const lines = [];
              let currentLine = '';

              words.forEach((word) => {
                if (currentLine.length === 0) {
                  currentLine = word;
                } else if ((currentLine + ' ' + word).length <= maxLineLength) {
                  currentLine += ' ' + word;
                } else {
                  lines.push(currentLine);
                  currentLine = word;
                }
              });

              if (currentLine.length > 0) {
                lines.push(currentLine);
              }

              return lines.join('\n');
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0',
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 12,
            color: '#666',
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed',
            },
          },
        },
        series: seriesData,
      };

      chart.setOption(option);

      const handleTooltipClick = (event) => {
        const target = event.target;
        if (!target) return;

        let clickableElement = target.closest('[data-click-type]');
        if (!clickableElement) return;

        event.preventDefault();
        event.stopPropagation();

        const taskType = clickableElement.getAttribute('data-task-type');
        const clickType = clickableElement.getAttribute('data-click-type');
        const status = clickableElement.getAttribute('data-status');
        if (taskType) {
          let url = '/task';
          const searchParams = new URLSearchParams();

          searchParams.append('taskTypes', taskType);
          searchParams.append('tab', TaskTab.all);

          if (clickType === 'detail' && status) {
            // 使用状态映射将Console状态转换为任务页面状态
            const mappedStatuses = statusMapping[status] || [status];
            searchParams.append('statuses', mappedStatuses.join(','));
          } else if (clickType === 'total') {
            // 点击任务总计时，清空状态过滤器
            searchParams.append('statuses', 'clearAll');
          }

          if (selectedProjectId !== undefined) {
            searchParams.append('projectId', selectedProjectId.toString());
          } else {
            searchParams.append('projectId', 'clearAll');
          }

          if (String(timeValue) === 'custom' && dateValue?.[0] && dateValue?.[1]) {
            searchParams.append('timeRange', 'custom');
            searchParams.append('startTime', String(dateValue[0].valueOf()));
            searchParams.append('endTime', String(dateValue[1].valueOf()));
          } else if (timeValue !== undefined) {
            searchParams.append('timeRange', timeValue.toString());
            searchParams.append('startTime', '');
            searchParams.append('endTime', '');
          }

          const queryString = searchParams.toString();
          if (queryString) {
            url += `?${queryString}`;
          }

          navigate(url);
        }
      };

      const tooltipContainer = chart.getDom();
      if (tooltipContainer) {
        tooltipContainer.addEventListener('click', handleTooltipClick);
      }

      // 自适应大小并更新容器宽度
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          setContainerWidth(width);
        }
        chart.resize();
      });
      resizeObserver.observe(chartRef.current);

      return () => {
        // 清理事件监听器
        if (tooltipContainer) {
          tooltipContainer.removeEventListener('click', handleTooltipClick);
        }
        resizeObserver.disconnect();
        chart.dispose();
      };
    }
  }, [data, checkedKeys, selectedProjectId, timeValue, dateValue]);

  return <div ref={chartRef} className="bar-chart-wrapper" />;
};

export default BarChart;
