import React from 'react';

import styles from './index.less';

interface IProps {
  title: React.ReactNode;
  desc?: React.ReactNode;
  icon: React.ReactNode;
  actions: {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
  }[];
  onClick?: () => void;
}

export default function ListItem({ title, desc, icon, actions, onClick }: IProps) {
  return (
    <div
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'unset' }}
      className={styles.item}
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {desc ? <div className={styles.desc}>{desc}</div> : null}
      </div>
    </div>
  );
}
