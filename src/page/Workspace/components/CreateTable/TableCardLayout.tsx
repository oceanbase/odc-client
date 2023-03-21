import React from 'react';

import styles from './index.less';

interface IProps {
  toolbar: React.ReactNode;
}

const TableCardLayout: React.FC<IProps> = function ({ toolbar, children }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.toolbar}>{toolbar}</div>
      <div className={styles.table}>{children}</div>
    </div>
  );
};

export default TableCardLayout;
