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

import { getDataSourceModeConfig } from '@/common/datasource';
import { SQLConsoleResourceType } from '@/common/datasource/interface';
import { deleteConnection } from '@/common/network/connection';
import Action from '@/component/Action';
import ConnectionPopover from '@/component/ConnectionPopover';
import { SQLConsoleEmpty } from '@/component/Empty/SQLConsoleEmpty';
import StatusIcon from '@/component/StatusIcon/DataSourceIcon';
import { EnvColorMap } from '@/constant';
import { ConnectType, IConnectionStatus } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import NewDatasourceDrawer from '@/page/Datasource/Datasource/NewDatasourceDrawer';
import NewDatasourceButton from '@/page/Datasource/Datasource/NewDatasourceDrawer/NewButton';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { DataSourceStatusStore } from '@/store/datasourceStatus';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { PlusOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Dropdown,
  Input,
  Menu,
  message,
  Modal,
  Popover,
  Tree,
  TreeDataNode,
} from 'antd';
import classNames from 'classnames';
import { throttle, toInteger, toNumber } from 'lodash';
import { inject, observer } from 'mobx-react';
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import ResourceLayout from '../../Layout';
import styles from './index.less';

interface IProps {
  filters: {
    envs: number[];
    connectTypes: ConnectType[];
  };
  dataSourceStatusStore?: DataSourceStatusStore;
  closeSelectPanel: () => void;
}

const CustomDropdown = ({
  node,
  login,
  deleteDataSource,
  setCopyDatasourceId,
  setEditDatasourceId,
  setAddDSVisiable,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  const menuItems = [
    {
      label: formatMessage({
        id: 'odc.src.page.Workspace.SideBar.ResourceTree.SelectPanel.Datasource.Clone',
        defaultMessage: '克隆',
      }),
      key: 'clone',
      onClick: (e) => handleMenuClick(e, () => setCopyDatasourceId(toInteger(node.key))),
    },
    {
      label: formatMessage({
        id: 'odc.ResourceTree.Datasource.Edit',
        defaultMessage: '编辑',
      }),
      key: 'edit',
      onClick: (e) =>
        handleMenuClick(e, () => {
          setEditDatasourceId(node.key);
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
          deleteDataSource(name as string, node.key as string);
        }),
    },
  ];

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
      <span onContextMenu={handleContextMenu} className={styles.fullWidthTitle}>
        {node.title}
      </span>
    </Dropdown>
  );
};

export default inject('dataSourceStatusStore')(
  observer(
    forwardRef<{ reload: () => void }, IProps>(function DatasourceTree(
      { filters, closeSelectPanel, dataSourceStatusStore }: IProps,
      ref,
    ) {
      const [editDatasourceId, setEditDatasourceId] = useState(null);
      const [copyDatasourceId, setCopyDatasourceId] = useState<number>(null);
      const [addDSVisiable, setAddDSVisiable] = useState(false);
      const [searchKey, setSearchKey] = useState('');
      const [wrapperHeight, setWrapperHeight] = useState(0);
      console.log('wrapperHeight', wrapperHeight);
      const treeWrapperRef = useRef<HTMLDivElement>();
      const context = useContext(ResourceTreeContext);
      let { datasourceList } = context;
      datasourceList = useMemo(() => {
        return datasourceList?.filter((item) => !item.temp);
      }, [datasourceList]);
      const selectKeys = [context.selectDatasourceId].filter(Boolean);
      function setSelectKeys(keys) {
        return context.setSelectDatasourceId(keys?.[0]);
      }
      useEffect(() => {
        const resizeHeight = throttle(() => {
          setWrapperHeight(treeWrapperRef?.current?.offsetHeight);
        }, 500);
        setWrapperHeight(treeWrapperRef.current?.clientHeight);
        window.addEventListener('resize', resizeHeight);
        return () => {
          window.removeEventListener('resize', resizeHeight);
        };
      }, []);
      useImperativeHandle(
        ref,
        () => {
          return {
            async reload() {
              await context?.reloadDatasourceList();
            },
          };
        },
        [context],
      );
      const datasource: TreeDataNode[] = useMemo(() => {
        return datasourceList
          ?.map((item) => {
            const config = getDataSourceModeConfig(item?.type);
            /**
             * 团队空间不展示对象存储数据源，
             * 个人空间展示对象存储数据源并禁用
             */
            if (isConnectTypeBeFileSystemGroup(item?.type) && !login.isPrivateSpace()) {
              return;
            }
            /**
             * feature filter
             */
            if (!config?.features?.resourceTree) {
              return;
            }
            /**
             * search filter
             */
            if (searchKey && !item.name?.toLowerCase()?.includes(searchKey?.toLowerCase())) {
              return null;
            }
            if (filters?.envs?.length && !filters?.envs.includes(item.environmentId)) {
              /**
               * env filter
               */
              return null;
            }
            if (filters?.connectTypes?.length && !filters?.connectTypes.includes(item.type)) {
              /**
               * connectType filter
               */
              return null;
            }
            const status = dataSourceStatusStore.statusMap.get(item.id);
            item = status
              ? {
                  ...item,
                  status,
                }
              : item;
            return {
              title: item.name,
              selectable: item.status?.status === IConnectionStatus.ACTIVE,
              key: item.id,
              icon: <StatusIcon item={item} />,
              disabled: isConnectTypeBeFileSystemGroup(item?.type),
            };
          })
          .filter(Boolean);
      }, [
        datasourceList,
        searchKey,
        dataSourceStatusStore.statusMap,
        filters?.envs,
        filters?.connectTypes,
      ]);
      const datasourceMap = useMemo(() => {
        const map = new Map<number, IDatasource>();
        datasourceList?.forEach((c) => {
          map.set(c.id, c);
        });
        return map;
      }, [datasourceList]);
      function deleteDataSource(name: string, key: string) {
        Modal.confirm({
          title: formatMessage(
            {
              id: 'odc.ResourceTree.Datasource.AreYouSureYouWant',
              defaultMessage: '确认删除数据源 {name}?',
            },
            { name },
          ),
          //`确认删除数据源 ${name}?`
          async onOk() {
            const isSuccess = await deleteConnection(key as any);
            if (isSuccess) {
              message.success(
                formatMessage({
                  id: 'odc.ResourceTree.Datasource.DeletedSuccessfully',
                  defaultMessage: '删除成功',
                }), //删除成功
              );

              if (selectKeys.includes(toInteger(key))) {
                setSelectKeys([]);
              }
              context?.reloadDatasourceList();
            }
          },
        });
      }
      return (
        <ResourceLayout
          top={
            <div className={styles.container}>
              <div className={styles.search}>
                <Input.Search
                  onSearch={(v) => {
                    setSearchKey(v);
                  }}
                  allowClear
                  placeholder={formatMessage({
                    id: 'odc.ResourceTree.Datasource.SearchForDataSources',
                    defaultMessage: '搜索数据源',
                  })}
                  /*搜索数据源*/ style={{
                    width: '100%',
                    flexGrow: 1,
                    flexShrink: 1,
                  }}
                  size="small"
                />
                {login.isPrivateSpace() ? (
                  <NewDatasourceButton onSuccess={() => context?.reloadDatasourceList()}>
                    <Button
                      size="small"
                      type="primary"
                      style={{
                        flexShrink: 0,
                        flexGrow: 0,
                        marginLeft: 4,
                      }}
                      icon={<PlusOutlined />}
                    />
                  </NewDatasourceButton>
                ) : null}
              </div>

              <div className={styles.list} ref={treeWrapperRef}>
                {datasource?.length ? (
                  <Tree
                    className={styles.tree}
                    // 设置一个最小值，可以避免height为0的时候，出现全量渲染
                    height={wrapperHeight || 100}
                    titleRender={(node) => {
                      const dataSource = datasourceList?.find((d) => d.id == node.key);
                      return (
                        <>
                          <Popover
                            showArrow={false}
                            overlayClassName={styles.connectionPopover}
                            placement="right"
                            content={
                              <ConnectionPopover
                                connection={datasourceMap.get(toNumber(node.key))}
                              />
                            }
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
                                login={login}
                                deleteDataSource={deleteDataSource}
                                setCopyDatasourceId={setCopyDatasourceId}
                                setEditDatasourceId={setEditDatasourceId}
                                setAddDSVisiable={setAddDSVisiable}
                              />
                              <div
                                className={classNames(styles.envTip, {
                                  [styles.envTipPersonal]: login.isPrivateSpace(),
                                })}
                              >
                                <Badge
                                  color={
                                    EnvColorMap[dataSource?.environmentStyle?.toUpperCase()]
                                      ?.tipColor
                                  }
                                />
                              </div>
                              {login.isPrivateSpace() && (
                                <div className={styles.actions}>
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
                                      onClick={() =>
                                        deleteDataSource(node.title as string, node.key as string)
                                      }
                                      key={'delete'}
                                    >
                                      {formatMessage({
                                        id: 'odc.ResourceTree.Datasource.Delete',
                                        defaultMessage: '删除',
                                      })}
                                    </Action.Link>
                                  </Action.Group>
                                </div>
                              )}
                            </div>
                          </Popover>
                        </>
                      );
                    }}
                    selectedKeys={selectKeys}
                    onSelect={(keys, info) => {
                      if (!info.selected) {
                        /**
                         * disable unselect
                         */
                        closeSelectPanel();
                        return;
                      }
                      setSelectKeys(keys);
                    }}
                    showIcon
                    selectable
                    multiple={false}
                    treeData={datasource}
                  />
                ) : searchKey ? (
                  <SQLConsoleEmpty />
                ) : (
                  <SQLConsoleEmpty type={SQLConsoleResourceType.DataSource} />
                )}
              </div>

              <NewDatasourceDrawer
                isEdit={!!editDatasourceId}
                visible={addDSVisiable}
                id={editDatasourceId}
                close={() => {
                  setEditDatasourceId(null);
                  setAddDSVisiable(false);
                }}
                onSuccess={() => {
                  context?.reloadDatasourceList();
                }}
              />

              <NewDatasourceDrawer
                isEdit={false}
                isCopy={true}
                id={copyDatasourceId}
                visible={!!copyDatasourceId}
                close={() => {
                  setCopyDatasourceId(null);
                }}
                onSuccess={() => {
                  context?.reloadDatasourceList();
                }}
              />
            </div>
          }
          bottomLoading={false}
          bottom={null}
        />
      );
    }),
  ),
);
