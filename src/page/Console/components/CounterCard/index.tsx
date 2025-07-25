import LabelWithIcon from '../../../../component/LabelWithIcon';
import styles from './index.less';
interface IProps {
  title: string;
  counter: number;
  status?: string;
}

const CounterCard = ({ title, counter, status }: IProps) => {
  return (
    <div className={styles.counterCard}>
      <LabelWithIcon
        icon={
          <div
            className={styles.counter}
            style={{ color: counter > 0 && status === 'failed' ? '#ff4d4f' : undefined }}
          >
            {counter || 0}
          </div>
        }
        label={<div className={styles.title}>{title || '-'}</div>}
        gap={2}
        align={['vertical', 'center']}
      />
    </div>
  );
};

export default CounterCard;
