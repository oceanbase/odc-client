import { formatMessage } from '@/util/intl';
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
          <Tooltip
            title={formatMessage({
              id: 'src.component.ProfileFlow.customComponents.12BFFE42',
              defaultMessage: '缩小',
            })}
          >
            <ZoomOutOutlined size={12} />
          </Tooltip>
        </ControlButton>
        <ControlButton onClick={() => zoomIn()}>
          <Tooltip
            title={formatMessage({
              id: 'src.component.ProfileFlow.customComponents.3057F753',
              defaultMessage: '放大',
            })}
          >
            <ZoomInOutlined size={12} />
          </Tooltip>
        </ControlButton>
        <ControlButton
          onClick={() => {
            initCenter(setCenter);
          }}
        >
          <Tooltip
            title={formatMessage({
              id: 'src.component.ProfileFlow.customComponents.89BEEE9E',
              defaultMessage: '实际尺寸',
            })}
          >
            <OneToOneOutlined size={12} />
          </Tooltip>
        </ControlButton>
        <ControlButton onClick={() => fitView()}>
          <Tooltip
            title={formatMessage({
              id: 'src.component.ProfileFlow.customComponents.B32C7D03',
              defaultMessage: '适应宽度',
            })}
          >
            {' '}
            <CompressOutlined size={12} />
          </Tooltip>
        </ControlButton>
      </div>
    </Controls>
  );
}
