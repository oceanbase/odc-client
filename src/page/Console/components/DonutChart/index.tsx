import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { ConsoleTextConfig } from '../../const';
import './index.less';

const PieChart = ({ progress }) => {
  const { status, statusType, statusColor } = ConsoleTextConfig.schdules;

  const chartRef = useRef(null);
  const total = statusType.reduce(
    (sum, key) => sum + (parseInt(progress?.taskStat?.[key]) || 0),
    0,
  );

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);

      const data = status.map((name, i) => {
        const count = parseInt(progress?.taskStat?.[statusType[i]]) || 0;
        return {
          name,
          value: count,
          itemStyle: {
            color: count > 0 ? statusColor[i] : '#0000000a',
          },
          tooltip: {
            show: count > 0,
          },
        };
      });

      const option = {
        tooltip: {
          trigger: 'item',
          position: (point, params, dom, rect, size) => {
            const [mouseX, mouseY] = point;
            const { contentSize, viewSize } = size; // `contentSize` 是 tooltip 的尺寸 [width, height]
            const [contentWidth, contentHeight] = contentSize; // Tooltip 的宽高
            const [viewWidth, viewHeight] = viewSize; // 视图宽高

            let x = mouseX + 10; // 在右侧 10px 开始
            let y = mouseY - contentHeight - 10; // 在上方 10px 开始

            // 如果 tooltip 会超出屏幕右侧，则调整到左侧
            if (x + contentWidth > viewWidth) {
              x = mouseX - contentWidth - 10;
            }

            // 如果 tooltip 会超出屏幕左侧，则调整到右侧
            if (x < 0) {
              x = mouseX + 10;
            }

            // 如果 tooltip 会超出屏幕顶部，则下移
            if (y < 0) {
              y = mouseY + 10;
            }

            // 如果 tooltip 会超出屏幕底部，则上移
            if (y + contentHeight > viewHeight) {
              y = mouseY - contentHeight - 10;
            }

            // 确保 tooltip 不会遮挡饼图
            const centerX = viewWidth / 2;
            const centerY = viewHeight / 2;
            const radius = Math.min(viewWidth, viewHeight) * 0.6; // 饼图半径
            const distanceToCenter = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);

            if (distanceToCenter < radius) {
              // 如果鼠标在饼图内部，则将 tooltip 放置在饼图外部
              const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
              const offsetX = Math.cos(angle) * radius;
              const offsetY = Math.sin(angle) * radius;

              // 计算 tooltip 的位置
              x = centerX + offsetX + 10;
              y = centerY + offsetY + 10;

              // 检查 tooltip 是否超出视图边界并调整位置
              if (x + contentWidth > viewWidth) {
                x = centerX + offsetX - contentWidth - 10;
              }
              if (x < 0) {
                x = centerX + offsetX + 10;
              }
              if (y + contentHeight > viewHeight) {
                y = centerY + offsetY - contentHeight - 10;
              }
              if (y < 0) {
                y = centerY + offsetY + 10;
              }
            }

            return [x, y];
          },
          formatter: (params) => {
            const value = params.value;
            const name = params.name;
            return `
              <div class="tooltip">
                <div class="tooltipItem">
                  <div class="tooltipMarker" style="background: ${params.color};"></div>
                  <div class="tooltipText">${name}<span class="tooltipCount">${value}</span></div>
                </div>
              </div>
            `;
          },
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          padding: 0,
        },
        series: [
          {
            type: 'pie',
            radius: ['60%', '100%'],
            center: ['50%', '50%'],
            data,
            label: {
              show: false,
            },
            emphasis: {
              itemStyle: {
                opacity: 1,
              },
            },
            blur: {
              itemStyle: {
                opacity: 0.5,
              },
            },
            scale: 1,
            hoverAnimation: false,
          },
        ],
      };

      chart.setOption(option);

      return () => {
        chart.dispose();
      };
    }
  }, [progress, total, status, statusType, statusColor]);

  return <div ref={chartRef} className="chart-container" style={{ width: 108, height: 108 }} />;
};

export default PieChart;
