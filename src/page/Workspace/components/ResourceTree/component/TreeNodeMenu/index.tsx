import { AcessResult, canAcessWorkspace } from '@/component/Acess';
import { Menu } from 'antd';
import { inject, observer } from 'mobx-react';
import styles from '../TreeNodeDirectory/index.less';
import MenuConfig from './config';
import { IMenuItemConfig, IProps } from './type';

const TreeNodeMenu = (props: IProps & Partial<AcessResult>) => {
  const { type = '', connectionStore, onMenuClick, options } = props;

  return (
    <Menu
      style={{
        width: '160px',
      }}
      onClick={(e) => {
        e.domEvent.preventDefault();
        e.domEvent.stopPropagation();
        onMenuClick(e);
      }}
    >
      {MenuConfig[type]
        ? MenuConfig[type].map((item: IMenuItemConfig) => {
            // 菜单子项 显隐可独立配置
            const disabledItem = item.disabled ? item.disabled(options) : false;
            const isHideItem = item.isHide ? item.isHide(options) : false;
            const acessible = canAcessWorkspace(
              item.actionType,
              connectionStore.connection.visibleScope,
            );
            let menuItems = [];
            if (!isHideItem && acessible) {
              if (item.children?.length) {
                menuItems = [
                  <Menu.SubMenu
                    key={item.key}
                    title={item.text}
                    className={styles.ellipsis}
                    disabled={disabledItem}
                  >
                    {item.children.map((child) => {
                      return (
                        <Menu.Item key={child.key} className={styles.ellipsis}>
                          {child.text}
                        </Menu.Item>
                      );
                    })}
                  </Menu.SubMenu>,
                ];
              } else {
                menuItems = [
                  <Menu.Item key={item.key} className={styles.ellipsis} disabled={disabledItem}>
                    {item.text}
                  </Menu.Item>,
                ];
              }
            }
            return item.hasDivider && !disabledItem
              ? menuItems.concat(<Menu.Divider />)
              : menuItems;
          })
        : null}
    </Menu>
  );
};

TreeNodeMenu.defaultProps = {
  style: {},
  disabled: false,
  options: {},
};

export default inject('connectionStore')(observer(TreeNodeMenu));
