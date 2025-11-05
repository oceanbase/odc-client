import { formatMessage, getEnvLocale } from '@/util/intl';
import React, { useRef, useEffect, useContext, useMemo, useState } from 'react';
import * as echarts from 'echarts';
import { ConsoleTextConfig, TaskTitle, TaskTypes } from '../../const';
import './index.less';
import { PersonalizeLayoutContext } from '@/page/Console/PersonalizeLayoutContext';
import { useNavigate } from '@umijs/max';
import { TaskTab } from '@/component/Task/interface';

const BarChart = ({ data, selectedProjectId, timeValue, dateValue }) => {
  const { taskStatus, taskStatusColor, taskStatusType } = ConsoleTextConfig.schdules;
  const chartRef = useRef(null);
  const navigate = useNavigate();
  const [containerWidth, setContainerWidth] = useState(0);

  // 状态映射：Console状态 -> 任务页面状态
  const statusMapping = {
    EXECUTING: ['EXECUTING'],
    EXECUTION_SUCCESS: ['EXECUTION_SUCCEEDED', 'EXECUTION_SUCCEEDED_WITH_ERRORS'],
    ACCESS_FAILURE: [
      'PRE_CHECK_FAILED',
      'REJECTED',
      'APPROVAL_EXPIRED',
      'WAIT_FOR_EXECUTION_EXPIRED',
    ],

    EXECUTION_INTERRUPTION: ['EXECUTION_ABNORMAL', 'EXECUTION_FAILED', 'EXECUTION_EXPIRED'],
    OTHER: [
      'CREATED',
      'PRE_CHECK_EXECUTING',
      'APPROVING',
      'WAIT_FOR_SCHEDULE_EXECUTION',
      'WAIT_FOR_EXECUTION',
      'CANCELLED',
    ],
  };
  const {
    checkedKeys: allCheckedKeys,
    getOrderedTaskTypes,
    getOrderedScheduleTypes,
  } = useContext(PersonalizeLayoutContext);
  const checkedKeys = getOrderedTaskTypes().filter((item) => allCheckedKeys.includes(item));
  const checkedSchedules = getOrderedScheduleTypes().filter((item) =>
    allCheckedKeys.includes(item),
  );

  // 计算是否需要隔一个显示标签
  // 每个柱状图大约需要 80px 的宽度才能完整显示标签
  const shouldSkipLabels = useMemo(() => {
    const locale = getEnvLocale();
    const isEnglish = locale === 'en-US';
    const minWidthPerBar = isEnglish ? 160 : 80; // 每个柱状图最小宽度
    const totalNeededWidth = checkedKeys.length * minWidthPerBar;
    return containerWidth > 0 && containerWidth < totalNeededWidth && checkedKeys.length >= 8;
  }, [containerWidth, checkedKeys.length]);

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
              <span>${title}</span>
              <span class="bar-chart-tooltip-total-number">${total}  <span class="bar-chart-tooltip-total-arrow">></span></span>
            
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
          right: '4%',
          bottom: '0%',
          top: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: checkedKeys.map((key) => TaskTitle[key]),
          axisLabel: {
            interval: shouldSkipLabels ? 1 : 0, // 根据容器宽度决定是否隔一个显示
            fontSize: 12,
            color: '#666',
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
  }, [data, checkedKeys, selectedProjectId, timeValue, dateValue, navigate, shouldSkipLabels]);

  return <div ref={chartRef} className="bar-chart-wrapper" />;
};

export default BarChart;
