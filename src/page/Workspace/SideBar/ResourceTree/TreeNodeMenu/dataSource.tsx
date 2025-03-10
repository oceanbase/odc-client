import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { formatMessage } from '@/util/intl';
import { toInteger } from 'lodash';
import { Badge, Button, Dropdown, Menu, Popover, Modal, message } from 'antd';
import styles from './index.less';
import treeStyles from '../index.less';
import ConnectionPopover from '@/component/ConnectionPopover';
import { deleteConnection } from '@/common/network/connection';
import classNames from 'classnames';
import { EnvColorMap } from '@/constant';
import { UserStore } from '@/store/login';
import Action from '@/component/Action';
import { inject, observer } from 'mobx-react';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { SearchOutlined } from '@ant-design/icons';
import { openGlobalSearch } from '@/page/Workspace/SideBar/ResourceTree/const';
const CustomDropdown = ({
  node,
  login,
  deleteDataSource,
  setCopyDatasourceId,
  setEditDatasourceId,
  setAddDSVisiable,
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
          onClick: (e) => handleMenuClick(e, () => setCopyDatasourceId(toInteger(node.data.id))),
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
              setAddDSVisiable(true);
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
      ]
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
      onVisibleChange={setDropdownVisible}
      placement="bottomLeft"
    >
      <span
        onContextMenu={handleContextMenu}
        className={styles.fullWidthTitle}
        onClick={() => {
          setCurrentObject?.({
            value: node.key,
            type: node.type,
          });
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
  deleteDataSource: (name: string, key: string) => void;
  copyDatasourceId: number;
  setCopyDatasourceId: any;
  setEditDatasourceId: React.Dispatch<React.SetStateAction<number>>;
  setAddDSVisiable: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataSourceNodeMenu = (props: IProps) => {
  const {
    node,
    userStore,
    setCopyDatasourceId,
    deleteDataSource,
    setAddDSVisiable,
    setEditDatasourceId,
    copyDatasourceId,
  } = props;
  const dataSource = node.data;
  return (
    <>
      <Popover
        showArrow={false}
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
        >
          <CustomDropdown
            node={node}
            login={userStore}
            deleteDataSource={deleteDataSource}
            setCopyDatasourceId={setCopyDatasourceId}
            setEditDatasourceId={setEditDatasourceId}
            setAddDSVisiable={setAddDSVisiable}
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
            <div className={treeStyles.menuActions} style={{ marginRight: '6px' }}>
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
              {userStore.isPrivateSpace() && (
                <Action.Group ellipsisIcon="vertical" size={0}>
                  <Action.Link
                    onClick={() => {
                      setCopyDatasourceId(toInteger(node.key));
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
                      setEditDatasourceId(node.key);
                      setAddDSVisiable(true);
                    }}
                    key={'edit'}
                  >
                    {formatMessage({
                      id: 'odc.ResourceTree.Datasource.Edit',
                      defaultMessage: '编辑',
                    })}
                  </Action.Link>

                  <Action.Link
                    onClick={() => deleteDataSource(node.title as string, node.key as string)}
                    key={'delete'}
                  >
                    {formatMessage({
                      id: 'odc.ResourceTree.Datasource.Delete',
                      defaultMessage: '删除',
                    })}
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
