import Icon from '@ant-design/icons';
import { Badge, Tooltip } from 'antd';
import classNames from 'classnames';

import styles from './index.less';

interface IProps {
  collapsed: boolean;
  icon: any;
  label: React.ReactNode;
  selected?: boolean;
  disableTip?: boolean;
  showDot?: boolean;
}

export default function ({
  collapsed,
  icon,
  label,
  selected,
  disableTip,
  showDot,
  ...rest
}: IProps) {
  if (collapsed) {
    if (disableTip) {
      return (
        <Icon
          {...rest}
          className={classNames(styles.collapsedIcon, {
            [styles.selected]: selected,
          })}
          component={icon}
        />
      );
    }
    return (
      <Tooltip title={label} placement="right">
        <Badge dot={showDot}>
          <Icon
            className={classNames(styles.collapsedIcon, {
              [styles.selected]: selected,
            })}
            component={icon}
          />
        </Badge>
      </Tooltip>
    );
  }
  return (
    <div {...rest} className={classNames(styles.item, { [styles.selected]: selected })}>
      <Icon style={{ fontSize: 14 }} component={icon} />
      <span style={{ marginLeft: 12, lineHeight: 1, flex: 1 }}>{label}</span>
    </div>
  );
}
