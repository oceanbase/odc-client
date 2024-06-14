import { Controls, ControlButton, useReactFlow } from 'reactflow';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  OneToOneOutlined,
  CompressOutlined,
} from '@ant-design/icons';
import { initCenter } from '../utils';
import { Tooltip } from 'antd';
import styles from './index.less';

export default function Flow() {
  const { setCenter, zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Controls>
      <div className={styles.controls}>
        <ControlButton onClick={() => zoomOut()}>
          <Tooltip title="缩小">
            <ZoomInOutlined />
          </Tooltip>
        </ControlButton>
        <ControlButton onClick={() => zoomIn()}>
          <Tooltip title="放大">
            <ZoomOutOutlined />
          </Tooltip>
        </ControlButton>
        <ControlButton
          onClick={() => {
            initCenter(setCenter);
          }}
        >
          <Tooltip title="实际尺寸">
            <OneToOneOutlined />
          </Tooltip>
        </ControlButton>
        <ControlButton onClick={() => fitView()}>
          <Tooltip title="适应宽度">
            {' '}
            <CompressOutlined />
          </Tooltip>
        </ControlButton>
      </div>
    </Controls>
  );
}
