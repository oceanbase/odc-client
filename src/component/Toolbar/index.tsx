/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { formatMessage } from '@/util/intl';
import Icon, { CaretDownOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Divider,
  Dropdown,
  MenuProps,
  message,
  Popconfirm,
  Popover,
  Tooltip,
} from 'antd';
import { PopconfirmProps } from 'antd/lib/popconfirm';
import classNames from 'classnames'; // @ts-ignore
import { ComponentType } from 'react';
import styles from './index.less';
import statefulIcon, { IConStatus } from './statefulIcon';

const noop = () => {
  // TODO
};
function TButton({
  text,
  onClick = noop,
  icon,
  type,
  status = IConStatus.INIT,
  disabled = false,
  isMenuIcon,
  isShowText = false,
  confirmConfig,
  tip = null,
  tipStyle = { width: 296 },
  ...rest
}: {
  [key: string]: any;
  confirmConfig?: PopconfirmProps | (() => PopconfirmProps);
  status?: IConStatus;
  type?: string;
  /**
   * 是否为下拉菜单主icon
   */ isMenuIcon?: boolean;
}) {
  const isInit = status === IConStatus.INIT;
  const isRunning = status === IConStatus.RUNNING;
  disabled = disabled || status === IConStatus.DISABLE;
  const isActive = status === IConStatus.ACTIVE;
  if (typeof icon === 'function' || icon?.render) {
    icon = <Icon component={icon} />;
  } else if (typeof icon === 'string') {
    /**
     * string 模式下直接获取已经注册的 icon。
     */
    const IconComponent = statefulIcon[icon];

    if (!IconComponent) {
      icon = <Icon type={icon} />;
    } else {
      disabled = disabled || !isInit;
      icon = (
        <>
          <IconComponent status={status} />
          {isMenuIcon ? <CaretDownOutlined style={{ fontSize: 8 }} /> : null}
        </>
      );
    }
  }

  const clzName = classNames(
    styles.button,
    isRunning ? styles.isRunning : disabled ? styles.disabled : null,
    isActive ? styles.isActive : null,
  );
  if (typeof confirmConfig === 'function') {
    confirmConfig = confirmConfig();
  }
  let content = (
    <span
      {...rest}
      className={clzName}
      onClick={() => {
        if (isRunning) {
          message.success(
            formatMessage({
              id: 'odc.component.Toolbar.DoNotClickAgainWhile',
              defaultMessage: '执行中请勿重复点击',
            }), //执行中请勿重复点击
          );
        } else if (disabled || confirmConfig) {
          return;
        } else {
          onClick?.();
        }
      }}
    >
      {icon} {isShowText && <span style={{ lineHeight: 1 }}>{text}</span>}
    </span>
  );

  switch (type) {
    case 'BUTTON':
      content = (
        <Button {...rest} icon={icon} disabled={disabled} onClick={!disabled ? onClick : null}>
          {text}
        </Button>
      );

      break;
    case 'BUTTON_PRIMARY':
      content = (
        <Button
          {...rest}
          icon={icon}
          type="primary"
          disabled={disabled}
          onClick={!disabled ? onClick : null}
        >
          {text}
        </Button>
      );

      break;
    default:
      content = (
        <span
          {...rest}
          className={clzName}
          onClick={!disabled && !confirmConfig && !isRunning ? onClick : null}
        >
          {icon} {isShowText && <span className={styles.buttonText}>{text}</span>}
        </span>
      );

      break;
  }

  if (tip) {
    return (
      <Tooltip
        placement={'topLeft'}
        title={tip}
        overlayInnerStyle={tipStyle}
        color="var(--background-primary-color)"
      >
        <Badge dot={true} color="blue" style={{ top: 12, right: 6 }}>
          {content}
        </Badge>
      </Tooltip>
    );
  }

  if (confirmConfig && !disabled && !isRunning) {
    content = (
      <Popconfirm disabled={disabled} {...confirmConfig}>
        {content}
      </Popconfirm>
    );
  }

  if (!isShowText) {
    return (
      <Tooltip placement={isMenuIcon ? 'top' : 'bottom'} title={text}>
        {content}
      </Tooltip>
    );
  }
  return content;
}

function TDivider() {
  return <Divider type="vertical" className={styles.divider} />;
}

function ButtonMenu(props: {
  icon: string | ComponentType;
  menu: MenuProps;
  text: string;
  status: IConStatus;
}) {
  const { icon, menu, text, status = IConStatus.INIT } = props;
  return (
    <Dropdown menu={menu} trigger={['click']} disabled={status === IConStatus.DISABLE}>
      <TButton text={text} icon={icon} isMenuIcon={true} />
    </Dropdown>
  );
}

function ButtonPopover(props: { icon: string | ComponentType; content: any }) {
  const { icon, content } = props;
  return (
    <Popover content={content} placement="bottom">
      <TButton icon={icon} />
    </Popover>
  );
}

export default function Toolbar({ style = {}, children, compact = false }) {
  return (
    <div className={classNames([styles.toolbar, compact ? styles.compact : null])} style={style}>
      {children}
    </div>
  );
}

Toolbar.Button = TButton;
Toolbar.Divider = TDivider;
Toolbar.ButtonMenu = ButtonMenu;
Toolbar.ButtonPopover = ButtonPopover;
