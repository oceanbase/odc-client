import React, { useRef, useEffect, useContext, useMemo } from 'react';
import * as echarts from 'echarts';
import { ConsoleTextConfig, TaskTitle, TaskTypes } from '../../const';
import './index.less';
import { PersonalizeLayoutContext } from '@/page/Console/PersonalizeLayoutContext';

const BarChart = ({ data }) => {
  const { status, statusColor, statusType } = ConsoleTextConfig.schdules;
  const chartRef = useRef(null);
  const {
    checkedKeys: allCheckedKeys,
    getOrderedTaskTypes,
    getOrderedScheduleTypes,
  } = useContext(PersonalizeLayoutContext);
  const checkedKeys = getOrderedTaskTypes().filter((item) => allCheckedKeys.includes(item));
  const checkedSchedules = getOrderedScheduleTypes().filter((item) =>
    allCheckedKeys.includes(item),
  );

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      // 处理数据 - 使用与饼图相同的4个任务类型
      const seriesData = status.map((statusName, i) => {
        return {
          name: statusName,
          type: 'bar',
          stack: '总量',
          barWidth: 20,
          itemStyle: {
            color: statusColor[i],
          },
          data: checkedKeys.map((type) => {
            return data?.[type]?.count?.[statusType[i]] || 0;
          }),
        };
      });
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: function (params) {
            let total = 0;
            params.forEach((item) => {
              total += item.value;
            });

            let result = `<div class="bar-chart-tooltip">`;

            // 标题
            result += `<div class="bar-chart-tooltip-title">${params[0].name}</div>`;

            // 任务总计
            result +=
              total > 0
                ? `<div class="bar-chart-tooltip-total">
              <span>任务总计</span>
              <span class="bar-chart-tooltip-total-number">${total}  <span class="bar-chart-tooltip-total-arrow">></span></span>
            
            </div>`
                : '';

            // 各状态详情
            params.forEach((item) => {
              if (item.value > 0) {
                result += `
                  <div class="bar-chart-tooltip-item">
                    <div class="bar-chart-tooltip-item-dot" style="background: ${item.color};"></div>
                    <span class="bar-chart-tooltip-item-name">${item.seriesName}</span>
                    <span class="bar-chart-tooltip-item-value">${item.value}</span>
                    <span class="bar-chart-tooltip-item-arrow">></span>
                  </div>
                `;
              }
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
          bottom: '15%',
          top: '5%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: checkedKeys.map((key) => TaskTitle[key]),
          axisLabel: {
            interval: 0,
            fontSize: 12,
            color: '#666',
            formatter: function (value, index) {
              if (checkedKeys.length > 8 && checkedSchedules?.length > 0) {
                return index % 2 ? '' : value;
              }
              return value;
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

      // 自适应大小
      const resizeObserver = new ResizeObserver(() => {
        chart.resize();
      });
      resizeObserver.observe(chartRef.current);

      return () => {
        resizeObserver.disconnect();
        chart.dispose();
      };
    }
  }, [data, checkedKeys]);

  return <div ref={chartRef} className="bar-chart-wrapper" />;
};

export default BarChart;
