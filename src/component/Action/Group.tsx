import { EllipsisOutlined, LoadingOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Space, Tooltip, Typography } from 'antd';
import { isBoolean, max, omit } from 'lodash';
import React from 'react';
import type { BaseProps } from './Item';

export interface GroupProps {
  size?: number;
  dropDownPlacement?:
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight';
  children: React.ReactElement<BaseProps> | React.ReactElement<BaseProps>[];
  shouldVisible?: (key: string) => boolean;
  shouldDisabled?: (key: string) => boolean;
  enableLoading?: boolean;
  /** 更多操作的自定义展示 */
  moreText?: string | React.ReactElement;
  ellipsisIcon?: 'horizontal' | 'vertical';
}

type ellipsisType = 'default' | 'link';

const getOrder = ({ type, fixed }: { type?: string; fixed?: boolean }) => {
  const ORDER_SET = { primary: 3, fixed: 2, default: 0 };
  let order = ORDER_SET.default;
  if (type === 'primary') {
    order += ORDER_SET.primary;
  }
  if (fixed) {
    order += ORDER_SET.fixed;
  }
  return order;
};

export default ({
  size = 3,
  children,
  dropDownPlacement,
  shouldVisible,
  shouldDisabled,
  enableLoading,
  moreText,
  ellipsisIcon = 'horizontal',
}: GroupProps) => {
  const EllipsisIcon = ellipsisIcon === 'vertical' ? MoreOutlined : EllipsisOutlined;
  const visibleActions = Array.isArray(children)
    ? children.filter((c) => {
        if (isBoolean(c.props.visible) && shouldVisible)
          return c.props.visible && shouldVisible(c.key as string);
        if (isBoolean(c.props.visible)) return c.props.visible;
        else if (shouldVisible) return shouldVisible(c.key as string);
        return true;
      })
    : [children];

  const visibleActionsSort = visibleActions.slice(0);

  visibleActionsSort.sort((a, b) => {
    const orderA = getOrder(a.props);
    const orderB = getOrder(b.props);

    return orderB - orderA;
  });

  const fixedSize = visibleActionsSort.filter(
    (action) => action.props.type === 'primary' || action.props.fixed,
  ).length;
  const realSize = max([fixedSize, size]);

  const mainActions = visibleActionsSort.slice(0, realSize);
  const ellipsisActions = visibleActionsSort.slice(realSize);

  let ellipsisType: ellipsisType = 'link';

  if (
    visibleActionsSort.every(
      // @ts-ignore
      (action) => action.type.__DISPLAY_NAME === 'button',
    )
  ) {
    ellipsisType = 'default';
  }

  const getDefaultDisabled = (key: string) => shouldDisabled?.(key as string) ?? false;

  let moreDom: string | React.ReactElement;

  if (ellipsisType === 'default') {
    moreDom = (
      <Button type={ellipsisType}>
        {moreText ?? <EllipsisIcon style={{ cursor: 'pointer' }} />}
      </Button>
    );
  } else {
    moreDom =
      ellipsisIcon === 'vertical' ? (
        <Typography.Link style={{ color: 'var(--icon-color-normal)' }}>
          {moreText ?? <EllipsisIcon style={{ cursor: 'pointer' }} />}
        </Typography.Link>
      ) : (
        <Typography.Link>
          {moreText ?? <EllipsisIcon style={{ cursor: 'pointer' }} />}
        </Typography.Link>
      );
  }

  return (
    <Space size={8}>
      {mainActions.map((action) => {
        return React.cloneElement(action, {
          ...action.props,
          enableLoading: enableLoading,
          disabled: isBoolean(action.props.disabled)
            ? action.props.disabled
            : getDefaultDisabled(action.key as string),
        });
      })}
      {ellipsisActions.length > 0 && (
        <Dropdown
          placement={dropDownPlacement}
          overlay={
            <Menu>
              {ellipsisActions.map((action, index) => {
                const actionKey = action.key;
                let disabled = false;
                if (isBoolean(action.props.disabled)) disabled = action.props.disabled;
                else if (shouldDisabled) disabled = shouldDisabled(action.key as string);
                // 当用户传入loading 或者 传入 disabled 的情况都要禁用按钮
                const actionDisabled =
                  action.props.loading ||
                  (isBoolean(action.props.disabled)
                    ? action.props.disabled
                    : getDefaultDisabled(action.key as string));
                return (
                  <Menu.Item
                    key={(actionKey as string) ?? index.toString()}
                    style={{ minWidth: 120 }}
                    {...omit(action.props, 'disabled')}
                    disabled={actionDisabled}
                    onClick={(info) => {
                      info.domEvent.stopPropagation();
                      action.props.onClick?.();
                    }}
                  >
                    <Tooltip title={action.props.tooltip}>
                      {action.props.loading && <LoadingOutlined />} {action.props.children}
                    </Tooltip>
                  </Menu.Item>
                );
              })}
            </Menu>
          }
        >
          {moreDom}
        </Dropdown>
      )}
    </Space>
  );
};
