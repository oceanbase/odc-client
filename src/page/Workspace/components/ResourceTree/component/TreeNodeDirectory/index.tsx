import { canAcessWorkspace } from '@/component/Acess';
import DragWrapper from '@/component/Dragable/component/DragWrapper';
import { DbObjectType, ITreeNode } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import snippetStore from '@/store/snippet';
import { Dropdown, Menu, Tree } from 'antd';
import { AntTreeNode } from 'antd/lib/tree';
import * as _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import React, { useEffect, useRef, useState } from 'react';
import TREE_NODE_ACTIONS from '../../actions';
import TreeNodeMenu from '../TreeNodeMenu';
import styles from './index.less';

const { DirectoryTree } = Tree;

interface IProps {
  // 是否需要启用 Tree默认的icon
  showIcon?: boolean;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  treeList: ITreeNode[];
  loadedKeys?: string[];
  handleLoadTreeData?: (e: AntTreeNode) => any;
  onDoubleClick: (node: ITreeNode) => void;
  onMenuClick: (e: MenuInfo, node?: ITreeNode) => void;
  getWrapperInstance: () => React.ReactNode;
}

const TreeNodeDirectory: React.FC<IProps> = (props) => {
  const { treeList, loadedKeys = [], schemaStore, showIcon, connectionStore } = props;
  const { handleLoadTreeData, onDoubleClick, onMenuClick, getWrapperInstance } = props;
  const parent = getWrapperInstance();
  const treeWrapperRef = useRef(null);
  const [wrapperHeight, setWrapperHeight] = useState(0);
  useEffect(() => {
    const resizeHeight = _.throttle(() => {
      setWrapperHeight(treeWrapperRef?.current?.offsetHeight);
    }, 500);
    setWrapperHeight(treeWrapperRef.current?.clientHeight);
    window.addEventListener('resize', resizeHeight);
    return () => {
      window.removeEventListener('resize', resizeHeight);
    };
  }, []);
  const renderTreeNodeTitle = (node: ITreeNode): JSX.Element => {
    return (
      <span
        className={styles.title}
        style={{ userSelect: 'none' }}
        onDoubleClick={() => {
          return onDoubleClick(node);
        }}
      >
        {node.title}
        <span
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {node.status || ''}
        </span>
      </span>
    );
  };

  const getTreeNodeMenu = (treeNode: ITreeNode): JSX.Element => {
    const { actions = [] } = treeNode;
    const menuItems = [];
    actions.forEach((actionKeys, i) => {
      let isEmpty = true;
      actionKeys.forEach((actionKey) => {
        const action = TREE_NODE_ACTIONS[actionKey];
        if (!action) {
          return;
        }
        const { isVisible, isDisabled, actionType } = action;
        if (!canAcessWorkspace(actionType, connectionStore.connection.visibleScope)) return;
        if (typeof isVisible !== 'undefined' && !isVisible(parent, treeNode, schemaStore)) {
          return;
        }
        isEmpty = false;
        menuItems.push(
          <Menu.Item
            {...{ dataRef: treeNode }}
            key={actionKey}
            disabled={isDisabled ? isDisabled(parent, treeNode, schemaStore) : false}
            className={styles.ellipsis}
          >
            {action.title}
          </Menu.Item>,
        );
      });
      if (actions.length - 1 !== i && !isEmpty) {
        menuItems.push(<Menu.Divider key={`divider-${i}`} />);
      }
    });
    return (
      <Menu style={{ width: '160px' }} onClick={onMenuClick}>
        {menuItems}
      </Menu>
    );
  };
  /**
   * 生成被Dropdaow组件包裹住的自定义渲染节点
   * @param node titleRender调用的对应节点
   * @param root treeData的根节点
   * @returns 返回一个被Dropdaow组件包裹住的自定义渲染节点
   */
  const generateContextMenuWrapTreeNode = (node: ITreeNode, root?: ITreeNode): JSX.Element => {
    let TreeNodeTitle: any;
    if (node.actions && node.actions.length) {
      TreeNodeTitle = (
        <Dropdown overlay={getTreeNodeMenu(node)} trigger={['contextMenu']}>
          {renderTreeNodeTitle(node)}
        </Dropdown>
      );
    } else if (
      node.type &&
      [
        'SEQUENCE',
        'VIEW',
        'TABLE',
        'COLUMN',
        'CONSTRAINT',
        'PARTITION',
        'INDEX',
        'SYNONYM',
      ].includes(node.type)
    ) {
      const { type, icon, disabled, options } = node.menu;
      TreeNodeTitle = (
        <TreeNodeMenu
          type={type}
          title={node.title as string}
          icon={icon}
          disabled={disabled}
          options={options}
          onDoubleClick={() => {
            return onDoubleClick(node);
          }}
          onMenuClick={(e: MenuInfo) => {
            return onMenuClick(e, node);
          }}
        />
      );
    } else {
      TreeNodeTitle = renderTreeNodeTitle(node);
    }
    // 根节点，增加拖动能力
    if (!root) {
      TreeNodeTitle = (
        <DragWrapper
          key={node.key}
          style={{
            wordBreak: 'break-all',
          }}
          useCustomerDragLayer={true}
          onBegin={() => {
            snippetStore.snippetDragging = {
              // @ts-ignore
              prefix: node.title,
              // @ts-ignore
              body: node.title,
              objType: node.menu?.type as DbObjectType,
            };
          }}
        >
          {TreeNodeTitle}
        </DragWrapper>
      );
    }
    return TreeNodeTitle;
  };
  return (
    <div
      style={{
        height: 'calc(100vh - 120px)',
        background: 'var(--background-tertraiy-color)',
      }}
      ref={treeWrapperRef}
    >
      <DirectoryTree
        className={styles.tree}
        selectable={false}
        loadData={handleLoadTreeData as any}
        loadedKeys={loadedKeys === null ? undefined : loadedKeys}
        height={wrapperHeight}
        treeData={treeList}
        blockNode
        titleRender={generateContextMenuWrapTreeNode}
      />
    </div>
  );
};

/**
 * 注入定制辅助信息（root, parent, topTab, theme）
 * @param item 要注入辅助信息的节点
 * @param root 要注入到子节点的根节点
 */
export const injectCustomInfo = (item: ITreeNode, root?: ITreeNode): void => {
  item.root = root || item;
  if (item && item.children && item.children.length) {
    item.children.forEach((child: ITreeNode) => {
      child.parent = item;
      if (item.topTab) {
        child.topTab = item.topTab;
      }
      if (item.theme) {
        child.theme = item.theme;
      }
    });
  }
};

/**
 * 在TreeData注入组件之前添加辅助信息
 *
 */
export const injectCustomInfoToTreeData = (treeData: ITreeNode[], root?: ITreeNode): void => {
  treeData.forEach((item) => {
    injectCustomInfo(item, root);
    if (item && item.children) {
      injectCustomInfoToTreeData(item.children, item.root);
    }
    item.dataRef = item;
  });
};

export default inject('connectionStore', 'schemaStore')(observer(TreeNodeDirectory));
