import { formatMessage } from '@/util/intl';
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

import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { UserStore } from '@/store/login';
import { SessionManagerStore } from '@/store/sessionManager';
import { Space, Tree, Spin, Button } from 'antd';
import { EventDataNode } from 'antd/lib/tree';
import { throttle } from 'lodash';
import { useUpdate } from 'ahooks';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadNode } from './helper';
import styles from './index.less';
import { DataBaseTreeData } from './Nodes/database';
import TreeNodeMenu from './TreeNodeMenu';
import { ResourceNodeType, TreeDataNode } from './type';
import tracert from '@/util/tracert';
import Reload from '@/component/Button/Reload';
import datasourceStatus from '@/store/datasourceStatus';
import DatasourceFilter from './DatasourceFilter';
import { ConnectType } from '@/d.ts';
import useTreeState from './hooks/useTreeState';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import SyncMetadata from '@/component/Button/SyncMetadata';
import { ModalStore } from '@/store/modal';
import type { SettingStore } from '@/store/setting';
import Group from './DatabaseGroup';
import DatabaseSearch from './DatabaseSearch';
import { PlusOutlined } from '@ant-design/icons';
import NewDatasourceButton from '@/page/Datasource/Datasource/NewDatasourceDrawer/NewButton';
import StatusIcon from '@/component/StatusIcon/DataSourceIcon';
import NewDatasourceDrawer from '@/page/Datasource/Datasource/NewDatasourceDrawer';
import { GroupNodeToResourceNodeType } from '@/page/Workspace/SideBar/ResourceTree/const';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import {
  getGroupKey,
  getSecondGroupKey,
  getShouldExpandedGroupKeys,
  TreeDataSecondGroupKey,
  TreeDataGroupKey,
} from './const';
import useDataSourceDrawer from './hooks/useDataSourceDrawer';
import DataSourceNodeMenu from '@/page/Workspace/SideBar/ResourceTree/TreeNodeMenu/dataSource';
import { isString } from 'lodash';
import DatabaseSelectEmpty from '@/component/Empty/DatabaseSelectEmpty';
import { ReactComponent as ProjectSvg } from '@/svgr/project_space.svg';
import Icon from '@ant-design/icons';

interface IProps {
  sessionManagerStore?: SessionManagerStore;
  modalStore?: ModalStore;
  userStore?: UserStore;
  settingStore?: SettingStore;
  databases: any[];
  reload: () => void;
  pollingDatabase: () => void;
  enableFilter?: boolean;
  stateId?: string;
  allDatabasesMap: Map<number, IDatabase>;
  DatabaseDataNodeMap: Map<number, TreeDataNode>;
  defaultExpandedKeys: React.Key[];
}

const ResourceTree: React.FC<IProps> = function ({
  sessionManagerStore,
  settingStore,
  databases,
  reload,
  pollingDatabase,
  enableFilter,
  stateId,
  allDatabasesMap,
  DatabaseDataNodeMap,
  userStore,
  defaultExpandedKeys,
}) {
  const { expandedKeys, loadedKeys, sessionIds, setSessionId, onExpand, onLoad, setExpandedKeys } =
    useTreeState(stateId);
  const {
    addDSVisiable,
    setAddDSVisiable,
    editDatasourceId,
    setEditDatasourceId,
    copyDatasourceId,
    setCopyDatasourceId,
    deleteDataSource,
  } = useDataSourceDrawer();
  const treeContext = useContext(ResourceTreeContext);
  const {
    groupMode,
    selectProjectId,
    selectDatasourceId,
    shouldExpandedKeys,
    setShouldExpandedKeys,
    setGroupMode,
    datasourceList,
    currentObject,
    databaseList,
    reloadDatasourceList,
    reloadDatabaseList,
  } = treeContext;
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const clockRef = useRef(null);
  const [envs, setEnvs] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [connectTypes, setConnectTypes] = useState<ConnectType[]>([]);
  const treeWrapperRef = useRef<HTMLDivElement>();
  const treeRef = useRef(null);
  const update = useUpdate();
  const [searchValue, setSearchValue] = useState<string>(null);
  useEffect(() => {
    tracert.expo('a3112.b41896.c330992');
    // 从外部跳转至sqlworkspace的定位
    if (groupMode === DatabaseGroup.project && selectProjectId) {
      setExpandedKeys([getGroupKey(selectProjectId, groupMode)]);
    }
    if (groupMode === DatabaseGroup.dataSource && selectDatasourceId) {
      setExpandedKeys([getGroupKey(selectDatasourceId, groupMode)]);
    }
    const resizeHeight = throttle(() => {
      setWrapperHeight(treeWrapperRef?.current?.offsetHeight);
    }, 500);
    setWrapperHeight(treeWrapperRef.current?.clientHeight);
    window.addEventListener('resize', resizeHeight);
    return () => {
      window.removeEventListener('resize', resizeHeight);
    };
  }, []);

  const dataSourceChangeReload = async () => {
    await reloadDatasourceList();
    setTimeout(() => {
      reloadDatabaseList();
    }, 500);
  };

  useEffect(() => {
    selectProjectId &&
      setExpandedKeys(
        Array.from(new Set([...expandedKeys, getGroupKey(selectProjectId, groupMode)])),
      );
    selectDatasourceId &&
      setExpandedKeys(
        Array.from(new Set([...expandedKeys, getGroupKey(selectDatasourceId, groupMode)])),
      );
  }, [selectProjectId, selectDatasourceId]);

  useEffect(() => {
    if (defaultExpandedKeys?.length && !currentObject) {
      // 如果没有选中的对象，则默认展开第一项
      setExpandedKeys(Array.from(new Set([...expandedKeys, ...defaultExpandedKeys])));
    }
  }, [defaultExpandedKeys]);

  const positionResourceByKey = (key, duration = 10) => {
    if (!key) return;
    if (clockRef?.current) {
      clearTimeout(clockRef?.current);
    }
    return new Promise<void>((resolve) => {
      clockRef.current = setTimeout(() => {
        treeRef?.current?.scrollTo({ key, align: 'top', offset: 100 });
        clockRef.current = null;
        resolve();
      }, duration);
    });
  };

  // 切换分组类型
  useEffect(() => {
    if (currentObject) {
      const { value: key, type } = currentObject;
      if (groupMode !== DatabaseGroup.none) {
        const shouldExpandedGroupKeys = getShouldExpandedGroupKeys({
          key,
          type,
          groupMode,
          databaseList,
        });
        setTimeout(() => {
          setExpandedKeys(Array.from(new Set([...expandedKeys, ...shouldExpandedGroupKeys])));
        });
      }
      positionResourceByKey(key, 500);
      return;
    }
  }, [groupMode]);

  /**
   * 递归逐级定位，先等待上一次定位完成后继续定位
   */
  const startPosition = async (index) => {
    if (!shouldExpandedKeys?.[index]) {
      positionResourceByKey(currentObject.value, 300)?.then(() => {
        setLoading(false);
        setShouldExpandedKeys([]);
      });
      return;
    }
    let duration = 1300;
    if (loadedKeys.includes(shouldExpandedKeys?.[index])) {
      // 已加载的节点只需等待页面加载时间，不需要考虑网络请求时间
      duration = 500;
    }
    if (isString(shouldExpandedKeys?.[index])) {
      const type = (shouldExpandedKeys?.[index] as string).split('-')?.[0];
      if (type === TreeDataGroupKey || type === TreeDataSecondGroupKey) {
        // 是分组节点只需等待页面加载时间，不需要考虑网络请求时间
        duration = 500;
      }
    }
    positionResourceByKey(shouldExpandedKeys?.[index], duration).then(() => {
      startPosition(index + 1);
    });
  };

  useEffect(() => {
    if (shouldExpandedKeys?.length && currentObject.value) {
      setTimeout(() => {
        setExpandedKeys(Array.from(new Set([...expandedKeys, ...shouldExpandedKeys])));
        setLoading(true);
        startPosition(0);
      });
    }
  }, [shouldExpandedKeys]);

  const treeData = (() => {
    switch (groupMode) {
      case DatabaseGroup.none: {
        return databases
          ?.filter((db: IDatabase) => {
            return (
              !(envs?.length && !envs.includes(db.environment?.id)) &&
              !(connectTypes?.length && !connectTypes.includes(db.dataSource?.type))
            );
          })
          ?.map((database: IDatabase) => {
            if (loadedKeys.includes(database.id)) {
              const dbId = database.id;
              const dbSessionId = sessionIds[dbId];
              const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
              DatabaseDataNodeMap.set(
                database.id,
                DataBaseTreeData(dbSession, database, database?.id, true),
              );
            }
            return DatabaseDataNodeMap.get(database.id);
          });
      }
      case DatabaseGroup.project:
      case DatabaseGroup.dataSource:
      case DatabaseGroup.tenant: {
        return databases.map((groupItem) => {
          const groupKey = getGroupKey(groupItem.mapId, groupMode);
          let data, icon;
          if (groupMode === DatabaseGroup.dataSource) {
            data = datasourceList.find((d) => d.id === groupItem.mapId);
            icon = data && <StatusIcon item={data} />;
          } else if (groupMode === DatabaseGroup.project) {
            icon = <Icon component={ProjectSvg} />;
          }
          return {
            title: groupItem.groupName,
            tip: groupItem.tip,
            key: groupKey,
            type: GroupNodeToResourceNodeType[groupMode],
            data: data ?? null,
            icon: icon ?? null,
            isLeaf: groupItem.databases.length ? false : true,
            children: groupItem.databases
              ?.filter((db: IDatabase) => {
                return (
                  !(envs?.length && !envs.includes(db.environment?.id)) &&
                  !(connectTypes?.length && !connectTypes.includes(db.dataSource?.type))
                );
              })
              ?.map((database: IDatabase) => {
                if (loadedKeys.includes(database.id)) {
                  const dbId = database.id;
                  const dbSessionId = sessionIds[dbId];
                  const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
                  DatabaseDataNodeMap.set(
                    database.id,
                    DataBaseTreeData(dbSession, database, database?.id, true),
                  );
                }
                return DatabaseDataNodeMap.get(database.id);
              }),
          };
        });
      }
      case DatabaseGroup.cluster:
      case DatabaseGroup.environment:
      case DatabaseGroup.connectType: {
        return databases.map((groupItem) => {
          const groupKey = getGroupKey(groupItem.mapId, groupMode);
          return {
            title: groupItem.groupName,
            key: groupKey,
            type: GroupNodeToResourceNodeType[groupMode],
            children: [...groupItem.secondGroup.values()]?.map((sItem) => {
              const sencondGroupKey = getSecondGroupKey(groupItem.mapId, sItem.mapId, groupMode);
              const data = datasourceList.find((d) => d.id === sItem.mapId);
              const icon = data && <StatusIcon item={data} />;
              return {
                title: sItem.groupName,
                key: sencondGroupKey,
                type: ResourceNodeType.SecondGroupNodeDataSource,
                data: data ?? null,
                icon: icon ?? null,
                isLeaf: sItem.databases.length ? false : true,
                children: sItem.databases
                  ?.filter((db: IDatabase) => {
                    return (
                      !(envs?.length && !envs.includes(db.environment?.id)) &&
                      !(connectTypes?.length && !connectTypes.includes(db.dataSource?.type))
                    );
                  })
                  ?.map((database: IDatabase) => {
                    if (loadedKeys.includes(database.id)) {
                      const dbId = database.id;
                      const dbSessionId = sessionIds[dbId];
                      const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
                      DatabaseDataNodeMap.set(
                        database.id,
                        DataBaseTreeData(dbSession, database, database?.id, true),
                      );
                    }
                    return DatabaseDataNodeMap.get(database.id);
                  }),
              };
            }),
          };
        });
      }
    }
  })();

  const loadData = useCallback(
    async (treeNode: EventDataNode<any> & TreeDataNode) => {
      const { type, data } = treeNode;
      switch (type) {
        case ResourceNodeType.Database: {
          const dbId = (data as IDatabase).id;
          const dbSession =
            sessionManagerStore.sessionMap.get(sessionIds[dbId]) ||
            (await sessionManagerStore.createSession(null, data?.id, true, true));
          if (dbSession && dbSession !== 'NotFound') {
            setSessionId(dbId, dbSession?.sessionId);
            update();
          } else {
            throw new Error("load database's session failed");
            return;
          }
          break;
        }
        default: {
          await loadNode(sessionManagerStore, treeNode);
        }
      }
    },
    [sessionIds],
  );

  const renderNode = useCallback(
    (node: TreeDataNode): React.ReactNode => {
      const { type, sessionId } = node;
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (
        [ResourceNodeType.GroupNodeDataSource, ResourceNodeType.SecondGroupNodeDataSource].includes(
          type,
        )
      ) {
        return (
          <DataSourceNodeMenu
            node={node}
            setCopyDatasourceId={setCopyDatasourceId}
            deleteDataSource={deleteDataSource}
            setAddDSVisiable={setAddDSVisiable}
            setEditDatasourceId={setEditDatasourceId}
            copyDatasourceId={copyDatasourceId}
            reload={reload}
          />
        );
      }
      return (
        <TreeNodeMenu
          node={node}
          dbSession={dbSession}
          type={type}
          pollingDatabase={pollingDatabase}
        />
      );
    },
    [sessionIds],
  );

  return (
    <>
      <div className={styles.resourceTree}>
        <div className={styles.title}>
          <span className={styles.titleText}>
            {formatMessage({
              id: 'src.page.Workspace.SideBar.ResourceTree.87784E3D',
              defaultMessage: '数据库',
            })}
          </span>
          <span className={styles.titleAction}>
            <Space size={8} style={{ lineHeight: 1.5 }}>
              {enableFilter ? (
                <DatasourceFilter
                  key="ResourceTreeDatasourceFilter"
                  envs={envs}
                  types={connectTypes}
                  onClear={() => {
                    setEnvs([]);
                    setConnectTypes([]);
                  }}
                  onEnvsChange={(v) => {
                    setEnvs(v);
                  }}
                  onTypesChange={(v) => {
                    setConnectTypes(v);
                  }}
                />
              ) : null}
              <Group setGroupMode={setGroupMode} groupMode={groupMode} />

              <SyncMetadata reload={reload} databaseList={[...allDatabasesMap.values()]} />
              <Reload
                key="ResourceTreeReload"
                onClick={() => {
                  reload();
                }}
                style={{ display: 'flex' }}
              />
            </Space>
          </span>
        </div>
        <div className={styles.search}>
          <DatabaseSearch searchValue={searchValue} setSearchValue={setSearchValue} />
          {userStore.isPrivateSpace() ? (
            <NewDatasourceButton onSuccess={dataSourceChangeReload}>
              <Button
                size="small"
                type="primary"
                className={styles.newDataSourceButton}
                icon={<PlusOutlined />}
              />
            </NewDatasourceButton>
          ) : null}
        </div>
        <div ref={treeWrapperRef} className={styles.tree}>
          <Spin spinning={loading}>
            {treeData.length > 0 ? (
              <Tree
                ref={treeRef}
                expandAction="click"
                showIcon
                onExpand={(_, info) => {
                  onExpand(_, info);
                  //@ts-ignore
                  tracert.click('a3112.b41896.c330992.d367628', { resourceType: info?.node?.type });
                }}
                treeData={treeData}
                titleRender={renderNode}
                loadData={loadData}
                expandedKeys={expandedKeys}
                loadedKeys={loadedKeys}
                onLoad={onLoad}
                // 需要初始一个height值，否则初始时wrapperHeight为0，会先渲染全量数据
                height={wrapperHeight || 1000}
                selectable={true}
                selectedKeys={[currentObject?.value].filter(Boolean)}
              />
            ) : (
              <DatabaseSelectEmpty showIcon />
            )}
          </Spin>
        </div>
      </div>
      <NewDatasourceDrawer
        isEdit={!!editDatasourceId}
        visible={addDSVisiable}
        id={editDatasourceId}
        close={() => {
          setEditDatasourceId(null);
          setAddDSVisiable(false);
        }}
        onSuccess={dataSourceChangeReload}
      />

      <NewDatasourceDrawer
        isEdit={false}
        isCopy={true}
        id={copyDatasourceId}
        visible={!!copyDatasourceId}
        close={() => {
          setCopyDatasourceId(null);
        }}
        onSuccess={dataSourceChangeReload}
      />
    </>
  );
};

export default inject(
  'sessionManagerStore',
  'userStore',
  'modalStore',
  'settingStore',
)(observer(ResourceTree));
