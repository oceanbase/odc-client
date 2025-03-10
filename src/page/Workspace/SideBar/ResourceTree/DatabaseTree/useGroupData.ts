import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { useContext, useMemo } from 'react';
import { getMapIdByDB, GroupWithDatabases, GroupWithSecondGroup } from '../helper';
import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { ConnectType } from '@/d.ts';
import { getDataSourceModeConfig } from '@/common/datasource';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { isPhysicalDatabase } from '@/util/database';

const useGroupData = (databaseList: IDatabase[]) => {
  const dataGroup = useMemo(() => {
    const environmentGroup: Map<number, GroupWithSecondGroup[DatabaseGroup.environment]> =
      new Map();
    const connectTypeGruop: Map<ConnectType, GroupWithSecondGroup[DatabaseGroup.connectType]> =
      new Map();
    const datasourceGruop: Map<number, GroupWithDatabases[DatabaseGroup.dataSource]> = new Map();
    const clusterGroup: Map<string, GroupWithSecondGroup[DatabaseGroup.cluster]> = new Map();
    const projectGroup: Map<number, GroupWithDatabases[DatabaseGroup.project]> = new Map();
    const tenantGroup: Map<string, GroupWithDatabases[DatabaseGroup.tenant]> = new Map();
    const allDatabases: Map<number, IDatabase> = new Map();
    databaseList
      ?.filter((db: IDatabase) => {
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
      })
      .forEach((db) => {
        const { environment, dataSource, connectType, project } = db;
        const { clusterName, tenantName } = dataSource || {};
        allDatabases.set(db.id, db);
        // 项目分组
        if (project) {
          const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.project);
          const projectDatabases: GroupWithDatabases[DatabaseGroup.project] = projectGroup.get(
            mapId,
          ) || {
            groupName,
            databases: [],
            mapId,
          };
          if (db.type === 'LOGICAL') {
            projectDatabases.databases.unshift(db);
          } else {
            projectDatabases.databases.push(db);
          }
          projectGroup.set(mapId, projectDatabases);
        }
        // 数据源分组
        if (db.type === 'LOGICAL' || dataSource) {
          const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.dataSource);
          const datasourceDatabases: GroupWithDatabases[DatabaseGroup.dataSource] =
            datasourceGruop.get(mapId) || {
              groupName,
              databases: [],
              mapId,
            };
          if (db.type === 'LOGICAL') {
            datasourceDatabases.databases.unshift(db);
          } else {
            datasourceDatabases.databases.push(db);
          }
          datasourceGruop.set(mapId, datasourceDatabases);
        }
        // 环境分组
        if (environment) {
          const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.environment);
          const environmentDatabases: GroupWithSecondGroup[DatabaseGroup.environment] =
            environmentGroup.get(mapId) || {
              groupName,
              mapId,
              secondGroup: new Map(),
            };
          const { mapId: secondGroupMapId, groupName: secondGroupgroupName } = getMapIdByDB(
            db,
            DatabaseGroup.dataSource,
          );
          const secondGroupDatabase: GroupWithDatabases[DatabaseGroup.dataSource] =
            environmentDatabases.secondGroup.get(secondGroupMapId) || {
              databases: [],
              groupName: secondGroupgroupName,
              mapId: secondGroupMapId,
            };
          if (db.type === 'LOGICAL') {
            secondGroupDatabase.databases.unshift(db);
          } else {
            secondGroupDatabase.databases.push(db);
          }
          environmentDatabases.secondGroup.set(secondGroupMapId, secondGroupDatabase);
          environmentGroup.set(mapId, environmentDatabases);
        }
        // 类型分组
        if (connectType) {
          const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.connectType);
          const connectTypeDatabases: GroupWithSecondGroup[DatabaseGroup.connectType] =
            connectTypeGruop.get(mapId) || {
              groupName,
              mapId,
              secondGroup: new Map(),
            };
          const { mapId: secondGroupMapId, groupName: secondGroupgroupName } = getMapIdByDB(
            db,
            DatabaseGroup.dataSource,
          );
          const secondGroupDatabase: GroupWithDatabases[DatabaseGroup.dataSource] =
            connectTypeDatabases.secondGroup.get(secondGroupMapId) || {
              databases: [],
              groupName: secondGroupgroupName,
              mapId: secondGroupMapId,
            };
          if (db.type === 'LOGICAL') {
            secondGroupDatabase.databases.unshift(db);
          } else {
            secondGroupDatabase.databases.push(db);
          }
          connectTypeDatabases.secondGroup.set(secondGroupMapId, secondGroupDatabase);
          connectTypeGruop.set(mapId, connectTypeDatabases);
        }
        // 集群分组
        {
          const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.cluster);
          const clusterDatabases: GroupWithSecondGroup[DatabaseGroup.cluster] = clusterGroup.get(
            mapId,
          ) || {
            groupName,
            mapId,
            secondGroup: new Map(),
          };
          const { mapId: secondGroupMapId, groupName: secondGroupgroupName } = getMapIdByDB(
            db,
            DatabaseGroup.dataSource,
          );
          const secondGroupDatabase: GroupWithDatabases[DatabaseGroup.dataSource] =
            clusterDatabases.secondGroup.get(secondGroupMapId) || {
              databases: [],
              groupName: secondGroupgroupName,
              mapId: secondGroupMapId,
            };
          if (db.type === 'LOGICAL') {
            secondGroupDatabase.databases.unshift(db);
          } else {
            secondGroupDatabase.databases.push(db);
          }
          clusterDatabases.secondGroup.set(secondGroupMapId, secondGroupDatabase);
          clusterGroup.set(mapId, clusterDatabases);
        }
        // 租户分组
        {
          const { mapId, groupName } = getMapIdByDB(db, DatabaseGroup.tenant);
          const tenantDatabases: GroupWithDatabases[DatabaseGroup.tenant] = tenantGroup.get(
            mapId,
          ) || {
            groupName,
            mapId,
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
      projectGroup,
      allDatabases,
      tenantGroup,
    };
  }, [databaseList]);

  const DatabaseGroupMap = {
    [DatabaseGroup.none]: dataGroup.allDatabases,
    [DatabaseGroup.connectType]: dataGroup.connectTypeGruop,
    [DatabaseGroup.environment]: dataGroup.environmentGroup,
    [DatabaseGroup.dataSource]: dataGroup.datasourceGruop,
    [DatabaseGroup.cluster]: dataGroup.clusterGroup,
    [DatabaseGroup.project]: dataGroup.projectGroup,
    [DatabaseGroup.tenant]: dataGroup.tenantGroup,
  };

  return {
    DatabaseGroupMap,
  };
};

export default useGroupData;
