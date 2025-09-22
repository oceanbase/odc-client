import { ScheduleStatus, ScheduleType, ScheduleActionsEnum } from '@/d.ts/schedule';
import { ScheduleStatusTextMap } from '@/constant/schedule';
import Icon, {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
  CaretRightOutlined,
  StopFilled,
  PauseCircleOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import { Space } from 'antd';
import { ReactComponent as WaitingBlueSvg } from '@/svgr/waiting_blue.svg';
import { ReactComponent as ScheduleEnabledSvg } from '@/svgr/scheduleEnabled.svg';
import { ReactComponent as SchedulePauseSvg } from '@/svgr/schedulePause.svg';

const ScheduleStatusInfo = {
  [ScheduleStatus.CREATING]: {
    icon: <Icon component={WaitingBlueSvg} style={{ fontSize: 14, marginRight: '4px' }} />,
  },
  [ScheduleStatus.PAUSE]: {
    icon: <Icon component={SchedulePauseSvg} style={{ fontSize: 14, marginRight: '4px' }} />,
  },
  [ScheduleStatus.ENABLED]: {
    icon: <Icon component={ScheduleEnabledSvg} style={{ fontSize: 14, marginRight: '4px' }} />,
  },
  [ScheduleStatus.TERMINATED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),
  },
  [ScheduleStatus.CANCELED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),
  },
  [ScheduleStatus.COMPLETED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),
  },
  [ScheduleStatus.EXECUTION_FAILED]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),
  },
};

interface IProps {
  status: ScheduleStatus;
}
const ScheduleStatusLabel: React.FC<IProps> = ({ status }) => {
  const statusObj = ScheduleStatusInfo[status];
  return (
    <Space
      style={{
        overflow: 'hidden',
        maxWidth: '100%',
      }}
      size={5}
    >
      {statusObj ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {statusObj?.icon}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            {ScheduleStatusTextMap[status]}
          </span>
        </div>
      ) : null}
    </Space>
  );
};

export default ScheduleStatusLabel;
