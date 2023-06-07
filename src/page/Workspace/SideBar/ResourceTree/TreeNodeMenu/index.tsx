import { AcessResult } from '@/component/Acess';
import DragWrapper from '@/component/Dragable/component/DragWrapper';
import snippet from '@/store/snippet';
import { InfoCircleFilled } from '@ant-design/icons';
import { Dropdown, Menu, Tooltip } from 'antd';
import { ResourceNodeType } from '../type';
import MenuConfig from './config';
import styles from './index.less';
import { IMenuItemConfig, IProps } from './type';

const TreeNodeMenu = (props: IProps & Partial<AcessResult>) => {
  const { type = '', dbSession, databaseFrom, node } = props;
  // menuKey 用来定制menu
  const menuKey = node?.menuKey;
  const menuItems = MenuConfig[menuKey || type];
  /**
   * 非database的情况下，必须存在session
   */
  const isSessionValid = type === ResourceNodeType.Database || dbSession;

  /**
   * 只有dbobjecttype的情况下才可以拖动，因为编辑器需要type才能做出对应的响应
   * 不可拖动
   */
  const titleNode = (
    <span className="ant-tree-title">
      {node.title}
      {node.warning ? (
        <Tooltip placement="right" title={node.warning}>
          <InfoCircleFilled style={{ color: 'var(--icon-color-3)', paddingLeft: 5 }} />
        </Tooltip>
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
    const { run } = item;
    run?.(dbSession, node, databaseFrom);
  }
  return (
    <Dropdown
      overlay={
        <Menu
          style={{
            width: '160px',
          }}
          onClick={(e) => {
            e.domEvent.preventDefault();
            e.domEvent.stopPropagation();
          }}
        >
          {menuItems
            ? menuItems.map((item: IMenuItemConfig, index) => {
                // 菜单子项 显隐可独立配置
                const disabledItem = item.disabled ? item.disabled(dbSession, node) : false;
                const isHideItem = item.isHide ? item.isHide(dbSession, node) : false;
                const acessible = true;
                let menuItems = [];
                if (!isHideItem && acessible) {
                  if (item.children?.length) {
                    menuItems = [
                      <Menu.SubMenu
                        key={item.key || index}
                        title={item.text}
                        className={styles.ellipsis}
                        disabled={disabledItem}
                      >
                        {item.children.map((child) => {
                          return (
                            <Menu.Item
                              onClick={() => onMenuClick(child)}
                              key={child.key}
                              className={styles.ellipsis}
                            >
                              {child.text}
                            </Menu.Item>
                          );
                        })}
                      </Menu.SubMenu>,
                    ];
                  } else {
                    menuItems = [
                      <Menu.Item
                        onClick={() => onMenuClick(item)}
                        key={item.key || index}
                        className={styles.ellipsis}
                        disabled={disabledItem}
                      >
                        {item.text}
                      </Menu.Item>,
                    ];
                  }
                }
                return item.hasDivider && !disabledItem
                  ? menuItems.concat(<Menu.Divider />)
                  : menuItems;
              })
            : []}
        </Menu>
      }
      trigger={['contextMenu']}
    >
      {nodeChild}
    </Dropdown>
  );
};

TreeNodeMenu.defaultProps = {
  style: {},
  disabled: false,
  options: {},
};

export default TreeNodeMenu;
