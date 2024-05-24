import ReactFlow, { Controls, ControlButton, useReactFlow } from 'reactflow';
import { OneToOneOutlined } from '@ant-design/icons';
import { transformDataForReactFlow, initCenter, handleSelectNode } from '../utils';

export default function Flow() {
  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();
  return (
    <Controls>
      <ControlButton
        onClick={() => {
          initCenter(setCenter);
        }}
      >
        <OneToOneOutlined />
      </ControlButton>
    </Controls>
  );
}
