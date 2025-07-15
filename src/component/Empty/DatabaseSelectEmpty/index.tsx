import { formatMessage } from '@/util/intl';
import { Empty } from 'antd';
import styles from './index.less';
import { ExportOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import login from '@/store/login';

interface IProps {
  showIcon?: boolean;
  height?: number;
}
export default ({ showIcon, height = 280 }: IProps) => {
  return (
    <div className={styles.databaseSelectEmptyhWrapper}>
      <Empty
        className={styles.empty}
        style={{ height }}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className={styles.description}>
            <div className={styles.title}>
              {formatMessage({
                id: 'src.component.Empty.DatabaseSelectEmpty.9C21267F',
                defaultMessage: '暂无数据库',
              })}
            </div>
            {login.isPrivateSpace() ? (
              <></>
            ) : (
              <div className={styles.subDescription}>
                {showIcon
                  ? formatMessage({
                      id: 'src.component.Empty.DatabaseSelectEmpty.953DB46B',
                      defaultMessage:
                        '仅展示全部项目内的数据库，请先确认已加入项目、且项目内存在数据库。',
                    })
                  : formatMessage({
                      id: 'src.component.Empty.DatabaseSelectEmpty.7272411D',
                      defaultMessage:
                        '仅支持选择项目内的数据库，请先确认已加入项目、且项目内存在数据库。',
                    })}
                <span className={styles.action} onClick={() => window.open('#/project')}>
                  {formatMessage({
                    id: 'src.component.Empty.DatabaseSelectEmpty.8F714B05',
                    defaultMessage: '管理项目',
                  })}
                  {showIcon && <ExportOutlined style={{ marginLeft: 4 }} />}
                </span>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};
