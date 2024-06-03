import { Controls, ControlButton, useReactFlow } from 'reactflow';
import { OneToOneOutlined } from '@ant-design/icons';
import { initCenter } from '../utils';

export default function Flow() {
  const { setCenter } = useReactFlow();
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
