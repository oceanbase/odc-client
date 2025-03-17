import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { getMapIdByDB } from '@/page/Workspace/SideBar/ResourceTree/helper';
import { isString } from 'lodash';

const TreeDataGroupKey = 'Group';
const TreeDataSecondGroupKey = 'SecondGroup';
const getGroupKey = (mapId: React.Key, groupMode: DatabaseGroup) =>
  `${TreeDataGroupKey}-${groupMode}-${mapId}`;
const getSecondGroupKey = (mapId: React.Key, secondMapId: number, groupMode: DatabaseGroup) =>
  `${TreeDataSecondGroupKey}-${groupMode}-${mapId}-${secondMapId}`;

enum NodeType {
  GroupNodeProject = 'GroupNodeProject',
  GroupNodeDataSource = 'GroupNodeDataSource',
  GroupNodeConnectType = 'GroupNodeConnectType',
  GroupNodeEnviponment = 'GroupNodeEnviponment',
  GroupNodeCluster = 'GroupNodeCluster',
  GroupNodeTenant = 'GroupNodeTenant',
  SecondGroupNodeDataSource = 'SecondGroupNodeDataSource',
  Database = 'Database',
  Connection = 'Connection',
}

const isGroupNode = (type) => {
  return [
    NodeType.GroupNodeProject,
    NodeType.GroupNodeCluster,
    NodeType.GroupNodeConnectType,
    NodeType.GroupNodeEnviponment,
    NodeType.GroupNodeTenant,
    NodeType.GroupNodeDataSource,
    NodeType.SecondGroupNodeDataSource,
  ].includes(type);
};

const GroupNodeToNodeType = {
  [DatabaseGroup.project]: NodeType.GroupNodeProject,
  [DatabaseGroup.dataSource]: NodeType.GroupNodeDataSource,
  [DatabaseGroup.tenant]: NodeType.GroupNodeTenant,
  [DatabaseGroup.cluster]: NodeType.GroupNodeCluster,
  [DatabaseGroup.environment]: NodeType.GroupNodeEnviponment,
  [DatabaseGroup.connectType]: NodeType.GroupNodeConnectType,
};

const getShouldExpandedGroupKeys = (params: {
  key: React.Key;
  type: NodeType;
  groupMode?: DatabaseGroup;
  databaseList: IDatabase[];
}) => {
  const { key, groupMode, databaseList, type } = params;
  if (groupMode === DatabaseGroup.none) return [];
  let shouldExpandedKeys: React.Key[] = [];
  let dbId: number;
  switch (type) {
    case NodeType.GroupNodeProject:
    case NodeType.GroupNodeDataSource:
    case NodeType.GroupNodeConnectType:
    case NodeType.GroupNodeEnviponment:
    case NodeType.GroupNodeCluster:
    case NodeType.GroupNodeTenant:
    case NodeType.SecondGroupNodeDataSource:
    case NodeType.Connection: {
      return [];
    }
    case NodeType.Database: {
      dbId = key as number;
    }
  }
  const db = databaseList?.find((item) => item.id === dbId);
  if (!db) return [];
  const { mapId } = getMapIdByDB(db, groupMode);
  const { mapId: secondMapId } = getMapIdByDB(db, DatabaseGroup.dataSource);
  shouldExpandedKeys.push(
    getGroupKey(mapId, groupMode),
    getSecondGroupKey(mapId, secondMapId, groupMode),
  );
  if ([DatabaseGroup.project, DatabaseGroup.dataSource, DatabaseGroup.tenant].includes(groupMode)) {
    shouldExpandedKeys = shouldExpandedKeys.filter((item) => {
      if (isString(item)) {
        return !item.includes(TreeDataSecondGroupKey);
      }
      return true;
    });
  }
  return shouldExpandedKeys;
};

const filterGroupKey = (keyList: React.Key[]) => {
  return keyList?.filter((item) => {
    if (
      isString(item) &&
      (item.includes(TreeDataGroupKey) || item.includes(TreeDataSecondGroupKey))
    ) {
      return false;
    }
    return true;
  });
};

export {
  filterGroupKey,
  NodeType,
  isGroupNode,
  GroupNodeToNodeType,
  getGroupKey,
  getSecondGroupKey,
  getShouldExpandedGroupKeys,
};
