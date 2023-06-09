import React from 'react';

import Action from '@/component/Action';
import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import styles from './index.less';

interface IProps {
  title: React.ReactNode;
  desc?: React.ReactNode;
  icon: React.ReactNode;
  actions: {
    icon: IconComponentProps['component'];
    title: string;
    onClick: () => void;
  }[];
  actionSize?: number;
  onClick?: () => void;
}

export default function ListItem({ title, actionSize, desc, icon, actions, onClick }: IProps) {
  actionSize = actionSize || 1;

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
      {!!actions?.length && (
        <div className={styles.actions}>
          <Action.Group ellipsisIcon="vertical" size={actionSize || 1}>
            {actions?.map((action, i) => {
              return (
                <Action.Link tooltip={action.title} key={i} onClick={action.onClick}>
                  {actionSize < i + 1 ? (
                    action.title
                  ) : (
                    <Icon className={styles.icon} component={action.icon} />
                  )}
                </Action.Link>
              );
            })}
          </Action.Group>
        </div>
      )}
    </div>
  );
}
