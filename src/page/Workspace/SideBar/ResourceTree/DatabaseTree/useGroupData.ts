import { useMemo } from 'react';
import { getMapIdByDB, GroupWithDatabases, GroupWithSecondGroup } from '../helper';
import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { ConnectType, IConnection } from '@/d.ts';

interface IProps {
  databaseList: IDatabase[];
  datasourceList?: IConnection[];
  filter?: (db: IDatabase) => boolean;
}
const useGroupData = (props: IProps) => {
  const { databaseList, datasourceList, filter } = props;
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
    const filteredList = filter ? databaseList?.filter(filter) : databaseList;
    const allDatasources: IConnection[] = [];
    if (datasourceList) {
      datasourceList.forEach((item) => {
        datasourceGruop.set(item.id, {
          databases: [],
          dataSource: item,
          groupName: item?.name,
          mapId: item?.id,
        });
      });
    }
    filteredList?.forEach((db) => {
      const { environment, dataSource, connectType, project } = db;
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
            dataSource: dataSource,
            groupName,
            databases: [],
            mapId,
          };
        if (db.type === 'LOGICAL') {
          datasourceDatabases.databases.unshift(db);
        } else {
          datasourceDatabases.databases.push(db);
        }
        if (!datasourceGruop.has(mapId) && db.type !== 'LOGICAL') {
          allDatasources.push(dataSource);
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
      allDatasources,
    };
  }, [databaseList, filter, datasourceList]);

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
    allDatasources: dataGroup.allDatasources,
  };
};

export default useGroupData;
