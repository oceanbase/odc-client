import { getDataSourceModeConfig } from '@/common/datasource';
import { IDataSourceModeConfig } from '@/common/datasource/interface';
import { listDatabases, listDatabasesParams } from '@/common/network/database';
import ConnectionPopover from '@/component/ConnectionPopover';
import { ConnectionMode, TaskType, IDatabaseHistoriesParam } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { DataSourceStatusStore } from '@/store/datasourceStatus';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Badge, Popover, Spin, Tooltip, Tree, Button, Radio, Space } from 'antd';
import { DataNode } from 'antd/lib/tree';
import { toInteger } from 'lodash';
import login, { UserStore } from '@/store/login';
import { inject, observer } from 'mobx-react';
import { isConnectTypeBeFileSystemGroup, isPgDataDataSource } from '@/util/connection';
import React, { Key, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SessionContext from '../../context';
import { DEFALT_HEIGHT, DEFALT_WIDTH } from '../const';
import styles from './index.less';
import Search from './components/Search';
import Group from '@/page/Workspace/SideBar/ResourceTree/DatabaseGroup';
import { DatabaseGroup } from '@/d.ts/database';
import useGroupData from '@/page/Workspace/SideBar/ResourceTree/DatabaseTree/useGroupData';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';
import DatabaseSelectTab from './components/Tab';
import { GroupNodeTitle } from './components/DatabasesTitle';
import RecentlyDatabaseEmpty from '@/component/Empty/RecentlyDatabaseEmpty';
import { DatabaseSearchType } from '@/d.ts/database';
import { getDatabasesHistories } from '@/common/network/task';
import {
  NodeType,
  isGroupNode,
  GroupNodeToNodeType,
  filterGroupKey,
  getGroupKey,
  getSecondGroupKey,
  getShouldExpandedGroupKeys,
  getIcon,
  DatabaseGroupArr,
  hasSecondGroup,
} from './helper';
import DatasourceSelectEmpty from '@/component/Empty/DatasourceSelectEmpty';
import DatabaseSelectEmpty from '@/component/Empty/DatabaseSelectEmpty';
import renderDatabaseNode from './renderDatabaseNode';
import { ExportOutlined } from '@ant-design/icons';
import { ScheduleType } from '@/d.ts/schedule';

export interface IDatabasesTitleProps {
  db: IDatabase;
  taskType: TaskType;
  disabled: boolean;
}
export interface ISessionDropdownFiltersProps {
  dialectTypes?: ConnectionMode[];
  feature?: keyof IDataSourceModeConfig['features'];
  isIncludeLogicalDb?: boolean;
  hideFileSystem?: boolean;
}

export interface ISessionDropdownCheckModeConfigProps {
  setOptions: React.Dispatch<React.SetStateAction<SelectItemProps[]>>;
  checkedKeys: React.Key[];
  setCheckedKeys?: React.Dispatch<React.SetStateAction<React.Key[]>>;
  onSelect: (value: React.Key[]) => void;
}
export enum TabsType {
  all = 'all',
  recentlyUsed = 'recentlyUsed',
}
interface IProps {
  width?: number | string;
  taskType?: TaskType;
  scheduleType?: ScheduleType;
  projectId?: number;
  dataSourceId?: number;
  filters?: ISessionDropdownFiltersProps;
  dataSourceStatusStore?: DataSourceStatusStore;
  disabled?: boolean;
  userStore?: UserStore;
  checkModeConfig?: ISessionDropdownCheckModeConfigProps;
  groupMode?: DatabaseGroup;
  manageLinkVisible?: boolean;
}

const SessionDropdown: React.FC<IProps> = (props) => {
  const {
    children,
    width,
    projectId,
    dataSourceId,
    filters = null,
    taskType,
    scheduleType,
    dataSourceStatusStore,
    disabled = false,
    userStore,
    groupMode: initGroupMode,
    checkModeConfig = null,
    manageLinkVisible = false,
  } = props;
  const { onSelect, checkedKeys, setCheckedKeys, setOptions } = checkModeConfig || {};
  const context = useContext(SessionContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [canCheckedDbKeys, setCanCheckedDbKeys] = useState<number[]>([]);
  const [tab, setTab] = useState<TabsType>(TabsType.all);
  const [groupMode, _setGroupMode] = useState(
    userStore.isPrivateSpace() ? DatabaseGroup.dataSource : DatabaseGroup.project,
  );
  const setGroupMode = (type: DatabaseGroup) => {
    localStorage.setItem('sessionDropdownGroupMode', type);
    _setGroupMode(type);
  };
  const [currentObject, setCurrentObject] = useState<{
    value: React.Key;
    type: NodeType;
  }>(undefined);
  const clockRef = useRef(null);
  const treeRef = useRef(null);
  const { datasourceId } = useParams<{
    datasourceId: string;
  }>();
  const [searchValue, setSearchValue] = useState<{ value: string; type: DatabaseSearchType }>({
    value: null,
    type: null,
  });
  const [searchValueByDataSource, setSearchValueByDataSource] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const hasDialectTypesFilter =
    filters?.dialectTypes && Array.isArray(filters?.dialectTypes) && filters?.dialectTypes?.length;
  const hasFeature = !!filters?.feature;
  const isIncludeLogicalDb = !!filters?.isIncludeLogicalDb;

  const {
    data,
    run,
    loading: fetchLoading,
  } = useRequest(listDatabases, {
    manual: true,
    onSuccess: (dataList) => {
      if (!checkModeConfig) return;
      const options =
        dataList?.contents?.map((content) => ({
          label: content.name,
          value: content.id,
        })) || [];
      setOptions(options);
    },
  });

  const {
    data: databasesHistory,
    run: runGetDatabasesHistories,
    loading: databaseHistoryLoading,
  } = useRequest((params: IDatabaseHistoriesParam) => getDatabasesHistories(params), {
    manual: true,
  });

  const filter = (database: IDatabase) => {
    if (!context?.isLogicalDatabase && database.type === 'LOGICAL' && !isIncludeLogicalDb) {
      return false;
    }
    if (
      context?.isLogicalDatabase
        ? database.type !== 'LOGICAL'
        : database.type !== 'PHYSICAL' && !isIncludeLogicalDb
    ) {
      return false;
    }
    const support =
      !taskType ||
      database.type === 'LOGICAL' ||
      getDataSourceModeConfig(database.dataSource?.type)?.features?.task?.includes(taskType);
    if (!support) {
      return false;
    }
    if (
      scheduleType &&
      !getDataSourceModeConfig(database?.dataSource?.type)?.features?.schedule?.includes(
        scheduleType,
      )
    ) {
      return false;
    }
    if (
      !taskType &&
      !scheduleType &&
      !getDataSourceModeConfig(database?.dataSource?.type)?.features?.sqlconsole
    ) {
      return false;
    }
    if (
      hasDialectTypesFilter &&
      !filters?.dialectTypes?.includes(database?.dataSource?.dialectType)
    ) {
      return false;
    }
    if (isConnectTypeBeFileSystemGroup(database?.dataSource?.type) && filters?.hideFileSystem) {
      return false;
    }
    if (
      hasFeature &&
      !getDataSourceModeConfig(database?.dataSource?.type)?.features[filters?.feature]
    ) {
      return false;
    }
    if (projectId && database?.project?.id && toInteger(projectId) !== database?.project?.id) {
      return false;
    }
    return true;
  };

  const { DatabaseGroupMap, allDatasources } = useGroupData({
    databaseList: data?.contents,
    filter,
  });

  useEffect(() => {
    if (isOpen) {
      const params: listDatabasesParams = {
        projectId,
        dataSourceId: datasourceId ? toInteger(datasourceId) : dataSourceId,
        page: 1,
        size: 99999,
        fuzzyKeyword: searchValue?.value,
        containsUnassigned: userStore.isPrivateSpace(),
        existed: true,
        includesPermittedAction: true,
        searchType: searchValue?.type,
      };
      // 个人空间不需要获取数据库的权限
      if (userStore?.isPrivateSpace()) {
        params.includesPermittedAction = false;
      }
      run(params);
      if (!context.datasourceMode && !checkModeConfig && !userStore.isPrivateSpace()) {
        runGetDatabasesHistories({
          currentOrganizationId: userStore.organizationId,
          limit: 10,
        });
      }
    }
  }, [isOpen, searchValue]);

  useEffect(() => {
    if (allDatasources?.length) {
      dataSourceStatusStore.asyncUpdateStatus(allDatasources?.map((a) => a.id));
    }
  }, [allDatasources]);

  const positionTreeByKey = (key, duration = 10) => {
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

  useEffect(() => {
    if (isOpen) {
      if (initGroupMode) {
        _setGroupMode(initGroupMode);
      } else {
        const type = localStorage.getItem('sessionDropdownGroupMode');
        if (type && type !== 'null' && type !== 'undefined') {
          if (
            userStore.isPrivateSpace() &&
            [DatabaseGroup.project, DatabaseGroup.none].includes(type as DatabaseGroup)
          ) {
            return;
          }
          _setGroupMode(type as DatabaseGroup);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentObject) {
      const { value: key, type } = currentObject;
      if (groupMode !== DatabaseGroup.none) {
        const shouldExpandedGroupKeys = getShouldExpandedGroupKeys({
          key,
          type,
          groupMode,
          databaseList: data?.contents,
        });
        setTimeout(() => {
          setExpandedKeys(Array.from(new Set([...expandedKeys, ...shouldExpandedGroupKeys])));
        });
      }
      positionTreeByKey(key, 300);
    }
  }, [groupMode]);

  useEffect(() => {
    if (context.databaseId) {
      if (checkModeConfig) return;
      const shouldExpandedGroupKeys = getShouldExpandedGroupKeys({
        key: context.databaseId,
        type: NodeType.Database,
        groupMode,
        databaseList: data?.contents,
      });
      setTimeout(() => {
        setExpandedKeys(Array.from(new Set([...expandedKeys, ...shouldExpandedGroupKeys])));
      });
      positionTreeByKey(context.databaseId, 300).then(() => {
        setCurrentObject({ value: context.databaseId, type: NodeType.Database });
      });
    }
    initDefaultExpandedKeys();
  }, [data?.contents]);

  const initDefaultExpandedKeys = () => {
    const defaultExpandedKeys = [];
    if (data?.contents?.length && !context.datasourceMode && !context.databaseId) {
      DatabaseGroupArr.forEach((item) => {
        if (item !== DatabaseGroup.none) {
          const group = DatabaseGroupMap?.[item]?.entries()?.next()?.value?.[1];
          group?.mapId && defaultExpandedKeys.push(getGroupKey(group?.mapId, item));
          if (hasSecondGroup(item)) {
            const secondGroup = group?.secondGroup?.entries()?.next()?.value?.[1];
            secondGroup?.mapId &&
              defaultExpandedKeys.push(getSecondGroupKey(group?.mapId, secondGroup?.mapId, item));
          }
        }
      });
    }
    setExpandedKeys(Array.from(new Set([...expandedKeys, ...defaultExpandedKeys])));
  };

  function onOpen(open: boolean) {
    if (!open) {
      setIsOpen(open);
      return;
    }
    tracert.click('a3112.b41896.c330994.d367631');
    setIsOpen(open);
  }

  const treeData: DataNode[] = useMemo(() => {
    let _treeData = [];
    const _canCheckedDbKeys: number[] = [];
    if (context.datasourceMode) {
      _treeData = [...(DatabaseGroupMap[DatabaseGroup.dataSource]?.values() || [])]
        ?.map((item) => {
          const { dataSource } = item;
          if (!dataSource) {
            return null;
          }
          if (
            searchValueByDataSource &&
            !dataSource?.name?.toLowerCase().includes(searchValueByDataSource?.toLowerCase())
          ) {
            return null;
          }
          return {
            title: (
              <Popover
                showArrow={false}
                placement={'right'}
                content={<ConnectionPopover connection={dataSource} />}
              >
                <div className={styles.textoverflow}>{dataSource?.name}</div>
              </Popover>
            ),

            icon: getIcon({ type: NodeType.Connection, dataSource }),
            key: dataSource?.id,
            selectable: true,
            isLeaf: true,
            type: NodeType.Connection,
          };
        })
        .filter(Boolean);
    } else if (tab === TabsType.recentlyUsed) {
      _treeData = databasesHistory
        ?.filter(filter)
        ?.map((database) => renderDatabaseNode({ taskType, database }));
    } else {
      switch (groupMode) {
        case DatabaseGroup.none: {
          _treeData = [...(DatabaseGroupMap[groupMode]?.values() || [])]
            ?.map((database: IDatabase) =>
              renderDatabaseNode({ taskType, database, canCheckedDbKeys: _canCheckedDbKeys }),
            )
            ?.sort((a, b) => {
              if (a.disabled === b.disabled) return 0;
              return a.disabled ? 1 : -1;
            });
          break;
        }
        case DatabaseGroup.project:
        case DatabaseGroup.dataSource: {
          _treeData = [...(DatabaseGroupMap[groupMode]?.values() || [])].map((groupItem) => {
            const groupKey = getGroupKey(groupItem.mapId, groupMode);
            return {
              title: <GroupNodeTitle item={groupItem} tip={groupItem?.tip} />,
              key: groupKey,
              icon: getIcon({
                type: GroupNodeToNodeType[groupMode],
                dataSource: data?.contents?.find(
                  (db: IDatabase) => db?.dataSource?.id === groupItem.mapId,
                )?.dataSource,
              }),
              type: GroupNodeToNodeType[groupMode],
              children: groupItem.databases
                ?.map((database) =>
                  renderDatabaseNode({ taskType, database, canCheckedDbKeys: _canCheckedDbKeys }),
                )
                ?.sort((a, b) => {
                  if (a.disabled === b.disabled) return 0;
                  return a.disabled ? 1 : -1;
                }),
            };
          });
          break;
        }
        case DatabaseGroup.cluster:
        case DatabaseGroup.environment:
        case DatabaseGroup.connectType:
        case DatabaseGroup.tenant: {
          _treeData = [...(DatabaseGroupMap[groupMode]?.values() || [])].map((groupItem) => {
            const groupKey = getGroupKey(groupItem.mapId, groupMode);
            return {
              title: <GroupNodeTitle item={groupItem} />,
              key: groupKey,
              type: GroupNodeToNodeType[groupMode],
              children: [...(groupItem.secondGroup.values() || [])].map((sItem) => {
                const sencondGroupKey = getSecondGroupKey(groupItem.mapId, sItem.mapId, groupMode);
                return {
                  title: sItem.groupName,
                  key: sencondGroupKey,
                  icon: getIcon({
                    type: NodeType.SecondGroupNodeDataSource,
                    dataSource: data?.contents?.find(
                      (db: IDatabase) => db?.dataSource?.id === sItem.mapId,
                    )?.dataSource,
                  }),
                  type: NodeType.SecondGroupNodeDataSource,
                  children: sItem.databases
                    ?.map((database) =>
                      renderDatabaseNode({
                        taskType,
                        database,
                        canCheckedDbKeys: _canCheckedDbKeys,
                      }),
                    )
                    ?.sort((a, b) => {
                      if (a.disabled === b.disabled) return 0;
                      return a.disabled ? 1 : -1;
                    }),
                };
              }),
            };
          });
          break;
        }
      }
    }
    _treeData = _treeData || [];
    setCanCheckedDbKeys(_canCheckedDbKeys);
    return _treeData;
  }, [groupMode, data, searchValueByDataSource, tab]);

  function TreeRender() {
    return (
      <Tree
        ref={treeRef}
        className={styles.tree}
        expandAction="click"
        height={215}
        onSelect={async (_, info) => {
          const key = info.node?.key?.toString();
          //@ts-ignore
          if (isGroupNode(info?.node?.type) || checkModeConfig) return;
          //@ts-ignore
          setCurrentObject({ value: info.node?.key, type: info.node?.type });
          let dbId: number, dsId: number;
          if (context.datasourceMode) {
            dsId = toInteger(key);
          } else {
            dbId = toInteger(key);
          }
          setLoading(true);
          try {
            //@ts-ignore
            await context.selectSession(dbId, dsId, info?.node?.data);
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
          setIsOpen(false);
        }}
        selectedKeys={[currentObject?.value].filter(Boolean)}
        expandedKeys={expandedKeys}
        onExpand={(Keys) => {
          setExpandedKeys(Keys);
        }}
        showIcon
        blockNode={true}
        treeData={treeData}
        checkedKeys={checkedKeys}
        onCheck={(checkedKeysValue) => {
          const KeyList = filterGroupKey(checkedKeysValue as React.Key[]);
          setCheckedKeys(KeyList);
          onSelect?.(KeyList);
        }}
        checkable={!!checkModeConfig}
      />
    );
  }

  function footerRender() {
    if (manageLinkVisible) {
      return (
        <div className={styles.footer}>
          <Button
            type="link"
            onClick={() => {
              const isPrivateSpace = login.isPrivateSpace();
              if (isPrivateSpace) {
                window.open(`#/sqlworkspace`, '_blank');
              } else {
                window.open(`#/project/${projectId}/database`, '_blank');
              }
            }}
          >
            <Space>
              {formatMessage({
                id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.49B355DA',
                defaultMessage: '管理数据库',
              })}

              <ExportOutlined />
            </Space>
          </Button>
        </div>
      );
    }
    if (!checkModeConfig || !treeData?.length) return;
    return (
      <div className={styles.footer}>
        {checkedKeys.length !== canCheckedDbKeys?.length && (
          <Button
            type="link"
            onClick={() => {
              const KeyList = filterGroupKey(
                Array.from(new Set([...expandedKeys, ...canCheckedDbKeys])),
              );
              setCheckedKeys(KeyList);
              onSelect?.(KeyList);
            }}
          >
            {formatMessage({
              id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.86AE09B0',
              defaultMessage: '全选',
            })}
          </Button>
        )}

        {checkedKeys?.length === canCheckedDbKeys?.length && (
          <Button
            type="link"
            onClick={() => {
              setCheckedKeys([]);
              onSelect?.([]);
            }}
          >
            {formatMessage({
              id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.7FA7CC62',
              defaultMessage: '取消全选',
            })}
          </Button>
        )}
      </div>
    );
  }

  const empty = useMemo(() => {
    if (context.datasourceMode) {
      return <DatasourceSelectEmpty height={186} />;
    } else if (tab === TabsType.recentlyUsed) {
      return <RecentlyDatabaseEmpty height={156} />;
    } else {
      return <DatabaseSelectEmpty height={220} />;
    }
  }, [context.datasourceMode, tab]);

  return (
    <Popover
      trigger={['click']}
      placement="bottom"
      overlayClassName={styles.sessionSelectPopover}
      open={isOpen}
      showArrow={false}
      onOpenChange={onOpen}
      overlayStyle={{ paddingTop: 2, width }}
      content={
        disabled ? null : (
          <Spin spinning={loading || fetchLoading || databaseHistoryLoading}>
            <div className={styles.main}>
              <div className={styles.header} style={{ width: width || DEFALT_WIDTH }}>
                {!context.datasourceMode && !checkModeConfig && !userStore.isPrivateSpace() && (
                  <DatabaseSelectTab tab={tab} setTab={setTab} />
                )}

                {tab === TabsType.all && (
                  <Search
                    searchValue={searchValue}
                    searchValueByDataSource={searchValueByDataSource}
                    setSearchValueByDataSource={setSearchValueByDataSource}
                    setSearchvalue={(v, type) => {
                      setSearchValue({ value: v, type });
                    }}
                  />
                )}

                {!context.datasourceMode && tab === TabsType.all && (
                  <span className={styles.groupIcon}>
                    <Group setGroupMode={setGroupMode} groupMode={groupMode} />
                  </span>
                )}
              </div>
              <div
                style={{ height: DEFALT_HEIGHT, width: width || DEFALT_WIDTH }}
                className={styles.treeContainer}
              >
                {treeData?.length > 0 ? TreeRender() : empty}
              </div>
            </div>
            {footerRender()}
          </Spin>
        )
      }
    >
      {children}
    </Popover>
  );
};
export default inject('dataSourceStatusStore', 'userStore')(observer(SessionDropdown));
