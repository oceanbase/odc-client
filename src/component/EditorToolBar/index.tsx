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

import Toolbar from '@/component/Toolbar';
import { formatMessage } from '@/util/intl';
import { Menu, Space, Spin } from 'antd';
import { Observer, observer } from 'mobx-react';
import { Component, ComponentType, ReactNode } from 'react';
import { ContainerQuery } from 'react-container-query';
import { IConStatus } from '../Toolbar/statefulIcon';
import { ACTIONS, ACTION_GROUPS } from './config';
import { isFunction } from 'lodash';
interface IProps {
  ctx: any;
  actionGroupKey: string;
  loading?: boolean;
  /**
   * 右侧的自定义按钮
   */
  rightExtra?: ReactNode;
  query?: {
    isHideText?: {
      maxWidth: number;
    };
    isShrinkLeft?: {
      maxWidth: number;
    };
  };
}
interface IState {}
interface ToolBarCommonAction<T> {
  name: string;
  confirmConfig?: any;
  type?: 'BUTTON' | 'BUTTON_PRIMARY';
  icon?: string | ComponentType;
  isShowText?: boolean;
  isVisible?: (ctx: T) => boolean;
  statusFunc?: (ctx: T) => IConStatus;
  action?: (ctx: T) => Promise<void>;
}
interface ToolBarMenuAction<T> {
  name: string | (() => string);
  icon?: string | ComponentType;
  type?: string;
  isVisible?: (ctx: T) => boolean;
  statusFunc?: (ctx: T) => IConStatus;
  menu?: string[];
}

interface ToolBarCustomAction<T> {
  isVisible?: (ctx: T) => boolean;
  Component?: ComponentType<any>;
}

function isCommonAction<T>(action: any): action is ToolBarCommonAction<T> {
  return action?.action;
}

function isMenuAction<T>(action: any): action is ToolBarMenuAction<T> {
  return action?.menu;
}

function isCustomAction<T>(action: any): action is ToolBarCustomAction<T> {
  return action?.Component;
}

export interface ToolBarActions<T = any> {
  [key: string]: ToolBarCommonAction<T> | ToolBarMenuAction<T> | ToolBarCustomAction<T>;
}

@observer
export default class EditorToolBar extends Component<IProps, IState> {
  // 单独触发 action
  public static async triggler(ctx: any, actionName: string) {
    const toolbarAction = ACTIONS[actionName] as ToolBarCommonAction<any>;

    if (!toolbarAction?.action) {
      return null;
    }

    await toolbarAction.action(ctx);
  } // 操作集 - 获取操作集

  private renderActionButtons(
    actionGroups: any,
    cfg?: {
      /**
       * 缩起左侧列表的个数
       */
      isShrinkGroupNumber?: number;
    },
  ) {
    const { ctx } = this.props;
    let buttonsArr = [];

    if (!actionGroups) {
      return;
    }

    function getActionButton(actionKey: string, j: number, isShowText?: boolean) {
      const actionItem = ACTIONS[actionKey];

      if (!actionItem) {
        return;
      }

      const { isVisible } = actionItem;

      if (typeof isVisible === 'function' && !isVisible(ctx)) {
        return;
      }

      if (isCustomAction(actionItem)) {
        const { Component: CustomComponent } = actionItem;
        return <CustomComponent key={actionKey} />;
      } else if (isMenuAction(actionItem)) {
        /**
         * 下拉菜单类型
         */
        const { name, icon, menu, statusFunc } = actionItem;
        const status = statusFunc ? statusFunc(ctx) : IConStatus.INIT;
        return (
          <Toolbar.ButtonMenu
            key={actionKey}
            status={status}
            icon={icon}
            text={isFunction(name) ? name() : name}
            menu={{
              items: menu?.map((menuItem, menuIndex) => {
                return {
                  key: menuItem,
                  label: getActionButton(menuItem, menuIndex, true),
                };
              }),
            }}
          />
        );
      } else if (isCommonAction(actionItem)) {
        const {
          name,
          icon,
          type,
          isShowText: itemIsShowText,
          statusFunc,
          action,
          confirmConfig,
        } = actionItem;
        /**
         * string 模式，icon 在 toolbar button 中统一定义，这边不再传递具体的 icon 组件
         */

        const status = statusFunc ? statusFunc(ctx) : IConStatus.INIT;
        let realConfirmConfig = confirmConfig;
        if (typeof confirmConfig === 'function') {
          realConfirmConfig = confirmConfig();
        }
        return (
          <Toolbar.Button
            confirmConfig={
              realConfirmConfig
                ? {
                    onConfirm: async () => {
                      await action(ctx);
                    },
                    ...realConfirmConfig,
                  }
                : undefined
            }
            status={status}
            type={type}
            key={`${j}-${actionKey}`}
            text={isFunction(name) ? name() : name}
            isShowText={isShowText || itemIsShowText}
            icon={icon}
            onClick={async () => {
              await action(ctx);
            }}
          />
        );
      } else {
        throw new Error(
          formatMessage({
            id: 'odc.component.EditorToolBar.TheToolbarIsIncorrectlyConfigured',
          }), //toolbar 配置错误！请检查 actions 中的配置符合 TS 定义
        );
      }
    }

    actionGroups.forEach((actionGroup: any, i: number) => {
      const isShrink = actionGroups.length - i - (cfg?.isShrinkGroupNumber || 0) < 1;
      let _tmpArr = [];

      actionGroup.forEach((actionKey: string, j: number) => {
        const actionItems = getActionButton(actionKey, j);

        if (actionItems) {
          _tmpArr.push(actionItems);
        }
      });
      if (isShrink) {
        if (i === actionGroups.length - 1) {
          buttonsArr.push(
            <Toolbar.ButtonPopover
              key={`${i}-tool-buttom`}
              content={<Space>{_tmpArr}</Space>}
              icon={'ELLIPSIS_MENU'}
            />,
          );
        }
      } else {
        buttonsArr = buttonsArr.concat(_tmpArr);
        if (i < actionGroups.length - 1 && _tmpArr.length) {
          buttonsArr.push(<Toolbar.Divider key={`${i}-tool-divider`} />);
        }
        _tmpArr = [];
      }
    });
    return buttonsArr;
  }

  public render() {
    const { actionGroupKey, loading, rightExtra, query } = this.props;
    const actionGroup = ACTION_GROUPS[actionGroupKey];
    return (
      <Spin spinning={loading}>
        <ContainerQuery query={query}>
          {(params) => {
            return (
              <Observer>
                {() => (
                  <Toolbar>
                    <div className="tools-left">
                      {this.renderActionButtons(actionGroup.left, {
                        isShrinkGroupNumber: params.isShrinkLeft ? 2 : 0,
                      })}
                    </div>
                    <div className="tools-right">
                      {this.renderActionButtons(actionGroup.right)}
                      {rightExtra}
                    </div>
                  </Toolbar>
                )}
              </Observer>
            );
          }}
        </ContainerQuery>
      </Spin>
    );
  }
}
