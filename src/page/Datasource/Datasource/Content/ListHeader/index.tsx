import itemStyles from '../ListItem/index.less';
import classNames from 'classnames';
import styles from './index.less';
import { haveOCP } from '@/util/env';

const ListHeader = () => {
  return (
    <div className={classNames(styles.header)}>
      <div className={classNames(itemStyles.connectionName, styles.headerColumn)}>数据源名称</div>
      <div className={classNames(itemStyles.cluster, styles.headerColumn)}>集群</div>
      <div className={classNames(itemStyles.tenant, styles.headerColumn)}>租户</div>
      {!haveOCP() && (
        <div className={classNames(itemStyles.host, styles.headerColumn)}>主机：端口</div>
      )}
      <div className={classNames(itemStyles.env, styles.headerColumn)}>环境</div>
      <div className={classNames(itemStyles.action, styles.headerColumn)}>操作</div>
    </div>
  );
};

export default ListHeader;
