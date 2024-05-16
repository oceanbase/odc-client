// CustomEdge.jsx
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getStraightPath, useReactFlow } from 'reactflow';

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
  const pathData = `M ${sourceX},${sourceY + 18} L ${targetX},${edgeEndPointY} L ${targetX},${
    targetY + 10
  }`;

  const widthHelper = (weight) => {
    if (weight < 20000) {
      return 1;
    } else if (weight < 40000 && weight > 20000) {
      return 2;
    } else if (weight < 60000 && weight > 40000) {
      return 3;
    } else if (weight < 80000 && weight > 60000) {
      return 4;
    } else {
      return 5;
    }
  };
  const BaseEdge = () => {
    return (
      <path
        id={id}
        style={{ stroke: '#E0E0E0', strokeWidth: widthHelper(data.weight), ...style }}
        className="react-flow__edge-path"
        d={pathData}
        markerEnd={markerEnd}
      />
    );
  };
  return (
    <>
      <BaseEdge />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            height: 20,
            width: 41,
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 2,
          }}
        >
          {data?.weight || Math.random() * 1000000}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
