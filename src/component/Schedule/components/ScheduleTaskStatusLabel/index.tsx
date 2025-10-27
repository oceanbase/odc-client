import { formatMessage } from '@/util/intl';
import { Space, Tooltip } from 'antd';
import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';
import Icon, {
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleOutlined,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';
import { ScheduleTaskStatusTextMap } from '@/constant/scheduleTask';
import { ReactComponent as ProcessingSvg } from '@/svgr/processing.svg';
import { ReactComponent as PausingSvg } from '@/svgr/pausing.svg';
import { ReactComponent as WaitingYellowSvg } from '@/svgr/waiting_yellow.svg';
import { ReactComponent as ExecutionTimeoutSvg } from '@/svgr/executionTimeout.svg';
import styles from './index.less';
interface IProps {
  status: ScheduleTaskStatus;
}

const ScheduleTaskStatusInfo: Record<
  ScheduleTaskStatus,
  { icon: React.ReactNode; desc?: React.ReactNode }
> = {
  [ScheduleTaskStatus.PREPARING]: {
    icon: <Icon component={ProcessingSvg} style={{ fontSize: 14 }} />,
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
    icon: <Icon component={ExecutionTimeoutSvg} style={{ fontSize: 14 }} />,
  },
  [ScheduleTaskStatus.PAUSING]: {
    icon: <Icon component={PausingSvg} style={{ fontSize: 14 }} />,
  },
  [ScheduleTaskStatus.PAUSED]: {
    icon: <Icon component={WaitingYellowSvg} style={{ fontSize: 14 }} />,
  },
  [ScheduleTaskStatus.RESUMING]: {
    icon: <Icon component={ProcessingSvg} style={{ fontSize: 14 }} />,
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
      <CloseCircleFilled
        style={{
          color: 'var(--function-red6-color)',
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
  [ScheduleTaskStatus.DONE_WITH_FAILED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),

    desc: (
      <Tooltip
        title={formatMessage({
          id: 'src.component.Schedule.components.ScheduleTaskStatusLabel.8941517C',
          defaultMessage: '执行时存在错误，已跳过',
        })}
      >
        <InfoCircleOutlined className={styles.warningIcon} />
      </Tooltip>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
          {statusObj?.desc}
        </div>
      ) : null}
    </Space>
  );
};

export default ScheduleTaskStatusLabel;
