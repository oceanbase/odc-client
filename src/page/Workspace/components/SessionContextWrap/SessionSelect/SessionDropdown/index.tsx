import { getDataSourceModeConfig } from '@/common/datasource';
import { IDataSourceModeConfig } from '@/common/datasource/interface';
import { listDatabases } from '@/common/network/database';
import ConnectionPopover from '@/component/ConnectionPopover';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import StatusIcon from '@/component/StatusIcon/DataSourceIcon';
import { hasPermission, TaskTypeMap } from '@/component/Task/helper';
import { EnvColorMap } from '@/constant';
import { ConnectionMode, TaskType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { DataSourceStatusStore } from '@/store/datasourceStatus';
import { ReactComponent as PjSvg } from '@/svgr/project_space.svg';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import Icon from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Badge, Popover, Spin, Tooltip, Tree, Button } from 'antd';
import { DataNode } from 'antd/lib/tree';
import { toInteger } from 'lodash';
import { UserStore } from '@/store/login';
import { inject, observer } from 'mobx-react';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import React, { Key, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SessionContext from '../../context';
import { DEFALT_HEIGHT, DEFALT_WIDTH } from '../const';
import styles from './index.less';
import Search, { SearchType } from './search';
import Group from '@/page/Workspace/SideBar/ResourceTree/DatabaseGroup';
import { DatabaseGroup } from '@/d.ts/database';
import useGroupData from '@/page/Workspace/SideBar/ResourceTree/DatabaseTree/useGroupData';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';
import {
  NodeType,
  isGroupNode,
  GroupNodeToNodeType,
  filterGroupKey,
  getGroupKey,
  getSecondGroupKey,
  getShouldExpandedGroupKeys,
} from './helper';
import DatasourceSelectEmpty from '@/component/Empty/DatasourceSelectEmpty';
import DatabaseSelectEmpty from '@/component/Empty/DatabaseSelectEmpty';
interface IDatabasesTitleProps {
  db: IDatabase;
  taskType: TaskType;
  disabled: boolean;
}

const DatabasesTitle: React.FC<IDatabasesTitleProps> = (props) => {
  const { taskType, db, disabled } = props;
  const task = TaskTypeMap?.[taskType] || '';
  return (
    <>
      {disabled ? (
        <Tooltip
          placement={'right'}
          title={
            formatMessage(
              {
                id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.DC4CF38C',
                defaultMessage: '暂无{task}权限，请先申请库权限',
              },
              { task },
            ) /*`暂无${task}权限，请先申请库权限`*/
          }
        >
          <div className={styles.textoverflow}>{db.name}</div>
        </Tooltip>
      ) : (
        <Popover
          showArrow={false}
          placement={'right'}
          content={<ConnectionPopover connection={db?.dataSource} database={db} />}
        >
          <div className={styles.databaseItem}>
            <span className={styles.textoverflow}>{db.name}</span>
            <span className={styles.dataSourceInfo}>{db?.dataSource?.name}</span>
          </div>
        </Popover>
      )}

      <Badge color={EnvColorMap[db?.environment?.style?.toUpperCase()]?.tipColor} />
    </>
  );
};

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

interface IProps {
  width?: number | string;
  taskType?: TaskType;
  projectId?: number;
  dataSourceId?: number;
  filters?: ISessionDropdownFiltersProps;
  dataSourceStatusStore?: DataSourceStatusStore;
  disabled?: boolean;
  userStore?: UserStore;
  checkModeConfig?: ISessionDropdownCheckModeConfigProps;
  groupMode?: DatabaseGroup;
}

const SessionDropdown: React.FC<IProps> = (props) => {
  const {
    children,
    width,
    projectId,
    dataSourceId,
    filters = null,
    taskType,
    dataSourceStatusStore,
    disabled = false,
    userStore,
    groupMode: initGroupMode,
    checkModeConfig = null,
  } = props;
  const { onSelect, checkedKeys, setCheckedKeys, setOptions } = checkModeConfig || {};
  const context = useContext(SessionContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [canCheckedDbKeys, setCanCheckedDbKeys] = useState<number[]>([]);
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
  const [searchValue, setSearchValue] = useState<{ value: string; type: SearchType }>({
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

  const { DatabaseGroupMap, allDatasources } = useGroupData({
    databaseList: data?.contents,
    filter: (database: IDatabase) => {
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
      if (
        (datasourceId && toInteger(datasourceId) !== database?.dataSource?.id) ||
        (!datasourceId && database?.dataSource?.temp)
      ) {
        return null;
      }
      return true;
    },
  });

  useEffect(() => {
    if (isOpen) {
      run(
        projectId,
        datasourceId ? toInteger(datasourceId) : dataSourceId,
        1,
        99999,
        searchValue.value,
        null,
        userStore.isPrivateSpace(),
        true,
        true,
        null,
        null,
        searchValue.type === SearchType.DATASOURCE ? searchValue.value : null,
        searchValue.type === SearchType.CLUSTER ? searchValue.value : null,
        searchValue.type === SearchType.TENANT ? searchValue.value : null,
      );
    }
  }, [isOpen, searchValue]);

  useEffect(() => {
    if (allDatasources.length) {
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
  }, [data?.contents]);

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
    switch (groupMode) {
      case DatabaseGroup.none: {
        _treeData = [...(DatabaseGroupMap[groupMode]?.values() || [])]
          ?.map((database: IDatabase) => {
            let dbDisabled: boolean = false;
            if (taskType) {
              dbDisabled = !hasPermission(taskType, database.authorizedPermissionTypes);
            } else {
              dbDisabled = !database.authorizedPermissionTypes?.length;
            }
            !dbDisabled && _canCheckedDbKeys.push(database.id);
            return {
              title: <DatabasesTitle taskType={taskType} db={database} disabled={dbDisabled} />,
              key: database.id,
              selectable: true,
              isLeaf: true,
              icon: <DataBaseStatusIcon item={database} />,
              data: database,
              disabled: dbDisabled,
              type: NodeType.Database,
            };
          })
          .sort((a, b) => {
            if (a.disabled === b.disabled) return 0;
            return a.disabled ? 1 : -1;
          });
        break;
      }
      case DatabaseGroup.project:
      case DatabaseGroup.dataSource:
      case DatabaseGroup.tenant: {
        _treeData = [...(DatabaseGroupMap[groupMode]?.values() || [])].map((groupItem) => {
          let ds, icon;
          if (groupMode === DatabaseGroup.dataSource) {
            ds = data?.contents?.find((db: IDatabase) => db?.dataSource?.id === groupItem.mapId);
            icon = ds && <StatusIcon item={ds?.dataSource} />;
          } else if (groupMode === DatabaseGroup.project) {
            icon = (
              <Icon
                component={PjSvg}
                style={{
                  fontSize: 14,
                }}
              />
            );
          }
          const groupKey = getGroupKey(groupItem.mapId, groupMode);
          return {
            title: groupItem.groupName,
            key: groupKey,
            icon: icon ?? null,
            type: GroupNodeToNodeType[groupMode],
            children: groupItem.databases
              ?.map((database) => {
                let dbDisabled: boolean = false;
                if (taskType) {
                  dbDisabled = !hasPermission(taskType, database.authorizedPermissionTypes);
                } else {
                  dbDisabled = !database.authorizedPermissionTypes?.length;
                }
                !dbDisabled && _canCheckedDbKeys.push(database.id);
                return {
                  title: <DatabasesTitle taskType={taskType} db={database} disabled={dbDisabled} />,
                  key: database.id,
                  selectable: true,
                  isLeaf: true,
                  icon: <DataBaseStatusIcon item={database} />,
                  data: database,
                  type: NodeType.Database,
                  disabled: dbDisabled,
                };
              })
              .sort((a, b) => {
                if (a.disabled === b.disabled) return 0;
                return a.disabled ? 1 : -1;
              }),
          };
        });
        break;
      }
      case DatabaseGroup.cluster:
      case DatabaseGroup.environment:
      case DatabaseGroup.connectType: {
        _treeData = [...(DatabaseGroupMap[groupMode]?.values() || [])].map((groupItem) => {
          const groupKey = getGroupKey(groupItem.mapId, groupMode);
          return {
            title: groupItem.groupName,
            key: groupKey,
            type: GroupNodeToNodeType[groupMode],
            children: [...(groupItem.secondGroup.values() || [])].map((sItem) => {
              const sencondGroupKey = getSecondGroupKey(groupItem.mapId, sItem.mapId, groupMode);
              const ds = data?.contents?.find(
                (db: IDatabase) => db?.dataSource?.id === sItem.mapId,
              );
              const icon = ds && <StatusIcon item={ds?.dataSource} />;
              return {
                title: sItem.groupName,
                key: sencondGroupKey,
                icon: icon ?? null,
                type: NodeType.SecondGroupNodeDataSource,
                children: sItem.databases
                  ?.map((database) => {
                    let dbDisabled: boolean = false;
                    if (taskType) {
                      dbDisabled = !hasPermission(taskType, database.authorizedPermissionTypes);
                    } else {
                      dbDisabled = !database.authorizedPermissionTypes?.length;
                    }
                    !dbDisabled && _canCheckedDbKeys.push(database.id);
                    return {
                      title: (
                        <DatabasesTitle taskType={taskType} db={database} disabled={dbDisabled} />
                      ),
                      key: database.id,
                      selectable: true,
                      isLeaf: true,
                      icon: <DataBaseStatusIcon item={database} />,
                      data: database,
                      type: NodeType.Database,
                      disabled: dbDisabled,
                    };
                  })
                  .sort((a, b) => {
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
    setCanCheckedDbKeys(_canCheckedDbKeys);
    return _treeData;
  }, [groupMode, data]);

  const dataSourceData: DataNode[] = useMemo(() => {
    let _treeData = [];
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
          icon: <StatusIcon item={dataSource} />,
          key: dataSource?.id,
          selectable: true,
          isLeaf: true,
          type: NodeType.Connection,
        };
      })
      .filter(Boolean);
    return _treeData;
  }, [data, searchValueByDataSource]);

  function TreeRender() {
    return (
      <Tree
        ref={treeRef}
        className={styles.tree}
        expandAction="click"
        key={groupMode}
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
            await context.selectSession(dbId, dsId, undefined, info?.node?.data);
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
          setIsOpen(false);
        }}
        selectedKeys={[currentObject?.value].filter(Boolean)}
        expandedKeys={expandedKeys}
        onExpand={(expandedKeys) => {
          setExpandedKeys(expandedKeys);
        }}
        showIcon
        blockNode={true}
        treeData={context.datasourceMode ? dataSourceData : treeData}
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
    if (!checkModeConfig || !treeData?.length) return;
    return (
      <div className={styles.footer}>
        {checkedKeys.length !== canCheckedDbKeys.length && (
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
            全选
          </Button>
        )}
        {checkedKeys.length === canCheckedDbKeys.length && (
          <Button
            type="link"
            onClick={() => {
              setCheckedKeys([]);
              onSelect?.([]);
            }}
          >
            取消全选
          </Button>
        )}
      </div>
    );
  }

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
          <Spin spinning={loading || fetchLoading}>
            {treeData.length > 0 ? (
              <div className={styles.main}>
                <div className={styles.header} style={{ width: width || DEFALT_WIDTH }}>
                  <Search
                    searchValue={searchValue}
                    searchValueByDataSource={searchValueByDataSource}
                    setSearchValueByDataSource={setSearchValueByDataSource}
                    setSearchvalue={(v, type) => {
                      setSearchValue({ value: v, type });
                    }}
                  />
                  {!context.datasourceMode && (
                    <span className={styles.groupIcon}>
                      <Group setGroupMode={setGroupMode} groupMode={groupMode} />
                    </span>
                  )}
                </div>
                <div
                  style={{
                    height: DEFALT_HEIGHT,
                    width: width || DEFALT_WIDTH,
                    overflow: 'hidden',
                    padding: '0px 4px 12px 12px',
                  }}
                >
                  {TreeRender()}
                </div>
              </div>
            ) : context.datasourceMode ? (
              <DatasourceSelectEmpty />
            ) : (
              <DatabaseSelectEmpty />
            )}

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
