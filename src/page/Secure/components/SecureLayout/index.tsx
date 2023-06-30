import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

interface EnvProps {}
const SecureLayout: React.FC<EnvProps> = (props) => {
  return (
    <div className={styles.secureLayout}>
      <div className={styles.sider}>{props.children[0]}</div>
      <div className={classNames(styles.content, styles.envDrawer)}>{props.children[1]}</div>
    </div>
  );
};

export default SecureLayout;
