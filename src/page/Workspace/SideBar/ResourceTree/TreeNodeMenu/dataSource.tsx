import React, { useContext, useState } from 'react';
import { formatMessage } from '@/util/intl';
import { toInteger } from 'lodash';
import { Badge, Button, Dropdown, Menu, Popover, Modal, message, Tooltip } from 'antd';
import styles from './index.less';
import treeStyles from '../index.less';
import ConnectionPopover from '@/component/ConnectionPopover';
import classNames from 'classnames';
import { EnvColorMap } from '@/constant';
import { UserStore } from '@/store/login';
import Action from '@/component/Action';
import { IConnection } from '@/d.ts';
import { inject, observer } from 'mobx-react';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { SearchOutlined } from '@ant-design/icons';
import { openGlobalSearch } from '@/page/Workspace/SideBar/ResourceTree/const';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { syncDatasource } from '@/common/network/connection';

const CustomDropdown = ({
  node,
  login,
  deleteDataSource,
  setCopyDatasourceId,
  setEditDatasourceId,
  setDataSourceDrawerVisiable,
  userStore,
  sync,
  isHover,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const treeContext = useContext(ResourceTreeContext);
  const { setCurrentObject } = treeContext || {};

  const handleContextMenu = (event) => {
    event.preventDefault();
    if (login.isPrivateSpace()) {
      setDropdownVisible(true);
    }
  };
  const handleMenuClick = (e, action) => {
    e.domEvent?.stopPropagation();
    setDropdownVisible(false);
    action(e);
  };

  const menuItems = node.data
    ? [
        {
          label: formatMessage({
            id: 'odc.src.page.Workspace.SideBar.ResourceTree.SelectPanel.Datasource.Clone',
            defaultMessage: '克隆',
          }),
          key: 'clone',
          onClick: (e) =>
            handleMenuClick(e, () => {
              setDataSourceDrawerVisiable(true);
              setCopyDatasourceId(node.data.id);
            }),
        },
        {
          label: formatMessage({
            id: 'odc.ResourceTree.Datasource.Edit',
            defaultMessage: '编辑',
          }),
          key: 'edit',
          onClick: (e) =>
            handleMenuClick(e, () => {
              setEditDatasourceId(node.data.id);
              setDataSourceDrawerVisiable(true);
            }),
        },
        {
          label: formatMessage({
            id: 'odc.ResourceTree.Datasource.Delete',
            defaultMessage: '删除',
          }),
          key: 'delete',
          onClick: (e) =>
            handleMenuClick(e, () => {
              const name = node.title;
              deleteDataSource(name as string, node.data.id as string);
            }),
        },
        userStore.isPrivateSpace()
          ? {
              label: '同步元数据库',
              key: 'sync',
              onClick: (e) =>
                handleMenuClick(e, () => {
                  sync(node.data.id);
                }),
            }
          : null,
      ]?.filter(Boolean)
    : [];
  const menu = (
    <Menu>
      {menuItems.map((item) => (
        <Menu.Item key={item.key} onClick={item.onClick}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Dropdown
      overlay={menu}
      trigger={['contextMenu']}
      open={dropdownVisible}
      destroyOnHidden
      onVisibleChange={setDropdownVisible}
      placement="bottomLeft"
    >
      <span
        onContextMenu={handleContextMenu}
        className={classNames(styles.dataSourceTitle, {
          [styles.mr12]: !userStore?.isPrivateSpace() && isHover,
          [styles.mr24]: userStore?.isPrivateSpace() && isHover,
        })}
        onClick={() => {
          if (!node?.disabled) {
            setCurrentObject?.({
              value: node.key,
              type: node.type,
            });
          }
        }}
      >
        {node.title}
      </span>
    </Dropdown>
  );
};

interface IProps {
  node: any;
  userStore?: UserStore;
  deleteDataSource: (name: string, key: number) => void;
  copyDatasourceId: number;
  setCopyDatasourceId: any;
  setEditDatasourceId: React.Dispatch<React.SetStateAction<number>>;
  setDataSourceDrawerVisiable: React.Dispatch<React.SetStateAction<boolean>>;
  reload: () => void;
}

const DataSourceNodeMenu = (props: IProps) => {
  const {
    node,
    userStore,
    setCopyDatasourceId,
    deleteDataSource,
    setDataSourceDrawerVisiable,
    setEditDatasourceId,
    copyDatasourceId,
    reload,
  } = props;
  const dataSource = node.data;
  const [hover, setHover] = useState(false);
  async function sync(id: number | string) {
    const isSuccess = await syncDatasource(toInteger(id));
    if (isSuccess) {
      message.success(
        formatMessage({
          id: 'odc.Datasource.Info.SynchronizationSucceeded',
          defaultMessage: '同步成功',
        }), //同步成功
      );
      reload();
    }
  }

  return (
    <>
      <Popover
        showArrow={false}
        destroyOnHidden
        overlayClassName={styles.connectionPopover}
        placement="right"
        content={!!dataSource && <ConnectionPopover connection={dataSource} />}
      >
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'space-between',
          }}
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          <CustomDropdown
            isHover={hover}
            node={node}
            login={userStore}
            deleteDataSource={deleteDataSource}
            setCopyDatasourceId={setCopyDatasourceId}
            setEditDatasourceId={setEditDatasourceId}
            setDataSourceDrawerVisiable={setDataSourceDrawerVisiable}
            userStore={userStore}
            sync={sync}
          />
          <div
            className={classNames(treeStyles.envTip, {
              [treeStyles.envTipPersonal]: userStore.isPrivateSpace(),
            })}
          >
            <Badge
              className={treeStyles.env}
              color={EnvColorMap[dataSource?.environmentStyle?.toUpperCase()]?.tipColor}
            />
          </div>
          {dataSource && (
            <div className={treeStyles.menuActions}>
              {!isConnectTypeBeFileSystemGroup(dataSource.type) && (
                <Tooltip title="全局搜索" placement="left">
                  <SearchOutlined
                    className={treeStyles.menuActions}
                    style={
                      userStore.isPrivateSpace()
                        ? {
                            marginRight: '12px',
                          }
                        : {}
                    }
                    onClick={(e) => {
                      openGlobalSearch(node);
                      e.stopPropagation();
                    }}
                  />
                </Tooltip>
              )}
              {userStore.isPrivateSpace() && (
                <Action.Group ellipsisIcon="vertical" size={0} destroyOnHidden>
                  <Action.Link
                    onClick={() => {
                      setCopyDatasourceId(dataSource.id);
                      setDataSourceDrawerVisiable(true);
                    }}
                    key={'clone'}
                  >
                    {
                      formatMessage({
                        id: 'odc.src.page.Workspace.SideBar.ResourceTree.SelectPanel.Datasource.Clone.1',
                        defaultMessage:
                          '\n                                  克隆\n                                ',
                      }) /* 
                               克隆
                               */
                    }
                  </Action.Link>

                  <Action.Link
                    onClick={() => {
                      setEditDatasourceId(dataSource.id);
                      setDataSourceDrawerVisiable(true);
                    }}
                    key={'edit'}
                  >
                    {formatMessage({
                      id: 'odc.ResourceTree.Datasource.Edit',
                      defaultMessage: '编辑',
                    })}
                  </Action.Link>

                  <Action.Link
                    onClick={() => deleteDataSource(node.title as string, dataSource.id)}
                    key={'delete'}
                  >
                    {formatMessage({
                      id: 'odc.ResourceTree.Datasource.Delete',
                      defaultMessage: '删除',
                    })}
                  </Action.Link>

                  <Action.Link onClick={() => sync(dataSource.id)} key={'sync'}>
                    同步元数据库
                  </Action.Link>
                </Action.Group>
              )}
            </div>
          )}
        </div>
      </Popover>
    </>
  );
};

export default inject('userStore')(observer(DataSourceNodeMenu));
