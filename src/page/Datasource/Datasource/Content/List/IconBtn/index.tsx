import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { message } from 'antd';
import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import styles from './index.less';

interface IProps {
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
  isActive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

const IconBtn = forwardRef<HTMLSpanElement, IProps>(function (
  { icon, activeIcon, isActive, style, onClick, className, ...rest },
  ref,
) {
  activeIcon = activeIcon || icon;
  const [loading, setLoading] = useState(false);
  async function _onClick() {
    if (loading) {
      message.warn(
        formatMessage({ id: 'odc.List.IconBtn.InProgressDoNotClick' }), //执行中，请勿重复点击
      );
      return;
    }
    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  }
  return (
    <Icon
      ref={ref}
      style={Object.assign({}, style)}
      className={classNames(styles.iconBtn, className, {
        [styles.active]: isActive,
      })}
      component={isActive ? activeIcon : icon}
      onClick={_onClick}
      {...rest}
    />
  );
});

export default IconBtn;
