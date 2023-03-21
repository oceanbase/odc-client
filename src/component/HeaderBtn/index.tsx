import React, { forwardRef } from 'react';
import styles from './index.less';

interface IProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
  className?: string;
}

const HeaderBtn: React.FC<IProps> = forwardRef<HTMLSpanElement, IProps>(function (props, ref) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={`${styles.button} ${className}`} ref={ref}>
      {props.children}
    </span>
  );
});

export default HeaderBtn;
