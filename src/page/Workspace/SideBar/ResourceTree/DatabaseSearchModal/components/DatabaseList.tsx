import { formatMessage } from '@/util/intl';
import { Button, Space } from 'antd';
import styles from '../index.less';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import React, { useState, useContext } from 'react';
import { IDatabase, IDatabaseObject } from '@/d.ts/database';
import { ModalStore } from '@/store/modal';
import { openNewSQLPage } from '@/store/helper/page';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import Icon from '@ant-design/icons';

interface Iprops {
  database: IDatabase;
  setDatabase: React.Dispatch<React.SetStateAction<IDatabase>>;
  databaseList: IDatabase[];
  objectlist: IDatabaseObject;
  searchKey: string;
  setSearchKey: React.Dispatch<React.SetStateAction<string>>;
  modalStore: ModalStore;
}

const DatabaseList = ({
  database,
  setDatabase,
  databaseList,
  searchKey,
  setSearchKey,
  modalStore,
  objectlist,
}: Iprops) => {
  const { selectDatasourceId, selectProjectId, projectList, datasourceList } =
    useContext(ResourceTreeContext);
  const [activeDatabase, setActiveDatabase] = useState<IDatabase>();

  const selectProject = projectList?.find((p) => p.id == selectProjectId);
  const selectDatasource = datasourceList?.find((d) => d.id == selectDatasourceId);

  const getOptions = () => {
    if (objectlist) {
      return objectlist.databases;
    }
    return [...databaseList].filter((i) =>
      i?.name?.toLowerCase().includes(searchKey?.toLowerCase() || ''),
    );
  };
  const options = getOptions();

  const changeDatabase = (e, item) => {
    if (!item?.authorizedPermissionTypes?.length) return;
    setDatabase(item);
    setSearchKey('');
  };

  const openSql = (e, db) => {
    e.stopPropagation();
    modalStore?.databaseSearchsSetExpandedKeysFunction?.(db.id);
    modalStore?.changeDatabaseSearchModalVisible(false);
    db.id && openNewSQLPage(db.id, selectProjectId ? 'project' : 'datasource');
  };

  const applyPermission = (e, db: IDatabase) => {
    e.stopPropagation();
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId: db?.project?.id,
      databaseId: db?.id,
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  const getDataSourceIcon = (type) => {
    const DBIcon = getDataSourceStyleByConnectType(type)?.icon;
    return (
      <Icon
        style={{
          color: 'var(--icon-color-disable)',
          filter: 'grayscale(1) opacity(0.6)',
          fontSize: 14,
        }}
        component={DBIcon.component}
      />
    );
  };

  const getPositioninButton = (db: IDatabase) => {
    if (activeDatabase?.id !== db.id) return;
    if (!db?.authorizedPermissionTypes?.length) {
      return (
        <Button type="link" style={{ padding: 0 }} onClick={(e) => applyPermission(e, db)}>
          {formatMessage({
            id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.DC41DDB8',
            defaultMessage: '申请库权限',
          })}
        </Button>
      );
    }
    return <span style={{ color: 'var(--text-color-hint)' }}>库内搜索</span>;
  };

  if (database && !searchKey) {
    return (
      <div className={styles.content}>
        <div className={styles.databaseItem} onClick={(e) => openSql(e, database)}>
          {`定位到数据库 "${database?.name}"`}
        </div>
      </div>
    );
  }
  return (
    <div className={styles.content}>
      <div className={styles.searchInfo}>
        {selectProject
          ? formatMessage(
              {
                id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.6D5791AB',
                defaultMessage: '当前项目：{selectProjectName}',
              },
              { selectProjectName: selectProject?.name },
            )
          : formatMessage(
              {
                id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.components.987D5B8A',
                defaultMessage: '当前数据源: {selectDatasourceName}',
              },
              { selectDatasourceName: selectDatasource?.name },
            )}
      </div>
      {options?.length
        ? options.map((db) => {
            return (
              <>
                <div
                  key={db.id}
                  onClick={(e) => changeDatabase(e, db)}
                  className={
                    database?.id === db?.id ? styles.databaseItemActive : styles.databaseItem
                  }
                  onMouseEnter={() => setActiveDatabase(db)}
                  onMouseLeave={() => setActiveDatabase(null)}
                >
                  <div
                    style={{
                      display: 'flex',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 410,
                    }}
                  >
                    <DataBaseStatusIcon item={db} />
                    <div style={{ padding: '0 4px' }}>{db?.name}</div>
                    <div className={styles.subInfo}>
                      {selectProjectId ? (
                        <Space align="center">
                          {getDataSourceIcon(db?.dataSource?.dialectType)}
                          {db?.dataSource?.name}
                        </Space>
                      ) : null}
                    </div>
                  </div>
                  {getPositioninButton(db)}
                </div>
              </>
            );
          })
        : null}
    </div>
  );
};

export default DatabaseList;
