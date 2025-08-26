import { RightOutlined } from '@ant-design/icons';
import styles from './index.less';
interface IProps {
  title: string;
  counter: number;
  onClick?: () => void;
}

const ScheduleCounter = ({ title, counter, onClick }: IProps) => {
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
