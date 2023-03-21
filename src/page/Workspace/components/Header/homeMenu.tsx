import { ConnectionStore } from '@/store/connection';
import { PageStore } from '@/store/page';
import HomeMenuSvg from '@/svgr/homeMenu.svg'; // @ts-ignore
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Dropdown, Menu, message, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React from 'react';
import { history } from 'umi';

import HeaderBtn from '@/component/HeaderBtn';
import ODCBlackSvg from '@/svgr/odc_black.svg';
import ConnectionMenuList from './ConnectionMenuList';
import styles from './index.less';

interface IHomeMenuProps {
  pageStore?: PageStore;
  connectionStore?: ConnectionStore;
}

const SubMenu = Menu.SubMenu;

@inject('pageStore', 'connectionStore')
@observer
class HomeMenu extends React.Component<IHomeMenuProps> {
  state = {
    visible: false,
  };

  public handleGoBack = async () => {
    const { pages = [] } = this.props.pageStore;
    const self = this;
    const hasUnSavedPage = pages.find((page) => !page.isSaved); // 有未关闭窗口，退出前可以先提示
    const hasDebugPage = pages.find((page) => page?.params?.isDocked === true);
    if (hasDebugPage) {
      message.warn(
        formatMessage(
          {
            id: 'odc.components.Header.homeMenu.HasdebugpagetitleIsBeingDebuggedAnd',
          },
          { hasDebugPageTitle: hasDebugPage.title },
        ), // `${hasDebugPage.title}正在调试，无法关闭`
      );
      return;
    }
    if (hasUnSavedPage) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.AddConnectionDrawer.YouHaveAnUnsavedWindow',
        }),

        async onOk() {
          await self.handleClearConnection();
        },
      });

      return;
    }

    await self.handleClearConnection();
  };

  public handleClearConnection = async () => {
    const { connectionStore } = this.props;
    if (connectionStore) {
      // 通知后端关闭数据库长连接
      await connectionStore.disconnect();
      connectionStore.clear();
      history.push('/connections');
    }
  };

  private handleMenuClick = (param: MenuInfo) => {
    let { keyPath } = param;
    keyPath = keyPath.reverse();
    const firstKey = keyPath[0];

    switch (firstKey) {
      case 'close': {
        this.handleGoBack();
        break;
      }

      case 'reload': {
        location.reload();
        return;
      }

      case 'list': {
        this.openNewConnectionPage();
        return;
      }

      case 'connection': {
        return;
      }
    }

    this.setState({
      visible: false,
    });
  };

  private renderMenu() {
    return (
      <Menu
        style={{
          minWidth: '140px',
        }}
        onClick={this.handleMenuClick}
      >
        <SubMenu
          key="connection"
          popupClassName={styles.submenu}
          title={formatMessage({
            id: 'odc.components.Header.homeMenu.NewWindowOpensConnection',
          })}
        >
          <ConnectionMenuList />
        </SubMenu>
        <Menu.Item key="list">
          {
            formatMessage({
              id: 'odc.components.Header.homeMenu.ConnectionManagement',
            })
            /* 连接管理 */
          }
        </Menu.Item>
        <Menu.Item key="reload">
          {
            formatMessage({
              id: 'odc.components.Header.homeMenu.Reload',
            }) /* 重新加载 */
          }
        </Menu.Item>
        <Menu.Item key="close">
          {
            formatMessage({
              id: 'odc.components.Header.homeMenu.ExitTheConnection',
            }) /* 退出连接 */
          }
        </Menu.Item>
      </Menu>
    );
  }

  private openNewConnectionPage = () => {
    window.open('#/connections');
  };

  private onVisibleChange = (visible) => {
    this.setState({
      visible,
    });
  };

  render() {
    const { visible } = this.state;
    return (
      <Dropdown
        onVisibleChange={this.onVisibleChange}
        placement="bottom"
        overlay={this.renderMenu()}
        visible={this.state.visible}
      >
        <HeaderBtn>
          {visible ? (
            <Icon component={HomeMenuSvg} className={styles.buttonIcon} />
          ) : (
            <Icon component={ODCBlackSvg} className={styles.buttonIcon} />
          )}
        </HeaderBtn>
      </Dropdown>
    );
  }
}

export default HomeMenu;
