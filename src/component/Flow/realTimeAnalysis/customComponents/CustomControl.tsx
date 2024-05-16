// import { MagicWand } from '@radix-ui/react-icons'
import ReactFlow, { Controls, ControlButton, useReactFlow } from 'reactflow';

export default function Flow() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Controls>
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
