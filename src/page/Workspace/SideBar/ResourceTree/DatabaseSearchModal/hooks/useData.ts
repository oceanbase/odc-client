import { useRequest } from 'ahooks';
import { getDatabaseObject } from '@/common/network/database';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { IProject } from '@/d.ts/project';
import { IDatabase, IDatabaseObject } from '@/d.ts/database';
import { IConnection, DbObjectType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { SEARCH_OBJECT_FROM_ALL_DATABASE } from '../constant';
import { listDatabases } from '@/common/network/database';
import { isLogicalDatabase } from '@/util/database';
import { syncAll } from '@/common/network/database';
import login from '@/store/login';
import { getDataSourceModeConfig } from '@/common/datasource';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { isPhysicalDatabase } from '@/util/database';

const useGlobalSearchData = (params: {
  project: IProject;
  dataSource: IConnection;
  database: IDatabase;
  modalStore: ModalStore;
  activeKey: string;
}) => {
  const { project, dataSource, database, modalStore, activeKey } = params;
  const [objectlist, setObjectlist] = useState<IDatabaseObject>();
  const [databaseList, setDatabaseList] = useState<IDatabase[]>([]);

  const { run: fetchDatabases, loading: databaseLoading } = useRequest(listDatabases, {
    manual: true,
  });

  const loadDatabaseList = useCallback(async () => {
    const data = await fetchDatabases({
      page: 1,
      size: 99999,
      containsUnassigned: true,
      existed: true,
      includesPermittedAction: true,
    });
    const databases = data?.contents?.filter((db: IDatabase) => {
      const config = getDataSourceModeConfig(db?.dataSource?.type);
      // 隐藏对象存储类型数据库
      if (isConnectTypeBeFileSystemGroup(db?.dataSource?.type)) {
        return false;
      }
      /**
       * feature filter
       */
      if (!config?.features?.groupResourceTree && isPhysicalDatabase(db)) {
        return;
      }
      return db.existed;
    });
    setDatabaseList(databases || []);
  }, []);

  useEffect(() => {
    if (modalStore.databaseSearchModalVisible) {
      loadDatabaseList();
    }
  }, [modalStore.databaseSearchModalVisible]);

  const objectQueryType = useMemo(() => {
    switch (activeKey) {
      case DbObjectType.database:
        return 'SCHEMA';
      case SEARCH_OBJECT_FROM_ALL_DATABASE:
        return null;
      case DbObjectType.table:
        return [DbObjectType.logical_table, DbObjectType.table];
      case DbObjectType.synonym:
        // 同义词tab同时查询普通同义词和公共同义词
        return [DbObjectType.synonym, DbObjectType.public_synonym];
      default:
        return activeKey;
    }
  }, [activeKey]);

  const { run: fetchObject, loading: objectloading } = useRequest(getDatabaseObject, {
    manual: true,
  });

  const { loading: syncAllLoading, run: fetchSyncAll } = useRequest(syncAll, {
    manual: true,
  });

  const loadDatabaseObject = async (value) => {
    let dataSourceId;
    let projectId = project?.id;
    if (!projectId) {
      dataSourceId = dataSource?.id || database?.dataSource?.id;
    }
    if (!dataSourceId && isLogicalDatabase(database)) {
      projectId = database?.project?.id;
    }
    if (!projectId && !dataSourceId) return;
    const res = await fetchObject(projectId, dataSourceId, database?.id, objectQueryType, value);
    setObjectlist(res?.data);
  };

  return {
    objectlist,
    loadDatabaseObject,
    fetchSyncAll,
    objectloading,
    syncAllLoading,
    databaseLoading,
    databaseList,
  };
};

export default useGlobalSearchData;
