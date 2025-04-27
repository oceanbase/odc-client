import { formatMessage } from '@/util/intl';
import { Empty } from 'antd';
import styles from './index.less';

export interface IProps {
  description?: string;
}

export function ApplyDatabaseAuthEmpty({ description }: IProps) {
  return (
    <Empty
      className={styles.applyDatabaseAuthEmptyWrapper}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        description ||
        formatMessage({
          id: 'src.component.Empty.ApplyDatabaseAuthEmpty.018D078A',
          defaultMessage: '项目内暂无数据库，请联系管理员',
        })
      }
    />
  );
}
