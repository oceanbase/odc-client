import { Space } from 'antd';
import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';
import { ScheduleTaskStatusTextMap } from '@/constant/scheduleTask';

interface IProps {
  status: ScheduleTaskStatus;
}

const ScheduleTaskStatusInfo = {
  [ScheduleTaskStatus.PREPARING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.RUNNING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.ABNORMAL]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.PAUSING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.PAUSED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.RESUMING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.CANCELING]: {
    icon: (
      <LoadingOutlined
        style={{
          color: 'var(--icon-blue-color)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.FAILED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.EXEC_TIMEOUT]: {
    icon: (
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.CANCELED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),
  },
  [ScheduleTaskStatus.DONE]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),
  },
};

const ScheduleTaskStatusLabel: React.FC<IProps> = ({ status }) => {
  const statusObj = ScheduleTaskStatusInfo[status];
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
            {ScheduleTaskStatusTextMap[status]}
          </span>
        </>
      ) : null}
    </Space>
  );
};

export default ScheduleTaskStatusLabel;
