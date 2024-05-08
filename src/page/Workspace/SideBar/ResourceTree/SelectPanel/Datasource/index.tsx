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

import { deleteConnection } from '@/common/network/connection';
import Action from '@/component/Action';
import ConnectionPopover from '@/component/ConnectionPopover';
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
import { PlusOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Dropdown,
  Empty,
  Input,
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
            },
            {
              name: name,
            },
          ),
          //`确认删除数据源 ${name}?`
          async onOk() {
            const isSuccess = await deleteConnection(key as any);
            if (isSuccess) {
              message.success(
                formatMessage({
                  id: 'odc.ResourceTree.Datasource.DeletedSuccessfully',
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
                              <Dropdown
                                trigger={login.isPrivateSpace() ? ['contextMenu'] : []}
                                menu={{
                                  items: [
                                    {
                                      label: formatMessage({
                                        id: 'odc.src.page.Workspace.SideBar.ResourceTree.SelectPanel.Datasource.Clone',
                                      }), //'克隆'
                                      key: 'clone',
                                      onClick: (e) => {
                                        e.domEvent?.stopPropagation();
                                        setCopyDatasourceId(toInteger(node.key));
                                      },
                                    },
                                    {
                                      label: formatMessage({
                                        id: 'odc.ResourceTree.Datasource.Edit',
                                      }),
                                      //编辑
                                      key: 'edit',
                                      onClick: (e) => {
                                        e.domEvent?.stopPropagation();
                                        setEditDatasourceId(node.key);
                                        setAddDSVisiable(true);
                                      },
                                    },
                                    {
                                      label: formatMessage({
                                        id: 'odc.ResourceTree.Datasource.Delete',
                                      }),
                                      //删除
                                      key: 'delete',
                                      onClick: (e) => {
                                        e.domEvent?.stopPropagation();
                                        const name = node.title;
                                        deleteDataSource(name as string, node.key as string);
                                      },
                                    },
                                  ],
                                }}
                              >
                                <span className={styles.fullWidthTitle}>{node.title}</span>
                              </Dropdown>
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
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      login.isPrivateSpace() ? (
                        <NewDatasourceButton onSuccess={() => context?.reloadDatasourceList()} />
                      ) : null
                    }
                  />
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
