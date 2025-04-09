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
import { DatabasePermissionType, DatabaseGroup } from '@/d.ts/database';
import SessionStore from '@/store/sessionManager/session';
import Icon, { InfoCircleFilled, MoreOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Tooltip, Popover } from 'antd';
import ConnectionPopover from '@/component/ConnectionPopover';
import treeStyles from '../index.less';
import { ResourceNodeType, TreeDataNode } from '../type';
import MenuConfig from './config';
import styles from './index.less';
import { IMenuItemConfig, IProps } from './type';
import { EnvColorMap } from '@/constant';
import classNames from 'classnames';
import { ReactNode, useContext, useMemo } from 'react';
import { menuAccessWrap } from './config/database';
import IconLoadingWrapper from './IconLoadingWrapper';
import { ItemType } from 'antd/es/menu/interface';

import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { SearchOutlined } from '@ant-design/icons';
import {
  isSupportQuickOpenGlobalSearchNodes,
  isGroupNode,
} from '@/page/Workspace/SideBar/ResourceTree/const';
import { openGlobalSearch } from '@/page/Workspace/SideBar/ResourceTree/const';
import login from '@/store/login';

export const hasExportPermission = (dbSession: SessionStore) => {
  return dbSession?.odcDatabase?.authorizedPermissionTypes?.includes(DatabasePermissionType.EXPORT);
};
export const hasChangePermission = (dbSession: SessionStore) => {
  return dbSession?.odcDatabase?.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
};
export const hasTableExportPermission = (dbSession: SessionStore, node: TreeDataNode) => {
  return node?.data?.info?.authorizedPermissionTypes?.includes(DatabasePermissionType.EXPORT);
};

export const hasTableChangePermission = (dbSession: SessionStore, node: TreeDataNode) => {
  return node?.data?.info?.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
};

const TreeNodeMenu = (props: IProps) => {
  const { type = '', dbSession, node, pollingDatabase } = props;
  const treeContext = useContext(ResourceTreeContext);
  const { setCurrentObject, groupMode } = treeContext || {};

  const showTip = useMemo(() => {
    return ![DatabaseGroup.dataSource].includes(groupMode);
  }, [groupMode]);

  // menuKey 用来定制menu
  const menuKey = node?.menuKey;

  const menuItems: IMenuItemConfig[] = MenuConfig[menuKey || type];
  /**
   * 非database的情况下，必须存在session
   */
  const isSessionValid = type === ResourceNodeType.Database || dbSession;

  const isShowGlobalSearchEntrance = isSupportQuickOpenGlobalSearchNodes(
    type as ResourceNodeType,
    node.key,
  );
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
        node.doubleClick?.(dbSession, node);
      }}
      className={classNames('ant-tree-title', styles.fullWidthTitle)}
      onClick={() => {
        setCurrentObject?.({
          value: node.key,
          type: node.type,
        });
      }}
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
      {isGroupNode(type) && isShowGlobalSearchEntrance ? (
        <SearchOutlined
          className={treeStyles.menuActions}
          onClick={(e) => {
            openGlobalSearch(node);
            e.stopPropagation();
          }}
        />
      ) : (
        ''
      )}
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
          databaseId: dbSession?.database?.databaseId,
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
    run?.(dbSession, node, pollingDatabase);
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
          children: item.children
            .map((child) => {
              const isHideChild = child.isHide ? child.isHide(dbSession, node) : false;
              if (isHideChild) {
                return null;
              }
              clickMap[child.key] = child;
              return {
                key: child.key,
                className: styles.ellipsis,
                label: menuAccessWrap(
                  child?.needAccessTypeList,
                  node?.data?.authorizedPermissionTypes,
                  child.text as ReactNode,
                ),
              };
            })
            ?.filter(Boolean),
        };
      } else {
        menuItem = {
          key: item.key || index,
          className: styles.ellipsis,
          label: item.subText
            ? [(item.text as (node: TreeDataNode) => ReactNode)(node), item.subText(node)]
            : item.text,
          disabled: disabledItem,
        };
      }
      menuItems.push(menuItem);
      if (typeof item.hasDivider === 'function' ? item.hasDivider(node) : item.hasDivider) {
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
        {isShowGlobalSearchEntrance ? (
          <SearchOutlined
            onClick={(e) => {
              openGlobalSearch(node);
              e.stopPropagation();
            }}
          />
        ) : (
          ''
        )}
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
                  {item?.key === 'REFRESH' ? (
                    <IconLoadingWrapper icon={item.icon || InfoCircleFilled} />
                  ) : (
                    <Icon component={item.icon || InfoCircleFilled} />
                  )}
                </div>
              </Tooltip>
            );
          })
          .filter(Boolean)}
        {ellipsisItemsProp?.length ? (
          <Dropdown
            menu={{
              style: {
                minWidth: '160px',
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
    return (
      <Badge className={treeStyles.env} color={EnvColorMap[env?.style?.toUpperCase()]?.tipColor} />
    );
  }

  return (
    <>
      <Popover
        showArrow={false}
        placement="right"
        content={
          node.type === ResourceNodeType.Database ? (
            <ConnectionPopover
              database={node?.data}
              connection={node?.data?.dataSource}
              showRemark
            />
          ) : undefined
        }
      >
        <Dropdown
          menu={{
            style: {
              minWidth: '160px',
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
      </Popover>
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
