import React from 'react';
import styles from './index.less';

interface IProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

export default function TableCard({ title, extra, children }: IProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.extra}>{extra}</div>
      </div>
      <div className={styles.table}>{children}</div>
    </div>
  );
}
