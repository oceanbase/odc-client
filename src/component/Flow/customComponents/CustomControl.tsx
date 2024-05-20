import ReactFlow, { Controls, ControlButton, useReactFlow } from 'reactflow';

export default function Flow() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Controls>
      {/* todo  实际尺寸 与 适应宽度 */}
      {/* <ControlButton
        onClick={() => {
          zoomOut();
        }}
      >
        ++
      </ControlButton> */}
    </Controls>
  );
}
