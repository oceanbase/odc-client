import { RightOutlined } from '@ant-design/icons';
import styles from './index.less';
import React from 'react';

/**
 * Schedule counter component props
 */
interface IScheduleCounterProps {
  /** Counter title */
  title: string;
  /** Counter value */
  counter: number;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Schedule counter component for displaying task/schedule counts
 * Used in console page for quick navigation to filtered task/schedule lists
 */
const ScheduleCounter: React.FC<IScheduleCounterProps> = ({ title, counter, onClick }) => {
  return (
    <div className={styles.scheduleCounter}>
      <div className={styles.title}>{title || '-'}</div>
      <div className={styles.counter} onClick={onClick}>
        {counter || 0}
        <RightOutlined className={styles.icon} />
      </div>
    </div>
  );
};

export default ScheduleCounter;
