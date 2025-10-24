import itemStyles from '../ListItem/index.less';
import styles from './index.less';
import classNames from 'classnames';

const ListHeader: React.FC<{ projectTypeIsArchived: boolean }> = ({ projectTypeIsArchived }) => {
  return (
    <div className={classNames(itemStyles.item, styles.header)}>
      {projectTypeIsArchived && (
        <div className={classNames(itemStyles.block, styles.checkbox)}></div>
      )}
      <div
        className={classNames(itemStyles.block, itemStyles.name, styles.headerColumn, styles.pl12)}
      >
        项目名称
      </div>
      <div className={classNames(itemStyles.block, itemStyles.desc, styles.headerColumn)}>描述</div>
      <div className={classNames(itemStyles.block, itemStyles.users, styles.headerColumn)}>
        管理员
      </div>
      {projectTypeIsArchived && (
        <div className={classNames(itemStyles.block, itemStyles.action)}>操作</div>
      )}
    </div>
  );
};

export default ListHeader;
