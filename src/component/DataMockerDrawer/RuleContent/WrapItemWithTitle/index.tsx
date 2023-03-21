import { SelectProps } from 'antd/es/select';
import React from 'react';

import styles from './index.less';

interface ISelectWithTitleProps extends SelectProps<any> {
  addonBefore: string;
}

const WrapItemWithTitle: React.FC<ISelectWithTitleProps> = (props) => {
  const { addonBefore, children, ...rest } = props;
  let item;
  if (React.isValidElement(children)) {
    item = React.cloneElement(children, {
      className: styles.inputItem,
      ...rest,
      ...children.props,
    });
  }
  return (
    <span className={styles.selecWithTitle}>
      <span className={styles.addonBefore}>{addonBefore}</span>
      {item}
    </span>
  );
};
export default WrapItemWithTitle;
