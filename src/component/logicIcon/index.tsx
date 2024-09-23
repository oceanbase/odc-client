import { formatMessage } from '@/util/intl';
import styles from './index.less';
export default () => {
  return (
    <span className={styles.logicIcon}>
      <span className={styles.font}>
        {formatMessage({ id: 'src.component.logicIcon.70D6BF68', defaultMessage: '逻' })}
      </span>
    </span>
  );
};
