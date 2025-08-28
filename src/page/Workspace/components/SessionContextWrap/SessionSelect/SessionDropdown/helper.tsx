import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { getMapIdByDB } from '@/page/Workspace/SideBar/ResourceTree/helper';
import { IConnection } from '@/d.ts';
import { isString } from 'lodash';
import StatusIcon from '@/component/StatusIcon/DataSourceIcon';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { ReactComponent as PjSvg } from '@/svgr/project_space.svg';
import Icon from '@ant-design/icons';

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

const DatabaseGroupArr = [
  DatabaseGroup.project,
  DatabaseGroup.dataSource,
  DatabaseGroup.tenant,
  DatabaseGroup.cluster,
  DatabaseGroup.environment,
  DatabaseGroup.connectType,
  DatabaseGroup.none,
];

const hasSecondGroup = (group: DatabaseGroup) => {
  return [
    DatabaseGroup.cluster,
    DatabaseGroup.environment,
    DatabaseGroup.connectType,
    DatabaseGroup.tenant,
  ].includes(group);
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
  if ([DatabaseGroup.project, DatabaseGroup.dataSource].includes(groupMode)) {
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

const getIcon = (params: { type: NodeType; dataSource?: IConnection; database?: IDatabase }) => {
  const { type, dataSource, database } = params;
  let icon;
  switch (type) {
    case NodeType.Connection:
    case NodeType.GroupNodeDataSource:
    case NodeType.SecondGroupNodeDataSource: {
      icon = dataSource && <StatusIcon item={dataSource} />;
      break;
    }
    case NodeType.Database: {
      icon = database && <DataBaseStatusIcon item={database} />;
      break;
    }
    case NodeType.GroupNodeProject: {
      icon = (
        <Icon
          component={PjSvg}
          style={{
            fontSize: 14,
          }}
        />
      );
      break;
    }
  }
  return icon ?? null;
};

export {
  filterGroupKey,
  NodeType,
  isGroupNode,
  GroupNodeToNodeType,
  DatabaseGroupArr,
  hasSecondGroup,
  getGroupKey,
  getSecondGroupKey,
  getShouldExpandedGroupKeys,
  getIcon,
};
