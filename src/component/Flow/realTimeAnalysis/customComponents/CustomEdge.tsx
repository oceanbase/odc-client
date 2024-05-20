// CustomEdge.jsx
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getStraightPath, useReactFlow } from 'reactflow';
import { Tooltip } from 'antd';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  arrowHeadType,
  markerEnd,
}) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const edgeEndPointY = targetY - 20;
  const xOffset = sourceX > targetX ? -16 : sourceX < targetX ? 16 : 0;
  const yOffset = sourceX === targetX ? 25 : 10;
  const pathData = `M ${sourceX + xOffset},${
    sourceY + yOffset
  } L ${targetX},${edgeEndPointY} L ${targetX},${targetY + 10}`;

  const widthHelper = (weight) => {
    if (weight <= 500 * 1000) {
      return 1;
    } else if (weight < 1 * 1000 * 1000 && weight > 500 * 1000) {
      return 2;
    } else if (weight <= 10 * 1000 * 1000 && weight > 1 * 1000 * 1000) {
      return 3;
    } else if (weight <= 50 * 1000 * 1000 && weight > 10 * 1000 * 10004) {
      return 4;
    } else {
      return 5;
    }
  };

  const unitTransfer = (num) => {
    if (num >= 1000 && num < 1000 * 1000) {
      return (num / 1000).toFixed(2) + 'k';
    }
    if (num >= 1000 * 1000 && num < 1000 * 1000 * 1000) {
      return (num / 1000 / 1000).toFixed(2) + 'M';
    }
    return num;
  };

  const BaseEdge = () => {
    return (
      // <path
      //   id={id}
      //   style={{ stroke: '#E0E0E0', strokeWidth: widthHelper(data.weight), ...style }}
      //   className="react-flow__edge-path"
      //   d={pathData}
      //   markerEnd='url(#arrowhead)'
      // />
      <>
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <marker
              id="arrowhead-start"
              markerWidth="10"
              markerHeight="10"
              refX="9" // 根据箭头形状的大小调整，以确保箭头与路径起始点对齐
              refY="3.5"
              orient="auto" // 确保箭头的方向与路径的方向一致
              markerUnits="userSpaceOnUse"
            >
              {/* 这里绘制箭头形状 */}
              <path d="M 10 0 L 0 3.5 L 10 7 L 10 0" fill="#E0E0E0" />
            </marker>
          </defs>
        </svg>

        {/* 自定义路径，使用 markerStart 属性添加箭头到路径的起始端（源端） */}
        <path
          d={pathData}
          stroke="black"
          strokeWidth="2"
          fill="none"
          markerStart="url(#arrowhead-start)" // 在路径的源端添加箭头
          style={{ stroke: '#E0E0E0', strokeWidth: widthHelper(data.weight), ...style }}
          id={id}
        />
      </>
    );
  };
  return (
    <>
      <BaseEdge />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${targetX}px,${targetY - 20}px)`,
            pointerEvents: 'all',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 2,
            padding: 2,
          }}
        >
          <Tooltip title={'数据量:' + data?.weight}>
            {unitTransfer(data?.weight) || Math.random() * 1000000}
          </Tooltip>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
