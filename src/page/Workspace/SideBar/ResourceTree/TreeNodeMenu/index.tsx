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

import DragWrapper from '@/component/Dragable/component/DragWrapper';
import snippet from '@/store/snippet';
import Icon, { InfoCircleFilled, MoreOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Tooltip } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import treeStyles from '../index.less';
import { ResourceNodeType } from '../type';
import MenuConfig from './config';
import styles from './index.less';
import { IMenuItemConfig, IProps } from './type';

const TreeNodeMenu = (props: IProps) => {
  const { type = '', dbSession, databaseFrom, node, showTip } = props;
  // menuKey 用来定制menu
  const menuKey = node?.menuKey;
  const menuItems: IMenuItemConfig[] = MenuConfig[menuKey || type];
  /**
   * 非database的情况下，必须存在session
   */
  const isSessionValid = type === ResourceNodeType.Database || dbSession;

  /**
   * 只有dbobjecttype的情况下才可以拖动，因为编辑器需要type才能做出对应的响应
   * 不可拖动
   */
  const titleNode = (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!dbSession && type !== ResourceNodeType.Database) {
          return;
        }
        node.doubleClick?.(dbSession, node, databaseFrom);
      }}
      className="ant-tree-title"
    >
      {node.title}
      {node.warning ? (
        <Tooltip placement="right" title={node.warning}>
          <InfoCircleFilled style={{ color: 'var(--icon-color-3)', paddingLeft: 5 }} />
        </Tooltip>
      ) : null}
      {node.tip && showTip ? (
        <span style={{ color: 'var(--text-color-placeholder)', paddingLeft: 5 }}>{node.tip}</span>
      ) : null}
    </span>
  );
  const nodeChild = node.dbObjectType ? (
    <DragWrapper
      key={node.key + '-drag'}
      style={{
        wordBreak: 'break-all',
        display: 'inline',
      }}
      useCustomerDragLayer={true}
      onBegin={() => {
        snippet.snippetDragging = {
          prefix: node.title?.toString(),
          body: node.title?.toString(),
          objType: node.dbObjectType,
        };
      }}
    >
      {titleNode}
    </DragWrapper>
  ) : (
    titleNode
  );
  if (!isSessionValid || !menuItems?.length) {
    return nodeChild;
  }

  function onMenuClick(item: IMenuItemConfig) {
    if (!item) {
      return;
    }
    const { run } = item;
    run?.(dbSession, node, databaseFrom);
  }

  let clickMap = {};

  function getMenuItems(items: IMenuItemConfig[]) {
    let menuItems: ItemType[] = [];
    items.forEach((item: IMenuItemConfig, index) => {
      // 菜单子项 显隐可独立配置
      const disabledItem = item.disabled ? item.disabled(dbSession, node) : false;
      const isHideItem = item.isHide ? item.isHide(dbSession, node) : false;
      let menuItem: ItemType;
      if (isHideItem) {
        return;
      }
      clickMap[item.key] = item;
      if (item.children?.length) {
        menuItem = {
          label: item.text,
          key: item.key || index,
          className: styles.ellipsis,
          disabled: disabledItem,
          children: item.children.map((child) => {
            clickMap[child.key] = child;
            return {
              key: child.key,
              className: styles.ellipsis,
              label: child.text,
            };
          }),
        };
      } else {
        menuItem = {
          key: item.key || index,
          className: styles.ellipsis,
          label: item.text,
          disabled: disabledItem,
        };
      }
      menuItems.push(menuItem);
      if (item.hasDivider) {
        menuItems.push({
          type: 'divider',
        });
      }
    });
    return menuItems;
  }

  let allItemsProp: ItemType[] = getMenuItems(menuItems);

  function actionsRender() {
    let ellipsisItems = menuItems.filter((item) => {
      return item.ellipsis;
    });

    let ellipsisItemsProp: ItemType[] = getMenuItems(ellipsisItems);

    return (
      <div className={treeStyles.menuActions}>
        {menuItems
          .map((item) => {
            const isHideItem = item.isHide ? item.isHide(dbSession, node) : false;
            if (item.ellipsis || isHideItem) {
              return null;
            }
            return (
              <Tooltip title={item.text}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuClick(item);
                  }}
                  className={styles.actionItem}
                >
                  <Icon component={item.icon || InfoCircleFilled} />
                </div>
              </Tooltip>
            );
          })
          .filter(Boolean)}
        {ellipsisItemsProp?.length ? (
          <Dropdown
            menu={{
              style: {
                width: '160px',
              },
              items: ellipsisItemsProp,
              onClick: (info) => {
                info?.domEvent?.stopPropagation();
                onMenuClick(clickMap[info.key]);
              },
            }}
            trigger={['hover']}
          >
            <div className={styles.actionItem}>
              <Icon component={MoreOutlined} />
            </div>
          </Dropdown>
        ) : null}
      </div>
    );
  }

  function envRender() {
    const env = node.env;
    if (!env) {
      return null;
    }
    return <Badge className={treeStyles.env} color={env?.style?.toLowerCase()} />;
  }

  return (
    <>
      <Dropdown
        menu={{
          style: {
            width: '160px',
          },
          items: allItemsProp,
          onClick: (info) => {
            info?.domEvent?.stopPropagation();
            onMenuClick(clickMap[info.key]);
          },
        }}
        trigger={['contextMenu']}
      >
        {nodeChild}
      </Dropdown>
      {actionsRender()}
      {envRender()}
    </>
  );
};

TreeNodeMenu.defaultProps = {
  style: {},
  disabled: false,
  options: {},
};

export default TreeNodeMenu;
