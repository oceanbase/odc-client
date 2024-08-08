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

import { LoadingOutlined } from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import React from 'react';

export interface BaseProps {
  /** 是否显示 */
  visible?: boolean;
  disabled?: boolean;
  onClick?: () => Promise<void> | void;
  children?: React.ReactElement | string;
  type?: 'default' | 'primary';
  className?: string;
  enableLoading?: boolean;
  tooltip?: string;
  placement?: TooltipPlacement;
  loading?: boolean;
  /** loading的时候覆盖children，用于icon的场景 */
  replaceLoading?: boolean;
  danger?: boolean;
  /** 不会被隐藏 */
  fixed?: boolean;
}

export class ActionButton extends React.PureComponent<BaseProps> {
  static __DISPLAY_NAME = 'button';
  state = {
    loading: false,
  };
  render() {
    const {
      type,
      disabled,
      children,
      onClick,
      enableLoading = true,
      className,
      tooltip,
      placement = null,
      loading,
      danger,
    } = this.props;
    return (
      <Tooltip placement={placement || 'top'} title={tooltip}>
        <Button
          className={className}
          loading={enableLoading && (loading || this.state.loading)}
          type={type}
          danger={danger}
          disabled={disabled}
          onClick={(_) => {
            if (enableLoading) {
              this.setState({ loading: true });

              const handle = onClick?.();

              if ((handle as Promise<void>).then) {
                (handle as Promise<void>).then(() => {
                  this.setState({ loading: false });
                });
              }
            }
          }}
        >
          {children}
        </Button>
      </Tooltip>
    );
  }
}

export class ActionLink extends React.PureComponent<BaseProps> {
  static __DISPLAY_NAME = 'link';
  state = {
    loading: false,
    disabled: false,
  };
  render() {
    const {
      disabled,
      onClick,
      children,
      className,
      enableLoading = true,
      tooltip,
      loading,
      replaceLoading,
      placement = 'top',
    } = this.props;
    return (
      <Typography.Link
        className={className}
        style={{ padding: 0 }}
        disabled={loading || disabled || this.state.disabled}
        onClick={(_) => {
          _.stopPropagation();
          _.preventDefault();
          const handle = onClick?.();

          if (enableLoading && (handle as Promise<void>)?.then) {
            this.setState({ loading: true, disabled: true });

            (handle as Promise<void>).then(() => {
              this.setState({ loading: false, disabled: false });
            });
          }
        }}
      >
        <Tooltip placement={placement} title={tooltip}>
          {loading || this.state.disabled ? <LoadingOutlined /> : ''}{' '}
          {replaceLoading && (loading || this.state.disabled) ? null : children}
        </Tooltip>
      </Typography.Link>
    );
  }
}
