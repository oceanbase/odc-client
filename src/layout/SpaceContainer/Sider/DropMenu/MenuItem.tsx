import classNames from 'classnames';
import React from 'react';

interface IProps {
  className?: string;
}

const MenuItem: React.FC<IProps> = function ({ children, className, ...rest }) {
  return (
    <div className={classNames('ant-menu-item', className)} {...rest}>
      {children}
    </div>
  );
};

export default MenuItem;
