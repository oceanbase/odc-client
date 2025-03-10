import { listDatabases } from '@/common/network/database';
import { useRequest } from 'ahooks';
import { listProjects } from '@/common/network/project';
import { getDataSourceGroupByProject } from '@/common/network/connection';
import { getDatabaseObject } from '@/common/network/database';
import login from '@/store/login';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { IDatasource } from '@/d.ts/datasource';
import { IProject } from '@/d.ts/project';
import { IDatabase, IDatabaseObject } from '@/d.ts/database';
import { IConnection, DbObjectType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { SEARCH_OBJECT_FROM_ALL_DATABASE } from '../constant';
import { getDataSourceModeConfig } from '@/common/datasource';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { isPhysicalDatabase } from '@/util/database';
import { isLogicalDatabase } from '@/util/database';

const useGlobalSearchData = (params: {
  project: IProject;
  dataSource: IConnection;
  database: IDatabase;
  modalStore: ModalStore;
  reset: () => void;
  activeKey: string;
}) => {
  const { project, dataSource, database, modalStore, reset, activeKey } = params;
  const [datasourceList, setDatasourceList] = useState<IDatasource[]>([]);
  const [projectList, setProjectList] = useState<IProject[]>([]);
  const [databaseList, setDatabaseList] = useState<IDatabase[]>([]);
  const [objectlist, setObjectlist] = useState<IDatabaseObject>();

  const { loading: projectLoading, run: fetchProject } = useRequest(listProjects, {
    defaultParams: [null, 1, 9999, false],
    manual: true,
  });

  const objectQueryType = useMemo(() => {
    switch (activeKey) {
      case DbObjectType.database:
        return 'SCHEMA';
      case SEARCH_OBJECT_FROM_ALL_DATABASE:
        return null;
      case DbObjectType.table:
        return [DbObjectType.logical_table, DbObjectType.table];
      default:
        return activeKey;
    }
  }, [activeKey]);

  const { loading: dataSourceLoading, run: fetchDatasource } = useRequest(
    getDataSourceGroupByProject,
    {
      defaultParams: [],
      manual: true,
    },
  );

  const { run: fetchDatabases, loading: databaseLoading } = useRequest(listDatabases, {
    manual: true,
  });

  const { run: fetchObject, loading: objectloading } = useRequest(getDatabaseObject, {
    manual: true,
  });

  const loadDatabaseList = useCallback(async () => {
    const data = await fetchDatabases(
      null,
      null,
      1,
      99999,
      null,
      null,
      login.isPrivateSpace(),
      true,
      true,
    );
    const databases = data?.contents?.filter((db: IDatabase) => {
      const config = getDataSourceModeConfig(db?.dataSource?.type);
      // 隐藏对象存储类型数据库
      if (isConnectTypeBeFileSystemGroup(db?.dataSource?.type)) {
        return false;
      }
      /**
       * feature filter
       */
      if (!config?.features?.resourceTree && isPhysicalDatabase(db)) {
        return;
      }
      return db.existed;
    });
    setDatabaseList(databases || []);
  }, []);

  const loadDatasourceList = useCallback(async () => {
    const data = await fetchDatasource();
    setDatasourceList(data?.contents || []);
  }, []);

  const loadProjectList = useCallback(async () => {
    const data = await fetchProject(null, 1, 99999, false);
    setProjectList(data?.contents || []);
  }, []);

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

  useEffect(() => {
    if (modalStore.databaseSearchModalVisible) {
      loadDatabaseList();
      loadDatasourceList();
      !login.isPrivateSpace() && loadProjectList();
    } else {
      reset();
    }
  }, [modalStore.databaseSearchModalVisible]);

  return {
    objectlist,
    datasourceList,
    projectList,
    databaseList,
    loadDatabaseList,
    loadDatasourceList,
    loadProjectList,
    loadDatabaseObject,
    projectLoading,
    dataSourceLoading,
    databaseLoading,
    objectloading,
  };
};

export default useGlobalSearchData;
