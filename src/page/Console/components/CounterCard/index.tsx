import styles from './index.less';
interface IProps {
  title: string;
  counter: number;
  status?: string;
  onClick?: () => void;
}

const CounterCard = ({ title, counter, status, onClick }: IProps) => {
  return (
    <div className={styles.counterCard}>
      <div className={styles.title}>{title || '-'}</div>
      <div
        className={styles.counter}
        onClick={onClick}
        style={{ color: counter > 0 && status === 'failed' ? '#ff4d4f' : undefined }}
      >
        {counter || 0}
        <span className={styles.icon}>&gt;</span>
      </div>
    </div>
  );
};

export default CounterCard;
