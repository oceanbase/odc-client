import { formatMessage } from '@/util/intl';
import { Empty } from 'antd';
import styles from './index.less';

interface IProps {
  height?: number;
  color?: string;
}

export default ({ height = 268, color }: IProps) => {
  return (
    <Empty
      style={{ height }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      className={styles.databaseEmpty}
      description={
        <span style={{ color }}>
          {formatMessage({
            id: 'src.component.Empty.RecentlyDatabaseEmpty.94C7FC75',
            defaultMessage: '暂无最近访问的数据库',
          })}
        </span>
      }
    />
  );
};
