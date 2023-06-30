import Icon from '@ant-design/icons';
import classNames from 'classnames';
import React from 'react';

import { Tooltip } from 'antd';
import styles from './index.less';

interface IProps {
  icon: React.ComponentType;
  isActive?: boolean;
  title: string;
  style?: React.CSSProperties;
  onClick: () => void;
}

const ActivityBarButton: React.FC<IProps> = function ({
  icon,
  isActive = false,
  style,
  title,
  onClick,
}) {
  return (
    <Tooltip placement="right" title={title}>
      <Icon
        onClick={onClick}
        style={style}
        className={classNames(styles.icon, { [styles.active]: isActive })}
        component={icon}
      />
    </Tooltip>
  );
};

export default ActivityBarButton;
