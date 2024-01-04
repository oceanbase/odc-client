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
import { PureComponent, ReactNode, useContext, useState } from 'react';
import { CloseOutlined, DownOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { IPage, PageType } from '@/d.ts';
import { Badge, Dropdown, Menu, MenuProps, Space, Tabs, Tooltip } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { movePagePostion, openNewDefaultPLPage } from '@/store/helper/page';
import { SQLStore } from '@/store/sql';
import { inject, observer } from 'mobx-react';
import { pageMap } from './config';
import DefaultPage from './DefaultPage';
import DraggableTabs from './DraggableTabs';
import { getPageTitleText } from './helper';
import styles from './index.less';
import tracert from '@/util/tracert';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';

interface IProps {
  pages: IPage[];
  activeKey: string;
  sqlStore?: SQLStore;
  onActivatePage: (activePageKey: string) => void;
  onOpenPage: () => void;
  onOpenPageAfterTarget: (targetPage: IPage) => void;
  onClosePage: (targetPageKey: string) => void;
  onCloseOtherPage: (targetPageKey: string) => void;
  onCopySQLPage: (targetPage: IPage) => void;
  onCloseAllPage: () => void;
  onSavePage: (targetPageKey: string) => void;
  onStartSavingPage: (targetPageKey: string) => void;
  onUnsavedChangePage: (pageKey: string) => void;
}

const WindowManager: React.FC<IProps> = function (props) {
  const [closePageKey, setClosePageKey] = useState<string>(null);
  const treeContext = useContext(ResourceTreeContext);

  const { pages, activeKey, onActivatePage } = props;

  const handleSwitchTab = (clickParam: MenuInfo) => {
    const { onActivatePage } = props;
    onActivatePage(clickParam.key?.toString());
  };

  const handleEditPage = (targetKey: any, action: string) => {
    const { onOpenPage } = props;
    if (action === 'add') {
      tracert.click('a3112.b41896.c330993.d367629');
      onOpenPage();
    }
  };

  /** 处理 Tab 关闭事件 */
  const handleCloseTab = (pageKey: string) => {
    const { pages } = props;
    const targetPage = pages.find((p) => p.key === pageKey);
    if (targetPage && targetPage.isSaved) {
      handleClosePage(pageKey);
    } else {
      setClosePageKey(pageKey);
      props.onActivatePage(pageKey);
    }
  };
  const handleClosePage = (targetKey: string) => {
    const { onClosePage } = props;
    onClosePage(targetKey);
    setClosePageKey('');
  };
  function doTabAction(page: IPage, params: MenuInfo) {
    params.domEvent.stopPropagation();
    const { key } = params;
    switch (key) {
      case 'closePage': {
        return handleCloseTab(page.key);
      }
      case 'closeOtherPage': {
        return props.onCloseOtherPage(page.key);
      }
      case 'closeAllPage': {
        return props.onCloseAllPage();
      }
      case 'openNewPage': {
        return props.onOpenPageAfterTarget(page);
      }
      case 'copyPage': {
        return props.onCopySQLPage(page);
      }
      default: {
      }
    }
  }

  // 处理未保存的修改
  const handleUnsavedChange = (targetKey: string) => {
    const { onUnsavedChangePage } = props;
    onUnsavedChangePage(targetKey);
  };
  const handleChangeSaved = (targetKey: string) => {
    const { onSavePage } = props;
    onSavePage(targetKey);
  };

  /** 未保存弹框点击保存触发的事件 */
  const handleSaveAndClosePage = (targetKey: string, closeImmediately?: boolean) => {
    const { onStartSavingPage } = props;
    onStartSavingPage(targetKey);
    setClosePageKey('');
    if (closeImmediately) {
      handleClosePage(targetKey);
    }
  };

  function getPageTitle(page: IPage): ReactNode {
    const iconColor = page?.params?.isDisabled ? '#bfbfbf' : pageMap[page.type].color;
    const isDocked = page.params.isDocked;
    const pageTitle = getPageTitleText(page);
    const isPageProcessing = props.sqlStore.runningPageKey.has(page.key);
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
        menu={{
          className: styles.tabsContextMenu,
          onClick: doTabAction.bind(null, page),
          items: [
            !isDocked && {
              key: 'closePage',
              label: formatMessage({
                id: 'odc.component.WindowManager.CloseThisWindow',
              }),
            },
            {
              key: 'closeOtherPage',
              label: formatMessage({
                id: 'odc.component.WindowManager.CloseOtherWindows',
              }),
            },
            !isDocked && {
              key: 'closeAllPage',
              label: formatMessage({
                id: 'odc.component.WindowManager.CloseAllWindows',
              }),
            },
            {
              type: 'divider',
            },
            page.type === PageType.SQL && {
              key: 'copyPage',
              label: formatMessage({
                id: 'odc.src.component.WindowManager.CopyTheSQLWindow',
              }),
            },
            {
              key: 'openNewPage',
              label: formatMessage({
                id: 'odc.component.WindowManager.OpenANewSqlWindow',
              }),
            },
          ].filter(Boolean) as MenuProps['items'],
        }}
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
              <span
                style={{
                  width: 16,
                }}
              >
                <CloseOutlined
                  className={styles.closeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(page.key);
                  }}
                  style={{
                    fontSize: '8px',
                  }}
                />
              </span>
            ) : (
              <span
                style={{
                  width: '16px',
                }}
              />
            )}
          </span>
        </Tooltip>
      </Dropdown>
    );
  }

  const menu: MenuProps = {
    style: {
      width: '320px',
    },
    selectedKeys: [activeKey],
    onClick: handleSwitchTab,
    items: pages.map((page) => {
      return {
        key: page.key,
        label: (
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
        ),
      };
    }),
  };
  return (
    <>
      <DraggableTabs
        className={styles.tabs}
        onChange={onActivatePage}
        activeKey={activeKey}
        type="editable-card"
        onEdit={handleEditPage}
        moveTabNode={(d, h) => {
          movePagePostion(d, h);
        }}
        tabBarGutter={0}
        addIcon={
          <div
            style={{
              display: 'flex',
              justifyContent: 'stretch',
              flexDirection: 'row',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <PlusOutlined />
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    label: formatMessage({
                      id: 'odc.src.component.WindowManager.NewSQLWindow',
                    }), //'新建 SQL 窗口'
                    key: 'newSQL',
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      handleEditPage(null, 'add');
                    },
                  },
                  {
                    label: formatMessage({
                      id: 'odc.src.component.WindowManager.CreateAnonymousBlockWindow',
                    }), //'新建匿名块窗口'
                    key: 'newPL',
                    onClick(e) {
                      e.domEvent.stopPropagation();
                      openNewDefaultPLPage(undefined, treeContext?.currentDatabaseId);
                    },
                  },
                ],
              }}
            >
              <div
                className={styles.addMoreIcon}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DownOutlined />
              </div>
            </Dropdown>
          </div>
        }
        tabBarExtraContent={
          <Dropdown
            overlayClassName={styles.menuList}
            menu={menu}
            trigger={['click']}
            placement="bottomRight"
          >
            <EllipsisOutlined className={styles.moreBtn} />
          </Dropdown>
        }
        items={pages
          .map((page) => {
            const Page = pageMap[page.type].component;
            const pageParams = Object.assign({}, pageMap[page.type].params || {}, page.params);
            if (!Page) {
              return null;
            }
            console.log('page', page.type, Page);
            return {
              key: page.key,
              label: getPageTitle(page),
              closable: false, // hide close btn
              children: (
                <Page
                  page={page}
                  pageKey={page.key}
                  isSaved={page.isSaved}
                  params={pageParams}
                  isShow={activeKey == page.key}
                  showUnsavedModal={closePageKey === page.key}
                  startSaving={page.startSaving}
                  onUnsavedChange={handleUnsavedChange}
                  onChangeSaved={handleChangeSaved}
                  onCloseUnsavedModal={handleClosePage}
                  onCancelUnsavedModal={() => setClosePageKey('')}
                  onSaveAndCloseUnsavedModal={handleSaveAndClosePage}
                  closeSelf={handleCloseTab.bind(null, page.key)}
                />
              ),
            };
          })
          .filter(Boolean)}
      />
      <DefaultPage />
    </>
  );
};
export default inject('sqlStore')(observer(WindowManager));
