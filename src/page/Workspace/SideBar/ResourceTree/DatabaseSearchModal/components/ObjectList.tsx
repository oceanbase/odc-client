import {
  objectTypeConfig,
  DbObjectTypeMap,
  SEARCH_OBJECT_FROM_ALL_DATABASE,
  MAX_OBJECT_LENGTH,
} from '../constant';
import { Tabs, Divider, Button, Empty, Tooltip, Spin } from 'antd';
import styles from '../index.less';
import { DbObjectType } from '@/d.ts';
import { DbObjsIcon } from '@/constant';
import Icon from '@ant-design/icons';
import { useState } from 'react';
import { IDatabase, IDatabaseObject } from '@/d.ts/database';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { ModalStore } from '@/store/modal';

interface Iprops {
  database: IDatabase;
  objectlist: IDatabaseObject;
  activeKey: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
  modalStore: ModalStore;
  loading: boolean;
}

const ObjectList = ({
  database,
  objectlist,
  activeKey,
  setActiveKey,
  modalStore,
  loading,
}: Iprops) => {
  const [activeDatabase, setActiveDatabase] = useState<IDatabase>();
  const ALL_TAB_MAX_LENGTH = 3;
  const getTyepBlock = () => {
    const typeList =
      objectTypeConfig[database?.dataSource?.dialectType || SEARCH_OBJECT_FROM_ALL_DATABASE];
    const typeObjectTree = typeList?.map((i) => {
      if (i === DbObjectType.column) {
        return { key: i, data: objectlist?.dbColumns };
      } else {
        return { key: i, data: objectlist?.dbObjects?.filter((obj) => obj.type === i) };
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
        const { name: databaseName, dataSource } = database;
        const { name: dataSourceName, dialectType } = dataSource;
        const dialectTypeIcon = getDataSourceStyleByConnectType(dialectType)?.icon;
        const dbIcon = getDataSourceStyleByConnectType(dialectType)?.dbIcon;
        return (
          <>
            {datasourceIcon(dialectTypeIcon?.component)}
            <Tooltip title={dataSourceName}>{dataSourceName}</Tooltip>
            {divider}
            {commonIcon(dbIcon?.component)}
            <Tooltip title={databaseName}>{databaseName}</Tooltip>
            {divider}
            {commonIcon(DbObjsIcon[type])}

            <Tooltip title={tableName}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tableName}
              </span>
            </Tooltip>
          </>
        );
      default: {
        const { database } = item;
        const { name: databaseName, dataSource } = database;
        const { name: dataSourceName, dialectType } = dataSource;
        const dialectTypeIcon = getDataSourceStyleByConnectType(dialectType)?.icon;
        const dbIcon = getDataSourceStyleByConnectType(dialectType)?.dbIcon;
        return (
          <>
            {datasourceIcon(dialectTypeIcon?.component)}
            <Tooltip title={dataSourceName}>{dataSourceName}</Tooltip>
            {divider}
            {commonIcon(dbIcon?.component)}
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
        {!objectlist?.dbColumns?.length && !objectlist?.dbObjects?.length ? (
          <div className={styles.objectlistBoxEmpty}>
            <Empty />
          </div>
        ) : (
          <div className={styles.objectlistBox}>
            {typeObjectTree?.map((i) => {
              if (i?.data?.length) {
                return (
                  <div className={styles.objectTypeBox}>
                    <div className={styles.objectTypeTitle}>{DbObjectTypeMap[i.key].label}</div>
                    <div>
                      {i.data.map((object, index) => {
                        if (index < ALL_TAB_MAX_LENGTH) {
                          return (
                            <div
                              className={styles.objectTypeItem}
                              onClick={(e) => openTree(e, object)}
                              onMouseEnter={() => setActiveDatabase(object)}
                              onMouseLeave={() => setActiveDatabase(null)}
                            >
                              <div style={{ overflow: 'hidden', display: 'flex', width: '100%' }}>
                                <Icon
                                  component={DbObjsIcon[i?.key]}
                                  style={{
                                    color: 'var(--brand-blue6-color)',
                                    paddingRight: 4,
                                    fontSize: 14,
                                  }}
                                />
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
                              {permissionBtn(object)}
                            </div>
                          );
                        }
                      })}
                    </div>
                    {i.data.length > ALL_TAB_MAX_LENGTH ? (
                      <Button
                        className={styles.objectTypeItemMore}
                        type="link"
                        onClick={() => setActiveKey(i.key)}
                      >
                        查看更多
                      </Button>
                    ) : null}
                    <Divider
                      style={{
                        margin: '12px 0',
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

  const applyPermission = (e, object) => {
    e.stopPropagation();
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId: object?.dbObject?.database?.project?.id || object?.database?.project?.id,
      databaseId: object?.dbObject?.database?.id || object?.database?.id,
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  const hasPermission = (object) => {
    return (
      object?.database?.authorizedPermissionTypes?.length ||
      object?.dbObject?.database?.authorizedPermissionTypes?.length
    );
  };

  const permissionBtn = (object) => {
    if (activeDatabase?.id !== object.id) return;
    if (hasPermission) return;
    return (
      <Button
        type="link"
        style={{ padding: 0, height: 18, display: 'inline-block' }}
        onClick={(e) => applyPermission(e, object)}
      >
        申请表权限
      </Button>
    );
  };

  const openTree = (e, object) => {
    const type = object?.type || DbObjectType.column;
    e.stopPropagation();
    const databaseId = object?.dbObject?.database?.id || object?.database?.id;
    DbObjectTypeMap?.[type]?.openPage(object)(
      ...DbObjectTypeMap?.[type]?.getOpenTab(object, databaseId),
    );
    modalStore.changeDatabaseSearchModalVisible(false);
    modalStore.databseSearchsSetExpandedKeysFunction(databaseId);
  };

  const renderObjectTypeTabs = (type) => {
    const currentObjectList = typeObjectTree?.find((i) => i.key === type);
    return (
      <Spin spinning={loading}>
        {!currentObjectList?.data?.length ? (
          <div className={styles.objectlistBoxEmpty}>
            <Empty />
          </div>
        ) : (
          <div className={styles.objectlistBox}>
            {currentObjectList?.data?.map((object) => {
              return (
                <div
                  className={styles.objectItem}
                  onClick={(e) => openTree(e, object)}
                  onMouseEnter={() => setActiveDatabase(object)}
                  onMouseLeave={() => setActiveDatabase(null)}
                >
                  <div style={{ overflow: 'hidden', display: 'flex', width: '100%' }}>
                    <Icon
                      component={DbObjsIcon[type]}
                      style={{ color: 'var(--brand-blue6-color)', paddingRight: 4, fontSize: 14 }}
                    />
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
                  {permissionBtn(object)}
                </div>
              );
            })}
            {currentObjectList?.data?.length === MAX_OBJECT_LENGTH && (
              <Divider plain>
                <span style={{ color: 'var(--icon-color-disable)' }}>最多展示 1000 条结果</span>
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
    objectTypeConfig[database?.dataSource?.dialectType || SEARCH_OBJECT_FROM_ALL_DATABASE]?.map(
      (i) => {
        return {
          key: i,
          label: <span style={{ padding: '0 6px', margin: 0 }}>{DbObjectTypeMap?.[i]?.label}</span>,
          children: renderObjectTypeTabs(i),
        };
      },
    ),
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
