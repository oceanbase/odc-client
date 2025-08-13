import { ScheduleStatus, ScheduleType, ScheduleActionsEnum } from '@/d.ts/schedule';
import { ScheduleStatusTextMap } from '@/constant/schedule';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
  StopFilled,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { Space } from 'antd';

const ScheduleStatusInfo = {
  [ScheduleStatus.CREATING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
  },
  [ScheduleStatus.PAUSE]: {
    icon: (
      <PauseCircleOutlined
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),
  },
  [ScheduleStatus.ENABLED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),
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
        <>
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
        </>
      ) : null}
    </Space>
  );
};

export default ScheduleStatusLabel;
