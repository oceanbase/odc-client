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

import { getPrefixCls } from '@/util/utils';
import { CloseOutlined } from '@ant-design/icons';
import { Badge, Tooltip } from 'antd';
import type { BadgeProps } from 'antd/es/badge/index';
import type { TooltipPropsWithTitle } from 'antd/es/tooltip/index';
import classnames from 'classnames';
import React from 'react';
import Dragger from './Dragger';
import IconLoading from './IconLoading';
import './style/index.less';

const STORE_SIDETIP_HIDE = 'techui-sidetip-hide';

export type SideTipType = 'primary' | 'default';
export type SideTipSize = 'small' | 'default';
export interface Position {
  /**
   * @title 距离右侧
   * @description 设置悬浮按钮距离右侧边框的像素距离
   * @default "32"
   */
  right?: number;
  /**
   * @title 距离底部
   * @description 设置悬浮按钮距离底部边框的像素距离
   * @default "32"
   */
  bottom?: number;
}

export interface SideTipProps {
  /**
   * @description 自定义前缀
   * @ignore
   */
  prefixCls?: string;
  /**
   * @title 按钮类型
   * @description 按钮类型
   */
  type?: SideTipType;
  /**
   * @title 按钮尺寸
   * @description 按钮尺寸
   */
  size?: SideTipSize;
  /**
   * @title icon 地址
   * @description icon地址，可以设置图片地址或 ReactNode
   */
  icon?: string | React.ReactNode;
  /**
   * @title 指定是否打开
   * @description 指定是否打开
   * @default false
   */
  open?: boolean;
  /**
   * @title 加载中
   * @description 指定是否loading
   */
  loading?: boolean;
  /**
   * @title 是否可隐藏
   * @description 是否可隐藏
   * @default true
   */
  hideable?: boolean;
  /**
   * @title 组件 ID
   * @description 若页面中有多个侧边提示组件，则通过 id 标识当前组件，用于缓存侧边提示组件是否隐藏配置
   */
  id?: string;
  /**
   * @description style 属性
   * @ignore
   */
  style?: React.CSSProperties;
  /**
   * @description className
   * @ignore
   */
  className?: string;
  /**
   * @title 按钮 style 属性
   * @description 按钮的 style 属性
   */
  buttonStyle?: React.CSSProperties;
  /**
   * @title 按钮的 className 属性
   * @description 按钮的 className 属性
   */
  buttonClassName?: string;
  /**
   * @title 徽标属性
   * @description 徽标属性，详见antd [badge](https://ant.design/components/badge-cn/#API)属性
   */
  badge?: BadgeProps;
  /**
   * @title ToolTip 相关属性
   * @description ToolTip 相关属性
   */
  tooltip?: TooltipPropsWithTitle;
  /**
   * @title 默认是否隐藏
   * @description 按钮默认是否隐藏
   * @default false
   */
  defaultHide?: boolean;
  /**
   * @title 初始位置
   * @description 初始位置
   */
  position?: Position;
  /**
   * @description 点击气泡事件
   */
  onClick?: (e) => void;
  /**
   * @description 开始拖动
   */
  onDragStart?: () => void;
  /**
   * @description 结束拖动
   */
  onDragEnd?: () => void;
  /**
   * @description 正在拖动
   */
  onDrag?: (offset: any) => void;
  /**
   * 鼠标移入事件
   */
  onMouseEnter?: (e: MouseEvent) => void;
  /**
   * 鼠标离开事件
   */
  onMouseLeave?: (e: MouseEvent) => void;
  /**
   * @title 不可用
   * @description 不可用
   * @default false
   */
  disabled?: boolean;
  /**
   * @title 返回气泡弹出所在的容器
   * @description 返回气泡弹出所在的容器
   * @default "() => document.body"
   */
  getPopupContainer?: () => HTMLElement;
  children?: any;
}

export interface SideTipState {
  hide?: boolean;
  hovered?: boolean;
}

const getLocalStorageKey = (id?: string) => {
  return [`${STORE_SIDETIP_HIDE}`, id].join('-');
};

class SideTip extends React.Component<SideTipProps, SideTipState> {
  buttonRef;

  constructor(props) {
    super(props);
    this.buttonRef = React.createRef();
    const { id, defaultHide, hideable = true } = this.props;
    // eslint-disable-next-line no-nested-ternary
    const hide = hideable
      ? defaultHide === undefined
        ? window.localStorage.getItem(getLocalStorageKey(id)) === 'true'
        : !!defaultHide
      : false;

    this.state = {
      hide,
      hovered: false,
    };
  }

  hideSideTip = () => {
    const { id } = this.props;

    this.setState(
      {
        hide: true,
      },
      () => {
        window.localStorage.setItem(getLocalStorageKey(id), 'true');
      },
    );
  };

  onClick = (e) => {
    const { onClick, id, disabled } = this.props;

    if (this.state.hide) {
      // isHide
      this.setState(
        {
          hide: false,
        },
        () => {
          window.localStorage.removeItem(getLocalStorageKey(id));
        },
      );
    } else {
      if (disabled) return;
      // not hide, show iframe
      if (onClick) {
        onClick(e);
      }
    }
  };

  handleMouseEnter = (e) => {
    this.setState({
      hovered: true,
    });
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e);
    }
  };

  handleMouseLeave = (e) => {
    this.setState({
      hovered: false,
    });
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave(e);
    }
  };

  getTypeCls = (type: string) => {
    if (type === 'primary') return 'primary';
    return '';
  };

  getSizeCls = (size: string) => {
    if (size === 'small') return 'small';
    return '';
  };

  render() {
    const {
      open,
      loading,
      children,
      icon,
      type,
      size,
      style,
      className,
      badge,
      tooltip,
      position,
      onDragStart,
      onDragEnd,
      onDrag,
      buttonClassName: customButtonClassName,
      buttonStyle,
      id,
      hideable = true,
      disabled = false,
      prefixCls: customizePrefixCls,
      getPopupContainer,
    } = this.props;
    const { hide, hovered } = this.state;
    const prefixCls = getPrefixCls('sidetip', customizePrefixCls);
    const typeCls = this.getTypeCls(type);
    const sizeCls = this.getSizeCls(size);

    const buttonPrefix = `${prefixCls}-button`;

    // icon
    const iconClassName = classnames(`${buttonPrefix}-icon`, {
      [`${buttonPrefix}-icon-open`]: open,
      [`${buttonPrefix}-icon-disabled`]: disabled,
      [`${buttonPrefix}-icon-${typeCls}`]: typeCls,
      [`${buttonPrefix}-icon-${sizeCls}`]: sizeCls,
    });

    // 接受三种形式的icon
    const iconDom = (
      <span className={iconClassName}>
        {React.isValidElement(icon) ? (
          icon
        ) : (
          <img src={icon as string} alt="icon" width="100%" height="100%" />
        )}
      </span>
    );

    // close 按钮
    const closeClassName = classnames(`${buttonPrefix}-close`, {
      [`${buttonPrefix}-close-show`]: open,
      [`${buttonPrefix}-close-${typeCls}`]: typeCls,
      [`${buttonPrefix}-close-${sizeCls}`]: sizeCls,
    });

    const buttonClassName = classnames(buttonPrefix, customButtonClassName, {
      [`${buttonPrefix}-disabled`]: disabled,
      [`${buttonPrefix}-${typeCls}`]: typeCls,
      [`${buttonPrefix}-${sizeCls}`]: sizeCls,
    });

    const loadingClassName = classnames(`${buttonPrefix}-loading`, {
      [`${buttonPrefix}-loading-${typeCls}`]: typeCls,
      [`${buttonPrefix}-loading-${sizeCls}`]: sizeCls,
    });

    // 内部 Icon
    const InnerButton = (
      <div className={buttonClassName} ref={this.buttonRef} style={buttonStyle}>
        {loading && <IconLoading className={loadingClassName} />}
        <>
          {iconDom}
          <CloseOutlined className={closeClassName} />
        </>
      </div>
    );

    // 徽标
    const BadgeButton = badge ? (
      <Badge offset={[-6, 6]} {...badge}>
        {InnerButton}
      </Badge>
    ) : (
      InnerButton
    );

    const hideIconClassName = classnames(`${prefixCls}-hide`, {
      [`${prefixCls}-hide-hovered`]: hovered,
    });

    // 隐藏按钮
    const hideIcon = (
      <div id="ui-mini-hide" onClick={this.hideSideTip} className={hideIconClassName}>
        <div className={`${prefixCls}-hide-icon`} />
      </div>
    );

    return (
      <Dragger
        id={id}
        open={open}
        hide={hide}
        onClick={this.onClick}
        onOverlap={this.hideSideTip}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={style}
        position={position}
        prefix={prefixCls}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrag={onDrag}
        getPopupContainer={getPopupContainer}
        className={className}
      >
        {tooltip && tooltip.title ? (
          <Tooltip {...tooltip} getPopupContainer={() => this.buttonRef.current}>
            {BadgeButton}
          </Tooltip>
        ) : (
          BadgeButton
        )}
        {hideable && hideIcon}
        {children}
      </Dragger>
    );
  }
}

export default SideTip;
