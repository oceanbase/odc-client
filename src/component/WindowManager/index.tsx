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

import { formatMessage } from '@/util/intl';
import { PureComponent, ReactNode } from 'react';

import { CloseOutlined, EllipsisOutlined } from '@ant-design/icons';

import { IPage, PageType } from '@/d.ts';
import { Badge, Dropdown, Menu, Space, Tabs, Tooltip } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';

import { movePagePostion } from '@/store/helper/page';
import { SQLStore } from '@/store/sql';
import { inject, observer } from 'mobx-react';
import { pageMap } from './config';
import DefaultPage from './DefaultPage';
import DraggableTabs from './DraggableTabs';
import { getPageTitleText } from './helper';
import styles from './index.less';
import tracert from '@/util/tracert';

const { TabPane } = Tabs;

class WindowManager extends PureComponent<
  {
    pages: IPage[];
    activeKey: string;
    sqlStore?: SQLStore;
    onActivatePage: (activePageKey: string) => void;
    onOpenPage: () => void;
    onOpenPageAfterTarget: (targetPage: IPage) => void;
    onClosePage: (targetPageKey: string) => void;
    onCloseOtherPage: (targetPageKey: string) => void;
    onCloseAllPage: () => void;
    onSavePage: (targetPageKey: string) => void;
    onStartSavingPage: (targetPageKey: string) => void;
    onUnsavedChangePage: (pageKey: string) => void;
  },
  {
    closePageKey: string;
  }
> {
  public readonly state = {
    closePageKey: '',
  };

  // 处理未保存的修改
  public handleUnsavedChange = (targetKey: string) => {
    const { onUnsavedChangePage } = this.props;
    onUnsavedChangePage(targetKey);
  };

  public handleChangeSaved = (targetKey: string) => {
    const { onSavePage } = this.props;
    onSavePage(targetKey);
  };

  /** 未保存弹框点击保存触发的事件 */
  public handleSaveAndClosePage = (targetKey: string, closeImmediately?: boolean) => {
    const { onStartSavingPage } = this.props;
    onStartSavingPage(targetKey);

    this.setState({
      closePageKey: '',
    });

    if (closeImmediately) {
      this.handleClosePage(targetKey);
    }
  };

  public handleClosePage = (targetKey: string) => {
    const { onClosePage } = this.props;
    onClosePage(targetKey);
    this.setState({
      closePageKey: '',
    });
  };

  public handleEditPage = (targetKey: any, action: string) => {
    const { onOpenPage } = this.props;

    if (action === 'add') {
      tracert.click('a3112.b41896.c330993.d367629');
      onOpenPage();
    }
  };

  /** 处理 Tab 切换事件 */
  public handleSwitchTab = (clickParam: MenuInfo) => {
    const { onActivatePage } = this.props;
    onActivatePage(clickParam.key?.toString());
  };

  /** 处理 Tab 关闭事件 */
  public handleCloseTab = (pageKey: string) => {
    const { pages } = this.props;
    const targetPage = pages.find((p) => p.key === pageKey);
    if (targetPage && targetPage.isSaved) {
      this.handleClosePage(pageKey);
    } else {
      this.setState({
        closePageKey: pageKey,
      });
      this.props.onActivatePage(pageKey);
    }
  };

  public render() {
    const { pages, activeKey, onActivatePage } = this.props;
    const { closePageKey } = this.state;
    const menu = (
      <Menu
        style={{
          width: '320px',
        }}
        selectedKeys={[activeKey]}
        onClick={this.handleSwitchTab}
      >
        {pages.map((page) => (
          <Menu.Item key={page.key}>
            <Space>
              <span
                className={styles.icon}
                style={{
                  display: 'flex',
                  color: `${pageMap[page.type].color}`,
                  lineHeight: 1,
                  fontSize: 14,
                }}
              >
                {pageMap[page.type].icon}
              </span>
              {getPageTitleText(page)}
            </Space>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <>
        <DraggableTabs
          className={styles.tabs}
          onChange={onActivatePage}
          activeKey={activeKey}
          type="editable-card"
          onEdit={this.handleEditPage}
          moveTabNode={(d, h) => {
            movePagePostion(d, h);
          }}
          tabBarGutter={0}
          tabBarExtraContent={
            <Dropdown
              overlayClassName={styles.menuList}
              overlay={menu}
              trigger={['click']}
              placement="bottomRight"
            >
              <EllipsisOutlined className={styles.moreBtn} />
            </Dropdown>
          }
        >
          {pages.map((page) => {
            const Page = pageMap[page.type].component;
            const pageParams = Object.assign({}, pageMap[page.type].params || {}, page.params);

            return (
              <TabPane tab={this.getPageTitle(page)} key={page.key} closable={false}>
                <Page
                  page={page}
                  pageKey={page.key}
                  isSaved={page.isSaved}
                  params={pageParams}
                  isShow={activeKey == page.key}
                  showUnsavedModal={closePageKey === page.key}
                  startSaving={page.startSaving}
                  onUnsavedChange={this.handleUnsavedChange}
                  onChangeSaved={this.handleChangeSaved}
                  onCloseUnsavedModal={this.handleClosePage}
                  onCancelUnsavedModal={() => this.setState({ closePageKey: '' })}
                  onSaveAndCloseUnsavedModal={this.handleSaveAndClosePage}
                  closeSelf={this.handleCloseTab.bind(this, page.key)}
                />
              </TabPane>
            );
          })}
        </DraggableTabs>
        <DefaultPage />
      </>
    );
  }

  private doTabAction(page: IPage, params: MenuInfo) {
    params.domEvent.stopPropagation();
    const { key } = params;
    switch (key) {
      case 'closePage': {
        return this.handleCloseTab(page.key);
      }
      case 'closeOtherPage': {
        return this.props.onCloseOtherPage(page.key);
      }
      case 'closeAllPage': {
        return this.props.onCloseAllPage();
      }
      case 'openNewPage': {
        return this.props.onOpenPageAfterTarget(page);
      }
      default: {
      }
    }
  }

  private getPageTitle(page: IPage): ReactNode {
    const iconColor = page?.params?.isDisabled ? '#bfbfbf' : pageMap[page.type].color;
    const isDocked = page.params.isDocked;
    const pageTitle = getPageTitleText(page);
    const isPageProcessing = this.props.sqlStore.runningPageKey.has(page.key);
    const isCompiler = [
      PageType.BATCH_COMPILE_FUNCTION,
      PageType.BATCH_COMPILE_PACKAGE,
      PageType.BATCH_COMPILE_PROCEDURE,
      PageType.BATCH_COMPILE_TRIGGER,
      PageType.BATCH_COMPILE_TYPE,
    ].includes(page.type);
    return (
      <Dropdown
        trigger={['contextMenu']}
        overlay={
          <Menu className={styles.tabsContextMenu} onClick={this.doTabAction.bind(this, page)}>
            {!isDocked && (
              <Menu.Item key="closePage">
                {formatMessage({
                  id: 'odc.component.WindowManager.CloseThisWindow',
                })}
              </Menu.Item>
            )}

            <Menu.Item key="closeOtherPage">
              {formatMessage({
                id: 'odc.component.WindowManager.CloseOtherWindows',
              })}
            </Menu.Item>
            {!isDocked && (
              <Menu.Item key="closeAllPage">
                {formatMessage({
                  id: 'odc.component.WindowManager.CloseAllWindows',
                })}
              </Menu.Item>
            )}

            <Menu.Item key="openNewPage">
              {formatMessage({
                id: 'odc.component.WindowManager.OpenANewSqlWindow',
              })}
            </Menu.Item>
          </Menu>
        }
      >
        <Tooltip
          placement="bottom"
          overlayClassName={styles.tabTooltip}
          title={
            <div>
              <div>{pageTitle}</div>
              {!page.isSaved && !isCompiler && !isPageProcessing ? (
                <div>
                  <Badge
                    status={'default'}
                    text={formatMessage({
                      id: 'odc.component.WindowManager.NotSaved',
                    })} /*未保存*/
                  />
                </div>
              ) : null}
              {isPageProcessing ? (
                <div>
                  <Badge
                    status={'processing'}
                    text={formatMessage({
                      id: 'odc.component.WindowManager.Running',
                    })} /*运行中*/
                  />
                </div>
              ) : null}
            </div>
          }
        >
          <span className={styles.pageTitle}>
            <span
              className={styles.icon}
              style={{
                display: 'flex',
                color: `${iconColor}`,
                lineHeight: 1,
                fontSize: 14,
              }}
            >
              {pageMap[page.type].icon}
            </span>
            <span className={styles.title}>{pageTitle}</span>
            <span className={styles.extraStatusBox}>
              {(() => {
                if (isPageProcessing) {
                  return <Badge status={'processing'} />;
                } else if (!page.isSaved) {
                  return <Badge status={'default'} />;
                } else {
                  return null;
                }
              })()}
            </span>
            {!page.params.isDocked ? (
              <span style={{ width: 16 }}>
                <CloseOutlined
                  className={styles.closeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleCloseTab(page.key);
                  }}
                  style={{ fontSize: '8px' }}
                />
              </span>
            ) : (
              <span style={{ width: '16px' }} />
            )}
          </span>
        </Tooltip>
      </Dropdown>
    );
  }
}

export default inject('sqlStore')(observer(WindowManager));
