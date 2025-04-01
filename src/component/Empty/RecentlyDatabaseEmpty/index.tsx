import { Empty } from 'antd';
import styles from './index.less';

interface IProps {
  height?: number;
}

export default ({ height = 268 }: IProps) => {
  return (
    <Empty
      style={{ height }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      className={styles.databaseEmpty}
      description={'暂无最近访问的数据库'}
    />
  );
};
