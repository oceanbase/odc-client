import { Button } from 'antd';
import styles from '../index.less';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import React, { useState, useContext } from 'react';
import { IDatabase, IDatabaseObject } from '@/d.ts/database';
import { ModalStore } from '@/store/modal';

interface Iprops {
  database: IDatabase;
  setDatabase: React.Dispatch<React.SetStateAction<IDatabase>>;
  databaseList: IDatabase[];
  objectlist: IDatabaseObject;
  setSelectDatabaseState: React.Dispatch<React.SetStateAction<boolean>>;
  searchKey: string;
  setSearchKey: React.Dispatch<React.SetStateAction<string>>;
  isSelectAll: boolean;
  setSelectAllState: React.Dispatch<React.SetStateAction<boolean>>;
  modalStore: ModalStore;
}

const DatabaseList = ({
  database,
  setDatabase,
  databaseList,
  setSelectDatabaseState,
  searchKey,
  setSearchKey,
  isSelectAll,
  setSelectAllState,
  modalStore,
  objectlist,
}: Iprops) => {
  const { selectProjectId } = useContext(ResourceTreeContext);
  const [activeDatabase, setActiveDatabase] = useState<IDatabase>();

  const getOptions = () => {
    if (objectlist) {
      return objectlist.databases;
    }
    return [...databaseList].filter((i) =>
      i?.name?.toLowerCase().includes(searchKey?.toLowerCase() || ''),
    );
  };
  const options = getOptions();

  const changeDatabase = (item) => {
    setDatabase(item);
    setSelectDatabaseState(true);
    setSearchKey('');
    setSelectAllState(false);
  };

  const selectAll = () => {
    setDatabase(null);
    setSelectDatabaseState(false);
    setSearchKey('');
    setSelectAllState(true);
  };

  const openSql = (e, db) => {
    e.stopPropagation();
    modalStore.databseSearchsSetExpandedKeysFunction(db.id);
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  const applyPermission = (e, db: IDatabase) => {
    e.stopPropagation();
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId: db?.project?.id,
      databaseId: db?.id,
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  const getPositioninButton = (db: IDatabase) => {
    if (activeDatabase?.id !== db.id) return null;
    if (!!db?.authorizedPermissionTypes?.length) {
      return (
        <Button type="link" style={{ padding: 0 }} onClick={(e) => openSql(e, db)}>
          打开 SQL 窗口
        </Button>
      );
    }
    return (
      <Button type="link" style={{ padding: 0 }} onClick={(e) => applyPermission(e, db)}>
        权限库申请
      </Button>
    );
  };

  return (
    <div className={styles.content}>
      <div
        className={isSelectAll ? styles.databaseItemActive : styles.databaseItem}
        onClick={selectAll}
      >
        全部数据库
      </div>
      {options.length
        ? options.map((db) => {
            return (
              <>
                <div
                  key={db.id}
                  onClick={() => changeDatabase(db)}
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
                      {selectProjectId ? db?.dataSource?.name : null}
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
