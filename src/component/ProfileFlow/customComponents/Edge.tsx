import { formatMessage } from '@/util/intl';
import { Tooltip } from 'antd';
import { EdgeLabelRenderer } from 'reactflow';
import { getEdgeWidth, getUnit } from '../utils';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style = {}, data }) => {
  // 转折离target 20px
  const TURNNG_LINE_GAP = 20;
  // 箭头svg id
  const ARROW_SVG_ID = 'arrowhead-start';

  const edgeEndPointY = targetY - TURNNG_LINE_GAP;

  // 根据是否有一个以上子节点tartget与source的x位置计算xOffset
  const xOffset = data?.isSingleChild ? 0 : sourceX - targetX > 4 ? -16 : 16;
  // 根据tartget与source的x位置计算yOffset
  let yOffset = data?.isSingleChild ? 25 : 10;
  // 有子节点的再单独计算
  yOffset = data.isOverlap ? yOffset + 8 : yOffset;

  // 折线path
  const pathData = `M ${sourceX + xOffset},${
    sourceY + yOffset
  } L ${targetX},${edgeEndPointY} L ${targetX},${targetY + 10}`;

  const BaseEdge = () => {
    return (
      <>
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <marker
              id={ARROW_SVG_ID}
              markerWidth="10"
              markerHeight="10"
              refX="9" // 根据箭头形状的大小调整，以确保箭头与路径起始点对齐
              refY="3.5"
              orient="auto" // 确保箭头的方向与路径的方向一致
              markerUnits="userSpaceOnUse"
            >
              {/* 绘制箭头形状 */}
              <path d="M 10 0 L 0 3.5 L 10 7 L 10 0" fill="var(--profile-line-color)" />
            </marker>
          </defs>
        </svg>

        {/* 自定义路径，使用 markerStart 属性添加箭头到路径的起始端（源端） */}
        <path
          d={pathData}
          stroke="black"
          strokeWidth="2"
          fill="none"
          markerStart={`url(#${ARROW_SVG_ID})`} // 在路径的源端添加箭头, id保持一致
          style={{
            stroke: 'var(--profile-line-color)',
            strokeWidth: getEdgeWidth(data.weight),
            ...style,
          }}
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
            transform: `translate(-50%, -50%) translate(${targetX}px,${
              targetY - TURNNG_LINE_GAP
            }px)`,

            pointerEvents: 'all',
            backgroundColor: 'var(--profile-secondry-background-color)',
            border: '1px solid var(--profile-border-color)',
            borderRadius: 2,
            padding: 2,
          }}
        >
          <Tooltip
            title={
              formatMessage({
                id: 'src.component.ProfileFlow.customComponents.F4F9EB2A',
                defaultMessage: '数据量:',
              }) + data?.weight
            }
          >
            {getUnit(data?.weight)}
          </Tooltip>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
