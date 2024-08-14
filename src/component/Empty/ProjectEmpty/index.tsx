import { Result } from 'antd';
import styles from './index.less';

export default function ProjectEmpty({ type, renderActionButton }) {
  const renderTitle = (type) => {
    switch (type) {
      case 'all':
        return <div className={styles.title}>暂无项目</div>;
      case 'deleted':
        return <div className={styles.title}>暂无归档项目</div>;
      default:
        return '';
    }
  };

  const renderSubTitle = (type) => {
    switch (type) {
      case 'all':
        return (
          <div className={styles.subTitle}>
            <div>{'作为业务协同的最小协作单元，提供统一管控规则'}</div>
            <div>{'保障团队的高效协同和数据源安全变更'}</div>
          </div>
        );
      case 'deleted':
        return (
          <div className={styles.subTitle}>
            <div>{'项目归档后，将不再支持任何协同开发活动'}</div>
          </div>
        );
      default:
        return;
    }
  };

  return (
    <>
      <Result
        status={'success'}
        title={renderTitle(type)}
        subTitle={renderSubTitle(type)}
        icon={
          <img
            src={window.publicPath + 'img/graphic_empty.svg'}
            style={{ height: 102, width: 132 }}
          />
        }
      />
      {type === 'all' && renderActionButton()}
    </>
  );
}
