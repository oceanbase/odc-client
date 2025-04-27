import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IDatabase } from '@/d.ts/database';
import { listDatabases } from '@/common/network/database';
import { SearchType } from '../Header/Search';
import { IFilterParams } from '../ParamContext';
import ProjectContext from '../../ProjectContext';
import datasourceStatus from '@/store/datasourceStatus';
import tracert from '@/util/tracert';
import { useRequest } from 'ahooks';
import { listEnvironments } from '@/common/network/env';
import { ConnectType } from '@/d.ts';
import { DatabaseGroup } from '@/d.ts/database';
import { getGroupMapId, GroupKey, isGroupColumn } from '../help';
import { ProjectRole } from '@/d.ts/project';
import { getMapIdByDB } from '@/page/Workspace/SideBar/ResourceTree/helper';
import userStore from '@/store/login';

const useData = (id) => {
  const { project, setHasLoginDatabaseAuth } = useContext(ProjectContext);
  const [groupMode, setGroupMode] = useState(DatabaseGroup.none);
  const [filterParams, setFilterParams] = useState<IFilterParams>({
    environmentId: null,
    connectType: null,
    type: null,
  });
  const [data, setData] = useState<IDatabase[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedTempRowKeys, setSelectedTempRowKeys] = useState<React.Key[] | string[]>([]);
  const [visible, setVisible] = useState(false);
  /**
   * 修改管理员弹窗显示与隐藏
   */
  const [changeOwnerModalVisible, setChangeOwnerModalVisible] = useState(false);
  const [openLogicialDatabase, setOpenLogicialDatabase] = useState<boolean>(false);
  const [openObjectStorage, setOpenObjectStorage] = useState<boolean>(false);
  const [openManageLogicDatabase, setOpenManageLogicDatabase] = useState<boolean>(false);
  const [database, setDatabase] = useState<IDatabase>(null);
  const [searchValue, setSearchValue] = useState<{ value: string; type: SearchType }>({
    value: null,
    type: SearchType.DATABASE,
  });

  const { loading, run: fetchDatabases } = useRequest(listDatabases, {
    manual: true,
  });

  const { loading: fetchEnvLoading, data: envList } = useRequest(listEnvironments);

  const loadData = async (
    environmentId = filterParams?.environmentId,
    connectType = filterParams?.connectType,
    type = filterParams.type,
  ) => {
    const res = await fetchDatabases(
      parseInt(id),
      null,
      1,
      99999,
      searchValue.value,
      environmentId,
      null,
      null,
      true,
      type,
      connectType,
      searchValue.type === SearchType.DATASOURCE ? searchValue.value : null,
      searchValue.type === SearchType.CLUSTER ? searchValue.value : null,
      searchValue.type === SearchType.TENANT ? searchValue.value : null,
    );
    if (res) {
      datasourceStatus.asyncUpdateStatus(
        res?.contents
          ?.filter((item) => item.type !== 'LOGICAL' && !!item.dataSource?.id)
          ?.map((item) => item?.dataSource?.id),
      );
      setData(res?.contents);
      const hasLoginDatabaseAuth = res.contents?.some(
        (item) => !!item.authorizedPermissionTypes.length,
      );
      setHasLoginDatabaseAuth?.(hasLoginDatabaseAuth);
    }
  };

  function reload() {
    loadData();
  }

  const dataGroup = useMemo(() => {
    const environmentGroup: Map<number, { groupName: string; databases: IDatabase[] }> = new Map();
    const connectTypeGruop: Map<ConnectType, { groupName: string; databases: IDatabase[] }> =
      new Map();
    const datasourceGruop: Map<number, { groupName: string; databases: IDatabase[] }> = new Map();
    const clusterGroup: Map<string, { groupName: string; databases: IDatabase[] }> = new Map();
    const tenantGroup: Map<string, { groupName: string; databases: IDatabase[] }> = new Map();
    data?.forEach((db) => {
      const { environment, dataSource, connectType } = db;
      // 环境分组
      if (environment) {
        const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.environment);
        const environmentDatabases = environmentGroup.get(mapId) || {
          groupName,
          databases: [],
        };
        if (db.type === 'LOGICAL') {
          environmentDatabases.databases.unshift(db);
        } else {
          environmentDatabases.databases.push(db);
        }
        environmentGroup.set(mapId, environmentDatabases);
      }
      // 数据源分组
      if (db.type === 'LOGICAL' || dataSource) {
        const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.dataSource);
        const datasourceDatabases = datasourceGruop.get(mapId) || {
          groupName,
          databases: [],
        };
        if (db.type === 'LOGICAL') {
          datasourceDatabases.databases.unshift(db);
        } else {
          datasourceDatabases.databases.push(db);
        }
        datasourceGruop.set(mapId, datasourceDatabases);
      }
      // 类型分组
      if (connectType) {
        const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.connectType);
        const connectTypeDatabases = connectTypeGruop.get(mapId) || {
          groupName,
          databases: [],
        };
        if (db.type === 'LOGICAL') {
          connectTypeDatabases.databases.unshift(db);
        } else {
          connectTypeDatabases.databases.push(db);
        }
        connectTypeGruop.set(mapId, connectTypeDatabases);
      }
      // 集群分组
      {
        const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.cluster);
        const clusterDatabases = clusterGroup.get(mapId) || {
          groupName,
          databases: [],
        };
        if (db.type === 'LOGICAL') {
          clusterDatabases.databases.unshift(db);
        } else {
          clusterDatabases.databases.push(db);
        }
        clusterGroup.set(mapId, clusterDatabases);
      }
      // 租户分组
      {
        const { mapId, groupName, tip } = getMapIdByDB(db, DatabaseGroup.tenant);
        const tenantDatabases = tenantGroup.get(mapId) || {
          groupName,
          tip,
          databases: [],
        };
        if (db.type === 'LOGICAL') {
          tenantDatabases.databases.unshift(db);
        } else {
          tenantDatabases.databases.push(db);
        }
        tenantGroup.set(mapId, tenantDatabases);
      }
    });

    return {
      environmentGroup,
      datasourceGruop,
      connectTypeGruop,
      clusterGroup,
      tenantGroup,
    };
  }, [data]);

  const DatabaseGroupMap = {
    [DatabaseGroup.connectType]: dataGroup.connectTypeGruop,
    [DatabaseGroup.environment]: dataGroup.environmentGroup,
    [DatabaseGroup.dataSource]: dataGroup.datasourceGruop,
    [DatabaseGroup.cluster]: dataGroup.clusterGroup,
    [DatabaseGroup.tenant]: dataGroup.tenantGroup,
  };

  const treeData = useMemo(() => {
    if (groupMode === DatabaseGroup.none) {
      return data;
    } else {
      const treeData = [];
      const metaArr: {
        groupName: string;
        databases: IDatabase[];
        tip?: string;
      }[] = Array.from(DatabaseGroupMap[groupMode]?.values());
      for (let i = 0; i < metaArr?.length; i++) {
        treeData.push({
          name: metaArr[i].groupName,
          id: `${GroupKey}_${groupMode}_${i}`,
          tip: metaArr[i].tip,
          groudMapId: getGroupMapId(metaArr[i].databases[0], groupMode),
          children: metaArr[i].databases,
        });
      }
      return treeData;
    }
  }, [dataGroup, groupMode]);

  const initDialectType = useMemo(() => {
    return data?.find((_db) => _db?.id === selectedRowKeys?.[0])?.connectType;
  }, [selectedRowKeys[0]]);

  const disabledMultiDBChanges = useMemo(() => {
    if (!selectedRowKeys?.length) return false;
    return !selectedRowKeys?.every(
      (key) =>
        /* 当前数据库分页没有这一条数据 */
        !data?.find((_db) => _db?.id === key) ||
        /* 当前数据库分页有这一条数据且类型相同 */
        data?.find((_db) => _db?.id === key)?.connectType === initDialectType,
    );
  }, [selectedRowKeys, data]);

  const isOwner = project?.currentUserResourceRoles?.some((role) =>
    [ProjectRole.OWNER].includes(role),
  );

  const haveOperationPermission = useMemo(() => {
    return (
      project?.currentUserResourceRoles?.some((item) =>
        [ProjectRole.DBA, ProjectRole.OWNER].includes(item),
      ) || project?.creator?.id === userStore?.user?.id
    );
  }, [project?.currentUserResourceRoles]);

  const clearSelectedRowKeys = () => {
    setSelectedRowKeys([]);
    setSelectedTempRowKeys([]);
  };

  useEffect(() => {
    tracert.expo('a3112.b64002.c330858');
  }, []);

  useEffect(() => {
    loadData();
  }, [filterParams, searchValue]);

  useEffect(() => {
    setSelectedRowKeys(
      selectedTempRowKeys.filter((item) => {
        if (isGroupColumn(item)) {
          return false;
        }
        return true;
      }),
    );
  }, [selectedTempRowKeys]);

  useEffect(() => {
    // 切换分组类型时，需要把选中的分组key去掉
    setSelectedTempRowKeys(
      selectedTempRowKeys.filter((item) => {
        return !isGroupColumn(item);
      }),
    );
  }, [groupMode]);

  return {
    envList,
    fetchEnvLoading,
    loading,
    searchValue,
    setSearchValue,
    filterParams,
    setFilterParams,
    treeData,
    groupMode,
    setGroupMode,
    selectedRowKeys,
    selectedTempRowKeys,
    setSelectedTempRowKeys,
    visible,
    setVisible,
    changeOwnerModalVisible,
    setChangeOwnerModalVisible,
    openLogicialDatabase,
    setOpenLogicialDatabase,
    openObjectStorage,
    setOpenObjectStorage,
    openManageLogicDatabase,
    setOpenManageLogicDatabase,
    database,
    setDatabase,
    reload,
    disabledMultiDBChanges,
    isOwner,
    clearSelectedRowKeys,
    haveOperationPermission,
  };
};

export default useData;
