import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';
import { formatMessage } from '@/util/intl';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import styles from './index.less';

export const ScheduleTaskStatusIconMap = {
  [ScheduleTaskStatus.DONE_WITH_FAILED]: (
    <Tooltip
      title={formatMessage({
        id: 'src.component.Schedule.layout.Header.Filter.EA3A6052',
        defaultMessage: '执行时存在错误，已跳过',
      })}
    >
      <InfoCircleOutlined className={styles.warningIcon} />
    </Tooltip>
  ),
};
