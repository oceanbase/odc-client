import { formatMessage } from '@/util/intl';
import itemStyles from '../ListItem/index.less';
import classNames from 'classnames';
import styles from './index.less';
import { haveOCP } from '@/util/env';

const ListHeader = () => {
  return (
    <div className={classNames(styles.header)}>
      <div className={classNames(itemStyles.connectionName, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.8F42FB43',
          defaultMessage: '数据源名称',
        })}
      </div>
      <div className={classNames(itemStyles.cluster, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.89ADAD2B',
          defaultMessage: '集群',
        })}
      </div>
      <div className={classNames(itemStyles.tenant, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.430556BC',
          defaultMessage: '租户',
        })}
      </div>
      {!haveOCP() && (
        <div className={classNames(itemStyles.host, styles.headerColumn)}>
          {formatMessage({
            id: 'src.page.Datasource.Datasource.Content.ListHeader.6BC2295A',
            defaultMessage: '主机：端口',
          })}
        </div>
      )}
      <div className={classNames(itemStyles.env, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.7E37BE74',
          defaultMessage: '环境',
        })}
      </div>
      <div className={classNames(itemStyles.action, styles.headerColumn)}>
        {formatMessage({
          id: 'src.page.Datasource.Datasource.Content.ListHeader.508282AD',
          defaultMessage: '操作',
        })}
      </div>
    </div>
  );
};

export default ListHeader;
