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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { DbObjsIcon } from '@/constant';
import { DbObjectType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Divider, Empty, Spin, Tabs, Tooltip, message, Popover } from 'antd';
import { useContext, useMemo } from 'react';
import { inject, observer } from 'mobx-react';
import Icon, { LoadingOutlined } from '@ant-design/icons';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import GlobalSearchContext from '@/page/Workspace/context/GlobalSearchContext';
import ConnectionPopover from '@/component/ConnectionPopover';
import {
  DbObjectTypeMap,
  MAX_OBJECT_LENGTH,
  objectTypeConfig,
  SEARCH_OBJECT_FROM_ALL_DATABASE,
} from '../constant';
import styles from '../index.less';
interface Iprops {
  modalStore?: ModalStore;
}

const ObjectList = ({ modalStore }: Iprops) => {
  const globalSearchContext = useContext(GlobalSearchContext);
  const {
    database,
    setDatabase,
    activeKey,
    setActiveKey,
    dataSource,
    objectlist,
    datasourceList,
    objectloading,
    actions,
    syncAllLoading,
    fetchSyncAll,
    next,
  } = globalSearchContext;
  const { positionResourceTree, applyTablePermission, openTree, openSql, applyDbPermission } =
    actions;
  const currentDataSourceType = datasourceList?.find(
    (item) => item.id === dataSource?.id,
  )?.dialectType;
  const ALL_TAB_MAX_LENGTH = 3;
  const dbType =
    currentDataSourceType || database?.dataSource?.dialectType || SEARCH_OBJECT_FROM_ALL_DATABASE;
  const { reloadDatabaseList } = useContext(ResourceTreeContext);
  const getTyepBlock = () => {
    const typeList = objectTypeConfig[dbType];
    const typeObjectTree = [];

    typeList?.forEach((i) => {
      switch (i) {
        case DbObjectType.column:
          typeObjectTree.push({ key: i, data: objectlist?.dbColumns });
          break;
        case DbObjectType.database:
          typeObjectTree.push({ key: i, data: objectlist?.databases });
          break;
        case DbObjectType.table:
          typeObjectTree.push({
            key: i,
            data: objectlist?.dbObjects?.filter((obj) =>
              [DbObjectType.table, DbObjectType.logical_table].includes(obj.type),
            ),
          });
          break;
        default:
          typeObjectTree.push({
            key: i,
            data: objectlist?.dbObjects?.filter((obj) => obj.type === i),
          });
          break;
      }
    });

    return typeObjectTree;
  };

  const typeObjectTree = getTyepBlock();

  const datasourceIcon = (component) => {
    if (!component) return;
    return (
      <Icon
        component={component}
        style={{ fontSize: 14, filter: 'grayscale(1) opacity(0.6)', margin: '0 2px 0 4px' }}
      />
    );
  };

  const emptyContent = useMemo(() => {
    let content;
    if (syncAllLoading) {
      content = (
        <div className={styles.asyncingContent}>
          <LoadingOutlined className={styles.asycLoading} />
        </div>
      );
    } else {
      content = (
        <Empty
          className={styles.asyncingContent}
          description={
            <div>
              <p>
                {formatMessage({
                  id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.32E0FB21',
                  defaultMessage: '暂无数据',
                })}
              </p>
              <p>
                {formatMessage({
                  id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.0A19E90A',
                  defaultMessage: '请尝试',
                })}

                <a
                  className={styles.syncMetadata}
                  onClick={async () => {
                    const data = await fetchSyncAll?.();
                    if (data?.data) {
                      message.success(
                        formatMessage({
                          id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.6BFBD33C',
                          defaultMessage: '同步发起成功',
                        }),
                      );
                      reloadDatabaseList?.();
                    }
                  }}
                >
                  {formatMessage({
                    id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.B042EF62',
                    defaultMessage: '同步元数据库',
                  })}
                </a>
                {formatMessage({
                  id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.6B9FDF51',
                  defaultMessage: '，或联系管理员',
                })}
              </p>
            </div>
          }
        />
      );
    }

    return content;
  }, [syncAllLoading]);

  const getSubTitle = (item, type) => {
    if (!item) return;
    const divider = <span style={{ padding: '0 4px' }}>/</span>;
    switch (type) {
      case DbObjectType.column:
        const { dbObject } = item;
        const { database, name: tableName, type } = dbObject;
        if (!database) return;
        const { name: databaseName, dataSource } = database;
        if (!dataSource) return;
        const { name: dataSourceName, dialectType } = dataSource;
        const dialectTypeIcon = getDataSourceStyleByConnectType(dialectType)?.icon;
        const dbIcon = getDataSourceStyleByConnectType(dialectType)?.dbIcon;
        return (
          <>
            {datasourceIcon(dialectTypeIcon?.component)}
            <Tooltip title={dataSourceName}>{dataSourceName}</Tooltip>
            {divider}
            <Tooltip title={databaseName}>{databaseName}</Tooltip>
            {divider}

            <Tooltip title={tableName}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tableName}
              </span>
            </Tooltip>
          </>
        );

      case DbObjectType.database: {
        const { dataSource } = item;
        if (!dataSource) return;
        const { name: dataSourceName, dialectType } = dataSource;
        const dialectTypeIcon = getDataSourceStyleByConnectType(dialectType)?.icon;
        return (
          <>
            {datasourceIcon(dialectTypeIcon?.component)}
            <Tooltip title={dataSourceName}>{dataSourceName}</Tooltip>
          </>
        );
      }
      default: {
        const { database } = item;
        const { name: databaseName, dataSource } = database;
        if (!dataSource) return;
        const { name: dataSourceName, dialectType } = dataSource;
        const dialectTypeIcon = getDataSourceStyleByConnectType(dialectType)?.icon;
        return (
          <>
            {datasourceIcon(dialectTypeIcon?.component)}
            <Tooltip title={dataSourceName}>{dataSourceName}</Tooltip>
            {divider}
            <Tooltip title={databaseName}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {databaseName}
              </span>
            </Tooltip>
          </>
        );
      }
    }
  };

  const renderAllTab = () => {
    return (
      <Spin spinning={objectloading}>
        {!objectlist?.dbColumns?.length &&
        !objectlist?.dbObjects?.length &&
        !objectlist?.databases?.length ? (
          emptyContent
        ) : (
          <div className={styles.objectlistBox}>
            {typeObjectTree?.map((i) => {
              const isDatabase = i.key === DbObjectType.database;
              /* 在选择了库之后检索, 会检索到数据库本身(若数据库名包含searchkey), 需要前端屏蔽掉 */
              if (isDatabase && database) return;
              if (i?.data?.length) {
                return (
                  <div className={styles.objectTypeBox}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div className={styles.objectTypeTitle}>{DbObjectTypeMap[i.key]?.label}</div>
                      {i.data.length > ALL_TAB_MAX_LENGTH ? (
                        <Button
                          className={styles.objectTypeItemMore}
                          type="link"
                          onClick={() => setActiveKey?.(i.key)}
                        >
                          {formatMessage({
                            id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.5DDBC7F0',
                            defaultMessage: '全部搜索结果',
                          })}
                        </Button>
                      ) : null}
                    </div>
                    <div>
                      {i.data.map((object, index) => {
                        if (index < ALL_TAB_MAX_LENGTH) {
                          return (
                            <Popover
                              showArrow={false}
                              placement={'left'}
                              content={
                                isDatabase ? (
                                  <ConnectionPopover
                                    connection={object?.dataSource}
                                    showRemark
                                    database={object}
                                  />
                                ) : null
                              }
                            >
                              <div
                                className={styles.objectTypeItem}
                                onClick={(e) => {
                                  let params = {
                                    type: undefined,
                                    database: undefined,
                                    name: undefined,
                                    objectName: undefined,
                                  };
                                  params.type = i?.key as DbObjectType;
                                  switch (i?.key) {
                                    case DbObjectType.database: {
                                      params.database = object as IDatabase;
                                      break;
                                    }
                                    case DbObjectType.column: {
                                      params.database = object.dbObject.database as IDatabase;
                                      params.name = object.name;
                                      params.objectName = object.dbObject.name;
                                      break;
                                    }
                                    default: {
                                      params.name = object.name;
                                      params.database = object.database as IDatabase;
                                      break;
                                    }
                                  }
                                  positionResourceTree?.(params);
                                  isDatabase ? openSql?.(e, object) : openTree?.(e, object);
                                }}
                              >
                                <div style={{ overflow: 'hidden', display: 'flex', width: '100%' }}>
                                  {isDatabase ? (
                                    <Icon
                                      component={
                                        getDataSourceStyleByConnectType(
                                          object?.dataSource?.dialectType,
                                        )?.dbIcon?.component
                                      }
                                      style={{ fontSize: 14, marginRight: 4 }}
                                    />
                                  ) : (
                                    <Icon
                                      component={DbObjsIcon[i?.key]}
                                      style={{
                                        color: 'var(--brand-blue6-color)',
                                        paddingRight: 4,
                                        fontSize: 14,
                                      }}
                                    />
                                  )}

                                  <span style={{ paddingRight: 4 }}>{object?.name}</span>
                                  <span
                                    style={{
                                      color: 'var(--icon-color-disable)',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap',
                                      display: 'flex',
                                      alignContent: 'center',
                                    }}
                                  >
                                    {getSubTitle(object, i?.key)}
                                  </span>
                                </div>
                                {isDatabase
                                  ? PositioninButton(object)
                                  : permissionBtn(object, i.key)}
                              </div>
                            </Popover>
                          );
                        }
                      })}
                    </div>
                    <Divider
                      style={{
                        margin: '8px 0',
                      }}
                    />
                  </div>
                );
              }
            })}
          </div>
        )}
      </Spin>
    );
  };

  const hasPermission = (object) => {
    return (
      object?.database?.authorizedPermissionTypes?.length ||
      object?.dbObject?.database?.authorizedPermissionTypes?.length
    );
  };

  const permissionBtn = (object, type: DbObjectType) => {
    if (hasPermission(object)) return;
    const isTableColumn =
      [DbObjectType.table, DbObjectType.view, DbObjectType.external_table]?.includes(
        object?.dbObject?.type,
      ) ||
      [DbObjectType.table, DbObjectType.view, DbObjectType.external_table]?.includes(object?.type);
    if (
      [
        DbObjectType.column,
        DbObjectType.table,
        DbObjectType.view,
        DbObjectType.external_table,
      ].includes(type) &&
      isTableColumn
    ) {
      return (
        <Button
          type="link"
          style={{ padding: 0, height: 18, display: 'inline-block' }}
          onClick={(e) => applyTablePermission?.(e, object, type)}
          className={styles.itemButton}
        >
          {formatMessage({
            id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.4DE0929F',
            defaultMessage: '申请表/视图权限',
          })}
        </Button>
      );
    }
    return (
      <Button
        type="link"
        style={{ padding: 0, height: 18 }}
        onClick={(e) => applyDbPermission?.(e, object)}
        className={styles.itemButton}
      >
        {formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.DB7526F7',
          defaultMessage: '申请库权限',
        })}
      </Button>
    );
  };

  const PositioninButton = (object) => {
    if (!!object?.authorizedPermissionTypes?.length) {
      return (
        <Button
          type="link"
          style={{ padding: 0, height: 18, display: 'inline-block' }}
          className={styles.itemButton}
          onClick={(e) => {
            e.stopPropagation();
            next?.({
              database: object,
            });
          }}
        >
          {formatMessage({
            id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.E74A1569',
            defaultMessage: '继续搜索',
          })}
        </Button>
      );
    }
    return (
      <Button
        type="link"
        style={{ padding: 0, height: 18 }}
        className={styles.itemButton}
        onClick={(e) => applyDbPermission?.(e, object)}
      >
        {formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.64F32480',
          defaultMessage: '申请库权限',
        })}
      </Button>
    );
  };

  const renderObjectTypeTabs = (type) => {
    const currentObjectList = typeObjectTree?.find((i) => i.key === type);
    const isDatabasetab = currentObjectList?.key === DbObjectType.database;
    const isColumntab = currentObjectList?.key === DbObjectType.column;

    return (
      <Spin spinning={objectloading}>
        {!currentObjectList?.data?.length ? (
          emptyContent
        ) : (
          <div className={styles.objectlistBox}>
            {currentObjectList?.data?.map((object) => {
              return (
                <Popover
                  showArrow={false}
                  placement={'left'}
                  content={
                    isDatabasetab ? (
                      <ConnectionPopover
                        connection={object?.dataSource}
                        showRemark
                        database={object}
                      />
                    ) : null
                  }
                >
                  <div
                    className={styles.objectItem}
                    onClick={(e) => {
                      let params = {
                        type: undefined,
                        database: undefined,
                        name: undefined,
                        objectName: undefined,
                      };
                      params.type = currentObjectList.key as DbObjectType;
                      if (isDatabasetab) {
                        params.database = object as IDatabase;
                      } else if (isColumntab) {
                        params.database = object.dbObject.database as IDatabase;
                        params.name = object.name;
                        params.objectName = object.dbObject.name;
                      } else {
                        params.name = object.name;
                        params.database = object.database as IDatabase;
                      }
                      positionResourceTree?.(params);
                      isDatabasetab ? openSql?.(e, object) : openTree?.(e, object);
                    }}
                  >
                    <div style={{ overflow: 'hidden', display: 'flex', width: '100%' }}>
                      {isDatabasetab ? (
                        <Icon
                          component={
                            getDataSourceStyleByConnectType(object?.dataSource?.dialectType)?.dbIcon
                              ?.component
                          }
                          style={{ fontSize: 14, marginRight: 4 }}
                        />
                      ) : (
                        <Icon
                          component={DbObjsIcon[type]}
                          style={{
                            color: 'var(--brand-blue6-color)',
                            paddingRight: 4,
                            fontSize: 14,
                          }}
                        />
                      )}

                      <span style={{ paddingRight: 4 }}>{object?.name}</span>
                      <span
                        style={{
                          color: 'var(--icon-color-disable)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignContent: 'center',
                        }}
                      >
                        {getSubTitle(object, type)}
                      </span>
                    </div>
                    {isDatabasetab
                      ? PositioninButton(object)
                      : permissionBtn(object, currentObjectList.key)}
                  </div>
                </Popover>
              );
            })}
            {currentObjectList?.data?.length === MAX_OBJECT_LENGTH && (
              <Divider plain>
                <span style={{ color: 'var(--icon-color-disable)' }}>
                  {formatMessage({
                    id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.625700F8',
                    defaultMessage: '最多展示',
                  })}
                  {MAX_OBJECT_LENGTH}
                  {formatMessage({
                    id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.D45537CC',
                    defaultMessage: '条结果',
                  })}
                </span>
              </Divider>
            )}
          </div>
        )}
      </Spin>
    );
  };

  const tabList = [
    {
      key: SEARCH_OBJECT_FROM_ALL_DATABASE,
      label: (
        <span style={{ padding: '0 6px' }}>
          {DbObjectTypeMap.SEARCH_OBJECT_FROM_ALL_DATABASE?.label}
        </span>
      ),

      children: renderAllTab(),
    },
  ]
    .concat(
      objectTypeConfig[dbType]?.map((i) => {
        if (i === DbObjectType.database && database) return;
        return {
          key: i,
          label: <span style={{ padding: '0 6px', margin: 0 }}>{DbObjectTypeMap?.[i]?.label}</span>,
          children: renderObjectTypeTabs(i),
        };
      }),
    )
    ?.filter(Boolean);

  const handleChange = (key) => {
    setActiveKey?.(key);
  };

  return (
    <Tabs
      className={styles.modalTabs}
      activeKey={activeKey}
      items={tabList}
      onChange={handleChange}
      popupClassName={styles.objectSearchPopup}
    />
  );
};

export default inject('modalStore', 'userStore')(observer(ObjectList));
