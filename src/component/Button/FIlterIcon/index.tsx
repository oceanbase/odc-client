import classNames from 'classnames';
import React from 'react';

import styles from './index.less';
interface IProps {
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

const FilterIcon: React.FC<IProps> = function ({
  children,
  className,
  isActive,
  onClick,
  ...rest
}) {
  return (
    <div
      className={classNames(styles.icon, { [styles.iconActive]: isActive }, className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

export default FilterIcon;
