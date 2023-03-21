import Icon from '@ant-design/icons';
import React from 'react';
import { IConStatus, IStatefulIconProps } from '.';

import styles from './index.less';

export default function commonIcon(wrapIconProps: Partial<any>) {
  const CommonIcon: React.FC<IStatefulIconProps> = (props: IStatefulIconProps) => {
    const { type, ...rest } = wrapIconProps;
    const { status, iconProps } = props;
    let IconComponent = Icon;
    if (type) {
      IconComponent = type;
    }
    switch (status) {
      case IConStatus.DISABLE: {
        return <IconComponent className={styles.disable} {...rest} {...iconProps} />;
      }
      case IConStatus.RUNNING: {
        return <IconComponent {...rest} className={styles.loading} {...iconProps} />;
      }
      case IConStatus.INIT:
      default: {
        return <IconComponent {...rest} {...iconProps} />;
      }
    }
  };
  return CommonIcon;
}
