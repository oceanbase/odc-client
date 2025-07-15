import { formatMessage } from '@/util/intl';
import { Divider, Empty } from 'antd';
import styles from './index.less';
import { SettingOutlined } from '@ant-design/icons';
export default () => {
  return (
    <div className={styles.projectSelectEmptyWrapper}>
      <Empty
        className={styles.empty}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={formatMessage({
          id: 'src.component.Empty.ProjectSelectEmpty.256B8DEF',
          defaultMessage: '暂无项目',
        })}
      />
      <Divider />
      <div className={styles.setting}>
        <SettingOutlined color="#1890ff" />
        <span className={styles.action} onClick={() => window.open('#/project')}>
          {formatMessage({
            id: 'src.component.Empty.ProjectSelectEmpty.E8AA0AD9',
            defaultMessage: '管理项目',
          })}
        </span>
      </div>
    </div>
  );
};
