import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { DbObjsIcon } from '@/constant';
import { ConnectionMode, DbObjectType } from '@/d.ts';
import { IDatabase, IDatabaseObject } from '@/d.ts/database';
import { openNewSQLPage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Button, Divider, Empty, Spin, Tabs, Tooltip } from 'antd';
import { useState } from 'react';
import {
  DbObjectTypeMap,
  MAX_OBJECT_LENGTH,
  objectTypeConfig,
  SEARCH_OBJECT_FROM_ALL_DATABASE,
} from '../constant';
import styles from '../index.less';
interface Iprops {
  database: IDatabase;
  objectlist: IDatabaseObject;
  setDatabase: React.Dispatch<React.SetStateAction<IDatabase>>;
  setSearchKey: React.Dispatch<React.SetStateAction<string>>;
  activeKey: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
  modalStore: ModalStore;
  loading: boolean;
  selectProjectId: number;
  currentDataSourceType: ConnectionMode;
}

const ObjectList = ({
  database,
  setDatabase,
  objectlist,
  activeKey,
  setActiveKey,
  setSearchKey,
  modalStore,
  loading,
  selectProjectId,
  currentDataSourceType,
}: Iprops) => {
  const [activeDatabase, setActiveDatabase] = useState<IDatabase>();
  const ALL_TAB_MAX_LENGTH = 3;
  const dbType =
    currentDataSourceType || database?.dataSource?.dialectType || SEARCH_OBJECT_FROM_ALL_DATABASE;
  const getTyepBlock = () => {
    const typeList = objectTypeConfig[dbType];
    const typeObjectTree = typeList?.map((i) => {
      switch (i) {
        case DbObjectType.column:
          return { key: i, data: objectlist?.dbColumns };
        case DbObjectType.database:
          return { key: i, data: objectlist?.databases };
        case DbObjectType.table:
          return {
            key: i,
            data: objectlist?.dbObjects?.filter((obj) =>
              [DbObjectType.table, DbObjectType.logical_table].includes(obj.type),
            ),
          };
        default:
          return {
            key: i,
            data: objectlist?.dbObjects?.filter((obj) => obj.type === i),
          };
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

  const commonIcon = (component) => {
    if (!component) return;
    return (
      <Icon
        component={component}
        style={{ fontSize: 14, filter: 'grayscale(1) opacity(0.6)', marginRight: 2 }}
      />
    );
  };

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
      <Spin spinning={loading}>
        {!objectlist?.dbColumns?.length &&
        !objectlist?.dbObjects?.length &&
        !objectlist?.databases?.length ? (
          <div className={styles.objectlistBoxEmpty}>
            <Empty
              description={formatMessage({
                id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.939E5208',
                defaultMessage: '如果检索不到已存在的数据库对象，请先同步元数据',
              })}
            />
          </div>
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
                      <div className={styles.objectTypeTitle}>{DbObjectTypeMap[i.key].label}</div>
                      {i.data.length > ALL_TAB_MAX_LENGTH ? (
                        <Button
                          className={styles.objectTypeItemMore}
                          type="link"
                          onClick={() => setActiveKey(i.key)}
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
                            <div
                              className={styles.objectTypeItem}
                              onClick={(e) =>
                                isDatabase ? openSql(e, object) : openTree(e, object)
                              }
                              onMouseEnter={() => setActiveDatabase(object)}
                              onMouseLeave={() => setActiveDatabase(null)}
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
                              {isDatabase ? selectDbBtn(object) : permissionBtn(object, i.key)}
                            </div>
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

  const applyTablePermission = (e, object, type) => {
    e.stopPropagation();
    const dbObj = [DbObjectType.table, DbObjectType.external_table, DbObjectType.view]?.includes(
      type,
    )
      ? object
      : object?.dbObject;
    const params = {
      projectId: dbObj?.database?.project?.id,
      databaseId: dbObj?.database?.id,
      tableName: dbObj?.name,
      tableId: dbObj?.id,
    };
    modalStore.changeApplyTablePermissionModal(true, {
      ...params,
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  const hasPermission = (object) => {
    return (
      object?.database?.authorizedPermissionTypes?.length ||
      object?.dbObject?.database?.authorizedPermissionTypes?.length
    );
  };

  const permissionBtn = (object, type: DbObjectType) => {
    if (activeDatabase?.id !== object.id) return;
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
          onClick={(e) => applyTablePermission(e, object, type)}
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
        onClick={(e) => applyDbPermission(e, object)}
      >
        {formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.DB7526F7',
          defaultMessage: '申请库权限',
        })}
      </Button>
    );
  };

  const applyDbPermission = (e, db) => {
    e.stopPropagation();
    const dbObj = db?.dbObject?.database || db?.database || db;
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId: dbObj?.project?.id,
      databaseId: dbObj?.id,
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  const selectDbBtn = (object) => {
    if (activeDatabase?.id !== object.id) return null;
    if (!!object?.authorizedPermissionTypes?.length) {
      return (
        <Button
          type="link"
          style={{ padding: 0, height: 18, display: 'inline-block' }}
          onClick={(e) => {
            e.stopPropagation();
            setDatabase(object);
            setSearchKey('');
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
        onClick={(e) => applyDbPermission(e, object)}
      >
        {formatMessage({
          id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.64F32480',
          defaultMessage: '申请库权限',
        })}
      </Button>
    );
  };

  const openTree = (e, object) => {
    if (!hasPermission(object)) return;
    const type = object?.type || DbObjectType.column;
    e.stopPropagation();
    const databaseId = object?.dbObject?.database?.id || object?.database?.id;

    if (type === DbObjectType.external_table) {
      object.isExternalTable = true;
    }
    DbObjectTypeMap?.[type]?.openPage(object)(
      ...DbObjectTypeMap?.[type]?.getOpenTab(object, databaseId),
    );
    modalStore?.changeDatabaseSearchModalVisible(false);
    modalStore?.databaseSearchsSetExpandedKeysFunction?.(databaseId);
  };

  const openSql = (e, db) => {
    e.stopPropagation();
    modalStore?.databaseSearchsSetExpandedKeysFunction?.(db.id);
    modalStore?.changeDatabaseSearchModalVisible(false);
    db.id && openNewSQLPage(db.id, selectProjectId ? 'project' : 'datasource');
  };

  const renderObjectTypeTabs = (type) => {
    const currentObjectList = typeObjectTree?.find((i) => i.key === type);
    const isDatabasetab = currentObjectList.key === DbObjectType.database;
    return (
      <Spin spinning={loading}>
        {!currentObjectList?.data?.length ? (
          <div className={styles.objectlistBoxEmpty}>
            <Empty
              description={
                <>
                  <div>
                    {formatMessage({
                      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.6656C471',
                      defaultMessage: '暂无数据',
                    })}
                  </div>
                  {formatMessage({
                    id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.657DE57E',
                    defaultMessage: '如果检索不到已存在的数据库对象，请先同步元数据',
                  })}
                </>
              }
            />
          </div>
        ) : (
          <div className={styles.objectlistBox}>
            {currentObjectList?.data?.map((object) => {
              return (
                <div
                  className={styles.objectItem}
                  onClick={(e) => {
                    isDatabasetab ? openSql(e, object) : openTree(e, object);
                  }}
                  onMouseEnter={() => setActiveDatabase(object)}
                  onMouseLeave={() => setActiveDatabase(null)}
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
                        style={{ color: 'var(--brand-blue6-color)', paddingRight: 4, fontSize: 14 }}
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
                    ? selectDbBtn(object)
                    : permissionBtn(object, currentObjectList.key)}
                </div>
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
  ].concat(
    objectTypeConfig[dbType]?.map((i) => {
      if (i === DbObjectType.database && database) return;
      return {
        key: i,
        label: <span style={{ padding: '0 6px', margin: 0 }}>{DbObjectTypeMap?.[i]?.label}</span>,
        children: renderObjectTypeTabs(i),
      };
    }),
  );

  const handleChange = (key) => {
    setActiveKey(key);
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

export default ObjectList;
